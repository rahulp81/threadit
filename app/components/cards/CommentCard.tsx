"use client"
import { addCommentToThread, toggleThreadLike } from '@/lib/actions/thread.actions'
import formatRepostedTime, { formatTimeAgo } from '@/lib/dateFormat'
import Image from 'next/image'
import Link from 'next/link'
import React, { useRef, useState } from 'react'
import { Textarea } from '../ui/textarea'
import useAutosizeTextArea from '@/lib/customHooks/useAutoSizeTextArea'
import LoadingSpinner from '../shared/LoadingSpinner'
import { usePathname } from 'next/navigation'

function CommentCard({ threadId, comment, currentUser_Id, currentUser, isReply,mainThreadId }: {
    comment: any, currentUser_Id: string, currentUser: string,
    isReply?: boolean, threadId: string, mainThreadId : string,
}) {
    const [like, setLike] = useState(comment.likes?.includes(currentUser) || false)
    const [replyText, setReplyText] = useState('')
    const likeDebounceRef = useRef<NodeJS.Timeout>();
    const [replyBoxActive, setReplyBoxActive] = useState(false);
    const prevLike = useRef<boolean>();
    const counter = useRef(0);
    const [loading, setLoading] = useState(false);

    const pathname = usePathname();

    const commentRef = useRef<HTMLTextAreaElement>(null)
    useAutosizeTextArea(commentRef.current, replyText);

    const toggleLike = async () => {
        try {
            prevLike.current = like;
            clearTimeout(likeDebounceRef.current)
            setLike(!like)
            likeDebounceRef.current = setTimeout(async () => {
                const res = await toggleThreadLike({ currentLikeStatus: like, likeActionBy: currentUser, threadId: comment._id })
                console.log(res);
            }, 1000);
        } catch (error) {
            setLike(prevLike.current!)
            console.error('toggle like :', error)
        }
    }

    const addReply = async () => {
        try {
            console.log( 'main is : ', mainThreadId , threadId, replyText, currentUser_Id, pathname)
            await addCommentToThread(
                mainThreadId, threadId, replyText, currentUser_Id, pathname
            )
            setReplyText('');
            setReplyBoxActive(false);
        } catch (error) {
            console.error(error)
            alert(error)
        }
    }


    return (
        <div className={`${isReply ? 'py-1' : 'py-2.5'} `}>
            <div className={`w-full flex  gap-2`}>
                <div className="flex flex-col items-center">
                    <Link href={`/profile/${comment.author.id}`} className='h-10 w-10 flex justify-center items-center '>
                        <Image
                            src={comment.author.image}
                            alt='user_community_image'
                            height={30}
                            width={30}
                            className='cursor-pointer rounded-full'
                        />
                    </Link>
                    {comment.comments?.length > 0 &&
                        <div className='thread-card_bar mt-1 -mb-2.5 ' />
                    }
                </div>
                <div className='flex flex-col w-full gap-0.5 '>
                    <div className="flex gap-2 w-full">
                        <Link href={`/profile/${comment.author.id}`}
                            className='cursor-pointer hover:underline text-base-semibold text-light-1 flex flex-col gap-1.5'>
                            {comment.author.username}
                        </Link>
                        <span className='text-light-3 text-[13px]'>·</span>
                        <span className='text-light-3 text-[13px]' >{formatRepostedTime(comment.createdAt) + ' ago'}</span>

                        <div className="ml-auto ">
                            {/*   TODO : Change parentId logic inside
                <DeleteThread
                threadId={thread.id}
                currentUserId={currentUserId}
                authorId={thread.author.id}
                parentId={thread.parentId}
                isComment={isComment}
              /> */}
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5  max-w-full">
                        <Link href={`/thread/comment/${comment._id}`} className="text-light-1 text-[15px] break-all">
                            {comment.text}
                        </Link>
                        <div className={` mt-2 flex gap-3 `}>
                            <button onClick={() => toggleLike()}>
                                <Image
                                    src={`/assets/heart-${like ? 'filled' : 'gray'}.svg`}
                                    alt='heart'
                                    width={24}
                                    height={24}
                                    className='cursor-pointer object-contain'
                                />
                            </button>
                            <button onClick={() => setReplyBoxActive(true)} >
                                <Image
                                    src='/assets/reply.svg'
                                    alt='reply'
                                    width={24}
                                    height={24}
                                    className='cursor-pointer object-contain'
                                />
                            </button>
                        </div>
                    </div>
                    {(comment.comments?.length > 0 || comment.likes?.length > 0) &&
                        <div className='flex items-center gap-2 -mt-2'>
                            <Link href={`/thread/comment/${comment._id}`} className='flex gap-2 mt-1.5 text-gray-1 text-[14px] items-center '>
                                {comment.comments?.length > 0 && (
                                    <p className=' text-gray-1 hover:underline' >
                                        {comment.comments.length} Repl{comment.comments.length > 1 ? "ies" : "y"}
                                    </p>)
                                }
                                {
                                    comment.comments?.length > 0 && comment.likes?.length > 0 &&
                                    <span>·</span>
                                }
                                {comment.likes?.length > 0 && (
                                    <p className=' text-gray-1'>
                                        {comment.likes.length} Like{comment.likes.length! > 1 && 's'}
                                    </p>
                                )}
                            </Link>
                        </div>
                    }
                    {replyBoxActive &&
                        <div className='flex  items-center gap-2 mt-2  '>
                            <div className='thread-card_bar mt-0 h-full grow-0' />
                            <div className='w-full border-light-3 border flex gap-1 flex-col rounded'>
                                <Textarea
                                    value={replyText}
                                    onChange={(e) => { setReplyText(e.target.value) }}
                                    className="bg-black border-none text-white resize-none outline-none  overflow-hidden min-h-0 "
                                    ref={commentRef}
                                    placeholder='Reply'
                                />
                                <div className='ml-auto flex gap-2 flex-wrap p-1'>
                                    <button disabled={replyText.length < 1} type='button' className=' max-w-[100px] text-white text-[14px] px-4  rounded-2xl py-1
                                     bg-primary-500' onClick={() => addReply()}>
                                        {loading ? <LoadingSpinner /> : 'Reply'}
                                    </button>
                                    <button type='button' className=' max-w-[100px] text-white text-[14px] bg-light-4 px-4 py-1
                                    rounded-2xl' onClick={() => { setReplyText(''); setReplyBoxActive(false) }}  >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    }
                    {
                        comment.comments?.length > 0 && !isReply &&
                        <ul className='flex flex-col pt-3 gap-1 w-full'>
                            {
                                comment.comments.map((reply: any) =>
                                    <li key={reply._id}>
                                        <CommentCard threadId={reply._id} isReply comment={reply} currentUser={currentUser} 
                                        currentUser_Id={currentUser_Id} mainThreadId={mainThreadId} />
                                    </li>
                                )
                            }
                        </ul>
                    }
                </div>
            </div>
        </div>
    )
}

export default CommentCard
