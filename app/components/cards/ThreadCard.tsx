"use client"
import { fetchThreadById, repostThread, toggleThreadLike } from "@/lib/actions/thread.actions";
import { fetchUserName } from "@/lib/actions/user.actions";
import CommentIcons from "../shared/CommentIcons";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import DeleteThread from "../forms/DeleteThread";
import formatTime from "@/lib/dateFormat.js";
import { Dialog, DialogContent } from "@/components/ui/Image-Dialog";
import LoadingSpinner from "../shared/LoadingSpinner";
import QouteThreadDialog from "../shared/QouteThreadDialog";

// interface Props {
//   id: string;
//   currentUserId: string;
//   parentId: string | null;
//   content: string;
//   author: {
//     name: string;
//     _id: string;
//     image: string;
//     id: string;
//   };
//   community: {
//     id: string;
//     name: string;
//     image: string;
//   } | null;
//   createdAt: string;
//   comments: any[];
//   isComment?: boolean;
//   isLiked?: boolean;
//   likeCount?: number | null;
//   media: {
//     mediaType: string,
//     mediaLink: string[],
//   }
//   isRepost?: {
//     repostedByUsername: string,
//     repostedAt: Date
//   }
// }

// issue plauging with hydariton error is because of falt icons
// Array(thread.media?.mediaLink?.length).fill(true)

