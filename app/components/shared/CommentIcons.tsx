"use client"
import { toggleThreadLike } from '@/lib/actions/thread.actions'
import Image from 'next/image'
import Link from 'next/link'
import React, { useRef, useState } from 'react'

function CommentIcons({ isLiked, currentUserId, id, commentCount, likeCount }: {
    isLiked: boolean, currentUserId: string, id: string,commentCount: number, likeCount: number
}) {
    const [like, setLike] = useState(isLiked || false)
    const prevLike = useRef<boolean>()
    const likeDebounceRef = useRef<NodeJS.Timeout>();

    const toggleLike = async () => {
        try {
            prevLike.current = like;
            clearTimeout(likeDebounceRef.current)
            setLike(!like)
            likeDebounceRef.current = setTimeout(async () => {
                const res = await toggleThreadLike({ currentLikeStatus: like, likeActionBy: currentUserId, threadId: id })
                console.log(res);
            }, 1000);
        } catch (error) {
            setLike(prevLike.current!)
            console.error('toggle like :', error)
        }
    }

    return (
        <div className={` mt-3 flex flex-col `}>
            <div className='flex gap-3.5'>
                <button onClick={() => toggleLike()}>
                    <Image
                        src={`/assets/heart-${like ? 'filled' : 'gray'}.svg`}
                        alt='heart'
                        width={24}
                        height={24}
                        className='cursor-pointer object-contain'
                    />
                </button>
                <Link href={`/thread/${id}`}>
                    <Image
                        src='/assets/reply.svg'
                        alt='heart'
                        width={24}
                        height={24}
                        className='cursor-pointer object-contain'
                    />
                </Link>
                <Link href={`/create-thread/repost/${id}`}>
                    <Image
                        src='/assets/repost.svg'
                        alt='heart'
                        width={24}
                        height={24}
                        className='cursor-pointer object-contain'
                    />
                </Link>
                <Image
                    src='/assets/quote.svg'
                    alt='heart'
                    width={24}
                    height={24}
                    className='cursor-pointer object-contain '
                />
                <Image
                    src='/assets/share.svg'
                    alt='heart'
                    width={24}
                    height={24}
                    className='cursor-pointer object-contain'
                />
            </div>

            <Link href={`/thread/${id}`} className='flex gap-3 mt-1.5'>
                {commentCount  > 0 && (
                    <p className=' text-subtle-medium text-gray-1'>
                        {commentCount} repl{commentCount > 1 ? "ies" : "y"}
                    </p>)}
                {likeCount > 0 && (
                    <p className=' text-subtle-medium text-gray-1'>
                        {likeCount} like{likeCount > 1 && 's'}
                    </p>)}
            </Link>

        </div>
    )
}

export default CommentIcons