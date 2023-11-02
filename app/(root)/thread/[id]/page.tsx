import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import Comment from "@/app/components/forms/Comment";
import ThreadCard from "@/app/components/cards/ThreadCard";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import CommentCard from "@/app/components/shared/CommentCard";

export const revalidate = 0;

async function page({ params }: { params: { id: string } }) {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const thread = await fetchThreadById(params.id);
  const { id, name, image, _id } = thread.author;
  const isLiked = thread.likes.includes(user.id)
  const likeCount = thread.likes.length || 0;
  const childrenForThreadCard = thread.children.map((comment: any) => {
    if (comment.author) {
      const { _id, id, name, image } = comment.author;
      return {
        _id: _id.toString(),
        id,
        name,
        image,
      };
    } else {
      return null
    }
  });

  console.log('guess', childrenForThreadCard);


  return (
    <section className='relative'>
      <div>
        <ThreadCard
          id={thread._id}
          currentUserId={user.id}
          parentId={thread.parentId}
          content={thread.text}
          author={{ id, name, image, _id }}
          community={thread.community}
          createdAt={thread.createdAt}
          comments={childrenForThreadCard}
          media={thread.media}
          isLiked={isLiked}
          likeCount={likeCount}
        />
      </div>

      <div className='mt-7'>
        <Comment
          threadId={params.id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>

      <div className='mt-10 flex gap-4 flex-col'>
        {thread.children.map((childItem: any) => (
          <CommentCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={user.id}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            community={childItem.community}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment
            isLiked= {childItem.likes.includes(user.id)}
            likeCount={childItem.likes.length || 0}
          />
        ))}
      </div>
    </section>
  );
}

export default page;