function ThreadCard({
  thread, isComment, currentUserId, threadPage, CurrentUser_ID, isRepost, isQoute, isQouteThread
}: {
  thread: any, isComment?: boolean, currentUserId: string, threadPage?: boolean, CurrentUser_ID: string, isRepost?: string, isQoute?: any,
  isQouteThread?: boolean
}) {
  const [currentImage, setCurrentImage] = useState(0);
  const [imgLoading, setImgLoading] = useState(Array(thread.media?.mediaLink?.length).fill(true));
  const [open, setOpen] = useState(false)
  const [openQoute, setOpenQoute] = useState(false)
  const [like, setLike] = useState(thread.likes?.includes(currentUserId) || false)
  const [mounted, setMounted] = useState(false)
  const length = thread.media?.mediaLink?.length
  const likeDebounceRef = useRef<NodeJS.Timeout>();
  const prevLike = useRef<boolean>();
  const counter = useRef(0);

  const nextSlide = () => {
    setCurrentImage(currentImage === length - 1 ? 0 : currentImage + 1);
  };

  const prevSlide = () => {
    setCurrentImage(currentImage === 0 ? length - 1 : currentImage - 1);
  };

  const toggleLike = async () => {
    try {
      prevLike.current = like;
      clearTimeout(likeDebounceRef.current)
      setLike(!like)
      likeDebounceRef.current = setTimeout(async () => {
        console.log({ currentLikeStatus: like, likeActionBy: currentUserId, threadId: thread._id });
        const res = await toggleThreadLike({ currentLikeStatus: like, likeActionBy: currentUserId, threadId: thread._id })
        console.log(res);
      }, 1000);
    } catch (error) {
      setLike(prevLike.current!)
      console.error('toggle like :', error)
    }
  }

  // useEffect(() => {
  //   setMounted(true)
  // }, [])

  // if (!mounted) {
  //   return <p className="text-white">ok </p>
  // }


  if (!!thread?.isRepost) {
    return <ThreadCard CurrentUser_ID={CurrentUser_ID} currentUserId={currentUserId} thread={thread?.isRepost}
      isRepost={thread.author.username} />
  }

  if (!!thread?.isQuote && !isQouteThread) {
    console.log('isQoute', thread.isQuote)
    return <ThreadCard CurrentUser_ID={CurrentUser_ID} currentUserId={currentUserId} thread={thread}
      isQoute={thread.isQuote} isQouteThread />
  }

  console.log(thread)

  return (
    <article className={`bg-dark-2 rounded-3xl border border-dark-4  flex flex-col w-full ${threadPage ? 'max-w-screen-xl' :
      'max-w-screen-md'} p-3 lg:p-5 relative`}>
      {
        isRepost &&
        <div className="text-[14px] text-light-4 flex gap-2 mb-1.5 ">
          <img src="/assets/repost.svg" alt="repost" width={22} height={22} />
          <Link className="hover:underline" href={`/thread/${thread._id}`}>{isRepost}</Link>
          <p>Reposted</p>
        </div>
      }
      {
        (!isComment && thread.community) && (
          <Link
            href={`/communities/${thread.community.id}`}
            className='-mt-2 py-1 mb-1 flex gap-2 text-[13px]  items-center max-w-fit hover:underline text-light-2'
          >
            <Image
              src={thread.community.image || '/assets/community.svg'}
              alt={thread.community.name}
              width={25}
              height={25}
              className='-ml-1 rounded-full object-cover'
            />
            <span>{thread.community.name} Community</span>
          </Link>
        )
      }
      <div className='flex w-full  flex-row gap-3 '>
        <div className="flex flex-col items-center">
          <Link href={`/profile/${thread.author.id}`} className='h-10 w-10'>
            <Image
              src={thread.author.image}
              alt='user_community_image'
              height={40}
              width={40}
              className='cursor-pointer rounded-full'
            />
          </Link>
          {
            thread.comments?.length > 0 &&
            <>
              <div className='thread-card_bar' />
              {thread.comments?.length > 0 && (
                <div className='mt-1 mb-1 flex items-center'>
                  {thread.comments?.slice(0, 2).map((comment: any, index: number) => (
                    <Image
                      key={index}
                      src={comment.author.image}
                      alt={`user_${index}`}
                      width={20}
                      height={20}
                      className={`${index !== 0 && "-ml-3"} rounded-full object-cover`}
                    />
                  ))}
                </div>
              )}
            </>
          }
        </div>

        <div className='flex flex-col w-full gap-0.5  '>
          <div className="flex gap-3 w-full">
            <Link href={`/profile/${thread.author.id}`}
              className='cursor-pointer max-w-fit hover:underline text-base-semibold text-light-1 flex flex-col gap-1.5'>
              <p>{thread.author.username}</p>
            </Link>
            <div className=" text-light-3 text-[14px] ml-auto mt-0.5 flex gap-0.5">
              <span>{formatTime(thread.createdAt)}</span>
              {/* TODO : Change parentId logic inside */}
              {
                <DeleteThread
                  threadId={thread._id}
                  currentUserId={CurrentUser_ID}
                  authorId={thread.author._id}
                  parentId={thread.parentId}
                  isComment={isComment}
                  isCommunityPost={!!thread?.community}
                  isModerator={!!thread?.community ? (thread.community?.moderators?.includes(CurrentUser_ID) ||
                    thread.community.createdBy == CurrentUser_ID) : null}
                  isPostOfModerator={thread.community?.moderators ? (thread.community.moderators.includes(thread.author._id) ||
                    thread.community.createdBy == thread.author._id) : null}
                />
              }
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <Link href={`/thread/${thread._id}`}>
              <p className="text-light-1 text-[15px]">
                {thread.text}
              </p>
            </Link>
            {isQouteThread &&
              <div className="border border-light-4  rounded-xl">
                <ThreadCard CurrentUser_ID={CurrentUser_ID} currentUserId={currentUserId} thread={isQoute} />
              </div>
            }

            {
              <div className='flex w-full flex-col '>
                {
                  !!thread.media?.mediaType && (thread.media.mediaType == 'Video') &&
                  <div className="mt-3 ">
                    <video src={thread.media.mediaLink[0]} className="max-h-[500px] min-h-[250px] w-full rounded-xl object-cover" controls
                    />
                  </div>
                }

                {!!thread.media?.mediaType && (thread.media.mediaType == 'Image' || thread.media.mediaType == 'Gif') &&
                  thread.media?.mediaLink?.length == 1 &&
                  <div className="mt-3 ">
                    <img src={thread.media.mediaLink[0]} className="rounded-xl" alt="content"
                      onClick={() => setOpen(true)} />
                  </div>
                }

                {thread.media?.mediaLink?.length > 1 &&
                  <div className='slider mt-3 '>
                    {!(currentImage == 0) &&
                      <button className="left-arrow " onClick={() => prevSlide()} >
                        <span><Image src={'/assets/left.svg'} className="shadow-inner" alt="left" height={40} width={40} />
                        </span></button>
                    }
                    {!(currentImage == thread.media.mediaLink.length - 1) &&
                      <button className="right-arrow" onClick={() => nextSlide()} >
                        <Image src={'/assets/right.svg'} className="shadow-inner" alt="right" height={40} width={40} /></button>
                    }

                    {thread.media?.mediaLink?.map((link: string, index: number) => {
                      return (
                        <div
                          className={`${index === currentImage ? 'slide active' : 'slide'} relative`}
                          key={index}
                        >
                          {
                            index === currentImage && (
                              <>
                                {imgLoading[index] && currentImage !== 0 && <div className="absolute top-[50%] " ><LoadingSpinner /></div>}
                                <img alt='content' className={`image
                                transition-opacity duration-300`} onClick={() => setOpen(true)}
                                  onLoad={() => setImgLoading((prevState) => {
                                    const newState = [...prevState];
                                    newState[index] = false;
                                    return newState;
                                  })}
                                  src={link}
                                />
                              </>
                            )}
                        </div>
                      );
                    })}
                  </div>
                }

                <div className={` mt-3 flex gap-3 `}>
                  <button onClick={() => toggleLike()}>
                    <Image
                      src={`/assets/heart-${like ? 'filled' : 'gray'}.svg`}
                      alt='heart'
                      width={24}
                      height={24}
                      className='cursor-pointer object-contain'
                    />
                  </button>
                  <Link href={`/thread/${thread._id}`}>
                    <Image
                      src='/assets/reply.svg'
                      alt='reply'
                      width={24}
                      height={24}
                      className='cursor-pointer object-contain'
                    />
                  </Link>
                  {!isRepost && !isQouteThread &&
                    <button onClick={async () => {
                      const repost = await repostThread({ userId: currentUserId, threadId: thread._id })
                      if (repost) alert('reposted')
                    }}>
                      <Image
                        src='/assets/repost.svg'
                        alt='repost'
                        width={24}
                        height={24}
                        className='cursor-pointer object-contain'
                      />
                    </button>
                  }
                  {!isRepost && !isQouteThread &&
                    <button onClick={() => setOpenQoute(true)}>
                      <Image
                        src='/assets/quote.svg'
                        alt='qoute'
                        width={24}
                        height={24}
                        className='cursor-pointer object-contain '
                      />
                    </button>
                  }
                  <Image
                    src='/assets/share.svg'
                    alt='heart'
                    width={24}
                    height={24}
                    className='cursor-pointer object-contain'
                  />
                </div>
              </div>
            }
            {(thread.comments?.length > 0 || thread.likes?.length > 0) &&
              <div className='flex items-center gap-2'>
                <Link href={`/thread/${thread._id}`} className='flex gap-2 mt-1.5 text-gray-1 text-[14px] items-center '>
                  {thread.comments?.length > 0 && (
                    <p className=' text-gray-1 hover:underline'>
                      {thread.comments?.length} Repl{thread.comments?.length > 1 ? "ies" : "y"}
                    </p>)}
                  {
                    thread.comments?.length > 0 && thread.likes?.length > 0 &&
                    <span>·</span>
                  }
                  {thread.likes?.length > 0 && (
                    <p className=' text-gray-1'>
                      {thread.likes.length} Like{thread.likes.length! > 1 && 's'}
                    </p>
                  )}
                </Link>
              </div>
            }

          </div>

        </div>

      </div>


      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <DialogContent className="bg-transparent border-none text-white h-full w-full flex justify-center">
          <div className="flex flex-col justify-center items-center ">
            <section className='slider-preview mt-3 w-full h-full '>
              {thread.media?.mediaLink?.map((link: string, index: number) => {
                return (
                  <div
                    className={`${index === currentImage ? 'slide active' : 'slide'}`}
                    key={index}
                  >
                    {index === currentImage && (
                      <img src={link} alt='content' className='max-h-screen' onClick={() => setOpen(true)} />
                    )}
                  </div>
                );
              })}
            </section>
            <div className="flex justify-center gap-48 mt-5 w-full">
              {(currentImage > 0) && <img className='left-arrow-preview' src="/assets/left.svg" onClick={prevSlide} height={50} width={50} />}
              {!(currentImage == thread.media?.mediaLink?.length - 1) && <img src='/assets/right.svg' height={50} width={50}
                className='right-arrow-preview' onClick={nextSlide} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>


      <QouteThreadDialog currentUserId={currentUserId} currentUser_Id={CurrentUser_ID} open={openQoute} setOpen={setOpenQoute}
        thread={thread} />


    </article>
  )
}


export default ThreadCard;


