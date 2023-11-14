"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { addCommentToThread } from "@/lib/actions/thread.actions";
import LoadingSpinner from "../shared/LoadingSpinner";
import { useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import useAutosizeTextArea from "@/lib/customHooks/useAutoSizeTextArea";

interface Props {
  threadId: string;
  currentUserImg: string;
  currentUserId: string;
  mainCommentBox?: boolean;
  mainThreadPost?: boolean
}

function Comment({ threadId, currentUserImg, currentUserId, mainCommentBox, mainThreadPost }: Props) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false)
  const [commentText, setCommentText] = useState('');
  const formRef = useRef<HTMLFormElement>(null)
  const commentRef = useRef<HTMLTextAreaElement>(null)

  useAutosizeTextArea(commentRef.current, commentText);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await addCommentToThread(
        threadId,
        threadId,
        commentText,
        JSON.parse(currentUserId),
        pathname
      );
      setCommentText('');
      //Toast
    } catch (error) {
      console.error('Error : ', error)
      alert('Error while posting comment!')
    } finally {
      setLoading(false)
    }

  };

  return (
    <div  >
      <form className={`${mainCommentBox ? 'comment-form' : 'flex gap-1 border border-dark-4 rounded-xl px-2 py-2.5 flex-col'}`}
        ref={formRef}>
        <Textarea
          placeholder="What are your thoughts?"
          value={commentText}
          onChange={(e) => { setCommentText(e.target.value) }}
          className="bg-black text-white resize-none outline-none border-none overflow-hidden min-h-0 "
          ref={commentRef}
        />
        <Button type='button' className='comment-form_btn max-w-[100px] ml-auto' onClick={() => onSubmit()} >
          {loading ? <LoadingSpinner /> : 'Reply'}
        </Button>
      </form>
    </div>
  );
}

export default Comment;