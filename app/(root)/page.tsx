import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import Pagination from "@/app/components/shared/Pagination";

import { fetchPosts, fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser, fetchUserName, userInfoFrom_id } from "@/lib/actions/user.actions";
import Feed from "../components/shared/Feed";

export const revalidate = 0;

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
    <main>
      <h1 className='head-text text-left'>Home</h1>
      <Feed currentUser={user.id} posts={result.posts} currentUser_ID={userInfo._id} />
      <Pagination
        path='/'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </main>
  );
}

export default Home;