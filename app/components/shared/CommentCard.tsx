import Image from "next/image";
import Link from "next/link";
import { formatDateString } from "@/lib/utils";
import DeleteThread from "../forms/DeleteThread";
import CommentIcons from "./CommentIcons";

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
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean;
  isLiked: boolean;
  likeCount: number;
}

function CommentCard({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment,
  isLiked,
  likeCount
}: Props) {

  return (
    <article
      className={`flex w-full flex-col  py-3 border-dark-4 border rounded-2xl ${isComment ? "px-0 xs:px-7" : "bg-dark-2 p-7"} `}>
      <div className='flex items-start justify-between'>
        <div className='flex w-full flex-1 flex-row gap-4'>
          <div className='flex flex-col items-center'>
            <Link href={`/profile/${author.id}`} className='relative h-11 w-11 '>
              <Image
                src={author.image}
                alt='user_community_image'
                fill
                className='cursor-pointer rounded-full'
              />
            </Link>

          </div>

          <div className='flex w-full flex-col '>
            <Link href={`/profile/${author.id}`} className='w-fit'>
              <h4 className='cursor-pointer text-base-semibold text-light-1'>
                {author.name}
              </h4>
            </Link>

            <p className='mt-2 text-small-regular text-light-2'>{content}</p>

            <CommentIcons commentCount={comments.length} currentUserId={currentUserId} id={id} isLiked={isLiked} likeCount={likeCount} />
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


    </article >
  );
}

export default CommentCard;



