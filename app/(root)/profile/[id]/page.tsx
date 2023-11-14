import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { profileTabs } from "@/constants/sharedLinks";

import ThreadsTab from "@/app/components/shared/ThreadsTab";
import ProfileHeader from "@/app/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";

import { fetchUser, isUserFollowing } from "@/lib/actions/user.actions";

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(params.id);

  const currentUserInfo = userInfo.id == user.id ? userInfo : await fetchUser(user.id);
  if (!currentUserInfo?.onboarded) redirect("/onboarding");

  const isUserFollower = userInfo._id == user.id ? null : await isUserFollowing({
    currentUser: currentUserInfo._id,
    actionUserId: userInfo._id
  })


  return (
    <section>
      <ProfileHeader
        accountId={userInfo.id}
        authUserId={user.id}
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
        type={'User'}
        followCount={userInfo.followers.length}
        followingCount={userInfo.following.length}
        isUser={userInfo.id == user.id}
        targetUserId={userInfo.id}
        status={isUserFollower!}
      />

      <div className='mt-9'>
        <Tabs defaultValue='threads' className='w-full'>
          <TabsList className='tab'>
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className='object-contain'
                />
                <p className='max-sm:hidden'>{tab.label}</p>

                {tab.label === "Threads" && (
                  <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
                    {userInfo.threads.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {profileTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.label}`}
              value={tab.value}
              className='w-full text-light-1'
            >
              {/* @ts-ignore */}
              <ThreadsTab
                currentUserId={currentUserInfo.id}
                currentUser_ID={currentUserInfo._id}
                accountId={userInfo._id}
                accountType='User'
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
export default Page;