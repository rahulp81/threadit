import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import Comment from "@/app/components/forms/Comment";
import ThreadCard from "@/app/components/cards/ThreadCard";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import CommentContainer from "@/app/components/shared/CommentContainer";

export const revalidate = 0;

async function page({ params }: { params: { id: string } }) {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const thread = await fetchThreadById(params.id) as any;

  if (!thread) {
    return <h2 className="text-[20px] text-white ">This Thread no Longer / Doesnt exists</h2>;
  }

  console.log(thread.comments, 'threadComment  ')

  return (
    <section className='relative'>
      <div>
        <ThreadCard
          currentUserId={user.id}
          thread={thread}
          threadPage
          CurrentUser_ID={userInfo._id}
        />
      </div>

      <div className='mt-7'>
        <Comment
          threadId={params.id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>

      <div className='mt-2'>
        <CommentContainer
          currentUserId={userInfo._id}
          currentUser={user.id}
          comments={thread.comments}
          threadId={params.id}
        />
      </div>
    </section>
  );
}

export default page;