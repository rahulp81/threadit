"use client"
import Image from "next/image";
import Link from "next/link";
import { formatDateString } from "@/lib/utils";
import DeleteThread from "../forms/DeleteThread";
import { useRef, useState } from "react";
import SimpleImageSlider from "react-simple-image-slider";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from 'react-icons/fa';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/Image-Dialog"
import { toggleThreadLike } from "@/lib/actions/thread.actions";
import { repostThread } from "@/lib/actions/thread.actions";
import formatRepostedTime  from '@/lib/dateFormat'

interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  author: {
    name: string;
    _id: string;
    image: string;
    id: string;
  };
  community: {
    id: string;
    name: string;
    image: string;
  } | null;
  createdAt: string;
  comments: any[];
  isComment?: boolean;
  isLiked: boolean;
  likeCount: number | null;
  media: {
    mediaType: string,
    mediaLink: string[],
  }
  isRepost?: {
    repostedByUsername: string,
    repostedAt: Date
  }
}

function ThreadCard({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment,
  media,
  isLiked,
  likeCount,
  isRepost
}: Props) {

  const [currentImage, setCurrentImage] = useState(0);
  const [open, setOpen] = useState(false)
  const [like, setLike] = useState(isLiked || false)
  const length = media?.mediaLink?.length
  const likeDebounceRef = useRef<NodeJS.Timeout>();
  const prevLike = useRef<boolean>();

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
        const res = await toggleThreadLike({ currentLikeStatus: like, likeActionBy: currentUserId, threadId: id })
        console.log(res);
      }, 1000);
    } catch (error) {
      setLike(prevLike.current!)
      console.error('toggle like :', error)
    }
  }

  return (
    <article
      className={`flex w-full flex-col rounded-xl   ${isComment ? "px-0 xs:px-7" : "bg-dark-2 p-7"}`}>
      {isRepost?.repostedByUsername &&
        <div className="flex gap-3 text-[#787896] text-small-regular -mt-4 mb-2.5" >
          <Image
            src='/assets/repost.svg'
            alt='heart'
            width={25}
            height={25}
            className='cursor-pointer object-contain'
          />
          <span>
            {isRepost?.repostedByUsername} reposted {formatRepostedTime(isRepost?.repostedAt)}
          </span>
        </div>
      }
      <div className='flex items-start justify-between ' >
        <div className='flex w-full flex-1 flex-row gap-4'>
          <div className='flex flex-col items-center'>
            <Link href={`/profile/${author.id}`} className='relative h-11 w-11'>
              <Image
                src={author.image}
                alt='user_community_image'
                fill
                className='cursor-pointer rounded-full'
              />
            </Link>

            <div className='thread-card_bar' />
          </div>

          <div className='flex w-full flex-col '>
            <Link href={`/profile/${author.id}`} className='w-fit'>
              <h4 className='cursor-pointer text-base-semibold text-light-1'>
                {author.name}
              </h4>
            </Link>

            <p className='mt-2 text-small-regular text-light-2'>{content}</p>

            {
              media?.mediaType && (media.mediaType == 'Video') &&
              <div className="mt-3 ">
                <video src={media.mediaLink[0]} className="max-h-[400px] min-h-[250px] rounded-xl object-cover" controls
                />
              </div>
            }


            {media?.mediaType && (media.mediaType == 'Image' || media.mediaType == 'Gif') && media?.mediaLink?.length == 1 &&
              <div className="mt-3 ">
                <img src={media.mediaLink[0]} className="max-h-[400px]  rounded-xl object-contain" alt="content"
                  onClick={() => setOpen(true)} />
              </div>
            }

            {media?.mediaLink?.length > 1 &&
              <section className='slider mt-3'>
                {!(currentImage == media.mediaLink.length - 1) && <FaArrowAltCircleRight className='right-arrow' onClick={nextSlide} />}
                {(currentImage > 0) && <FaArrowAltCircleLeft className='left-arrow' onClick={prevSlide} />}

                {media?.mediaLink?.map((link, index) => {
                  return (
                    <div
                      className={index === currentImage ? 'slide active' : 'slide'}
                      key={index}
                    >
                      {index === currentImage && (
                        <img src={link} alt='content' className='image' onClick={() => setOpen(true)} />
                      )}
                    </div>
                  );
                })}
              </section>
            }

            <div className={`${isComment && "mb-10"} mt-5 flex flex-col gap-3`}>
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
                <button onClick={async () => await repostThread({ userId: currentUserId, threadId: id })}>
                  <Image
                    src='/assets/repost.svg'
                    alt='heart'
                    width={24}
                    height={24}
                    className='cursor-pointer object-contain'
                  />
                </button>
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
            </div>
          </div>
        </div>

        <DeleteThread
          threadId={JSON.stringify(id)}
          currentUserId={currentUserId}
          authorId={author.id}
          parentId={parentId}
          isComment={isComment}
        />

      </div>



      <div className='ml-1 mt-3 flex items-center gap-2'>
        {!isComment && comments?.length > 0 &&
          comments.slice(0, 2).map((comment, index) => (
            <Image
              key={index}
              src={comment.image}
              alt={`user_${index}`}
              width={24}
              height={24}
              className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
            />
          ))}
        <Link href={`/thread/${id}`} className='flex gap-2 mt-1.5 text-gray-1 text-[14px] items-center '>
          {comments.length > 0 && (
            <p className=' text-gray-1'>
              {comments.length} Repl{comments.length > 1 ? "ies" : "y"}
            </p>)}
          {likeCount! > 0 && (<>
            <span>·</span>
            <p className=' text-gray-1'>
              {likeCount} Like{likeCount! > 1 && 's'}
            </p></>
          )}
        </Link>
      </div>


      {
        !isComment && community && (
          <Link
            href={`/communities/${community.id}`}
            className='mt-5 flex items-center'
          >
            <p className='text-subtle-medium text-gray-1'>
              {formatDateString(createdAt)}
              {community && ` - ${community.name} Community`}
            </p>

            <Image
              src={community.image}
              alt={community.name}
              width={14}
              height={14}
              className='ml-1 rounded-full object-cover'
            />
          </Link>
        )
      }

      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <DialogContent className="bg-transparent border-none text-white w-screen h-screen    overflow-auto">
          <div className="w-screen h-screen p-2 flex flex-col justify-center items-center ">
            <section className='slider-preview mt-3 w-full h-full '>
              {media?.mediaLink?.map((link, index) => {
                return (
                  <div
                    className={`${index === currentImage ? 'slide active' : 'slide'}`}
                    key={index}
                  >
                    {index === currentImage && (
                      <img src={link} alt='content' className='' onClick={() => setOpen(true)} />
                    )}
                  </div>
                );
              })}
            </section>
            <div className="flex justify-center gap-48 mt-5 w-full">
              {(currentImage > 0) && <FaArrowAltCircleLeft className='left-arrow-preview' onClick={prevSlide} />}
              {!(currentImage == media.mediaLink?.length - 1) && <FaArrowAltCircleRight className='right-arrow-preview' onClick={nextSlide} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </article >
  );
}

export default ThreadCard;


