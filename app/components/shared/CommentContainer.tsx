"use client"
import Image from "next/image";
import Link from "next/link";
import { formatDateString } from "@/lib/utils";
import DeleteThread from "../forms/DeleteThread";
import CommentIcons from "./CommentIcons";
import CommentCard from "../cards/CommentCard";
import ThreadCard from "../cards/ThreadCard";

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

function CommentContainer({
  currentUserId,
  currentUser,
  comments,
  threadId,
  threadCommentPage,
  threadChainComments
}: { currentUserId: string, comments: any, currentUser: string, threadId: string, threadCommentPage?: string, threadChainComments?: any }) {


  return (<>{!!threadCommentPage &&
    <ul className={` rounded-xl flex flex-col gap-2 border-dark-4 w-full max-w-screen-xl `}>
      <h2 className="text-light-1 font-[20px] semibold">Viewing Single Comment Thread :
      <Link href={`/thread/${threadId}`} className="text-light-3 hover:underline ml-2"> View All Comments</Link>
      </h2>
      <li key={'main'}>{
        <CommentCard mainThreadId={threadId} currentUser_Id={currentUserId} currentUser={currentUser}
        comment={comments} threadId={comments._id} />
        }
        </li>
    </ul >
  }
    {
      comments.length > 0 && <>
        {threadCommentPage && <h2 className="text-light-1 font-[20px] semibold">
          Remaining Thread Comments :
        </h2>}
        <ul className={` rounded-xl flex flex-col gap-2 border-dark-4 w-full max-w-screen-xl `}>
          {
            comments.filter((comment: any) => !(comment._id == threadCommentPage))
              .map((filteredComment: any, index: any) => {
                return <li className={`${index == 0 ? 'border-none' : 'border-t'} py-2  border-dark-4 flex flex-col gap-1.5`}
                  key={filteredComment._id}>
                  <CommentCard mainThreadId={threadId} currentUser_Id={currentUserId} currentUser={currentUser}
                    comment={filteredComment} threadId={filteredComment._id} />
                </li>
              })
          }
        </ul>
      </>
    }

  </>
  );
}

export default CommentContainer;



