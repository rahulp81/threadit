import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import ThreadCard from "@/app/components/cards/ThreadCard";
import Pagination from "@/app/components/shared/Pagination";

import { fetchPosts, fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser, fetchUserName, userInfoFrom_id } from "@/lib/actions/user.actions";

async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchPosts(
    searchParams.page ? +searchParams.page : 1,
    30
  );

  return (
    <>
      <h1 className='head-text text-left'>Home</h1>

      <section className='mt-9 flex flex-col gap-10'>
        {result.posts.length === 0 ? (
          <p className='no-result'>No threads found</p>
        ) : (
          <>
            {result.posts.map(async (post) => {
              if (post.isRepost) {
                console.log('yes it is a repost', post);
                const repostThread = await fetchThreadById(post.isRepost);
                console.log('the repost tread is ', repostThread)
                const { id, name, image, _id } = repostThread.author;
                const isLiked = repostThread.likes.includes(user.id);
                const likeCount = repostThread.likes.length;
                const repostedByUsername = await fetchUserName(post.author);
                const repostedAt = post.createdAt;
                const childrenForThreadCard = repostThread.children.map((comment: any) => {
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
                const isRepost = {
                  repostedByUsername,
                  repostedAt
                }
                return <ThreadCard
                  key={post._id + 'repost'}
                  id={repostThread._id}
                  currentUserId={user.id}
                  parentId={repostThread.parentId}
                  content={repostThread.text}
                  author={{ id, name, image, _id }}
                  community={repostThread.community}
                  createdAt={repostThread.createdAt}
                  comments={childrenForThreadCard}
                  media={repostThread.media}
                  isLiked={isLiked}
                  likeCount={likeCount}
                  isRepost={isRepost}
                />
              }

              const { id, name, image, _id } = post.author;
              const isLiked = post.likes.includes(user.id)
              const likeCount = post.likes.length
              const childrenForThreadCard = post.children.map((comment: any) => {
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
              return <ThreadCard
                key={post._id}
                id={post._id}
                currentUserId={user.id}
                parentId={post.parentId}
                content={post.text}
                author={{ id, name, image, _id }}
                community={post.community}
                createdAt={post.createdAt}
                comments={childrenForThreadCard}
                media={post.media}
                isLiked={isLiked}
                likeCount={likeCount}
              />
            })}
          </>
        )}
      </section>


      <Pagination
        path='/'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </>
  );
}

export default Home;