"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { deleteThread } from "@/lib/actions/thread.actions";

interface Props {
  threadId: string;
  currentUserId: string;
  authorId: string;
  parentId: string | null;
  isComment?: boolean;
  isModerator?: boolean;
  isOwner?: boolean;
  isCommunityPost?: boolean;
  isPostOfModerator?: boolean;
}

function DeleteThread({
  threadId,
  currentUserId,
  authorId,
  parentId,
  isComment,
  isCommunityPost,
  isModerator,
  isPostOfModerator,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  if (isCommunityPost && isPostOfModerator && (currentUserId !== authorId)) {
    return null
  } else if (isCommunityPost && !isPostOfModerator && !isModerator && (currentUserId !== authorId)) {
    return null
  } else if (!isCommunityPost && (currentUserId !== authorId)) {
    return null
  }

  return (
    <Image
      src='/assets/delete.svg'
      alt='delte'
      width={18}
      height={18}
      className='ml-2 cursor-pointer object-contain'
      onClick={async () => {
        console.log('delete', pathname );
        await deleteThread(threadId, pathname);
        if (!parentId || !isComment) {
          router.push("/");
        }
      }}
    />
  );
}

export default DeleteThread;