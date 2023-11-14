import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { communityUserTabs, communityAdminTabs } from "@/constants/sharedLinks";
import UserCard from "@/app/components/cards/UserCard";
import ThreadsTab from "@/app/components/shared/ThreadsTab";
import ProfileHeader from "@/app/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { fetchCommunityDetails, getUserCommunities } from "@/lib/actions/community.actions";
import UserSearch from "@/app/components/shared/UserSearch";
import CommunitySettings from "@/app/components/shared/CommunitySettings";
import PostThread from "@/app/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import Community from "@/lib/models/community.models";


export const revalidate = 0;

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const communityDetails = await fetchCommunityDetails(params.id);
  console.log('by', communityDetails);


  const userInfo = await fetchUser(user.id)

  if (!userInfo?.onboarded) redirect('/onboarding');

  const communities = await getUserCommunities(userInfo._id);

  const isUserBanned = communityDetails.bannedUsers.some((buser: any) => user.id === buser.id)

  if (isUserBanned) {
    return <section className="text-white">
      <div>You are banned from this community!</div>
    </section>;
  }

  const noOfMembers = communityDetails.members.length
  const isUserAdmin: boolean = communityDetails.createdBy.id == user.id || communityDetails.moderators.some((member: any) => member.id === user.id);
  const isUserOwner = communityDetails.createdBy.id == user.id;
  const communityTabs = isUserAdmin ? communityAdminTabs : communityUserTabs;
  const isCurrentUserFollower = communityDetails.members.some((member: any) => member.id === user.id);
  const communityMembers = communityDetails.members
    .filter((member: any) => !(communityDetails.createdBy.id == member.id) &&
      !(communityDetails.moderators.some((mod: any) => mod.id === member.id)))
    .map((member: any) => ({
      _id: member._id,
      id: member.id,
      name: member.name,
      username: member.username,
      image: member.image,
    }));



  return (
    <section>
      <ProfileHeader
        accountId={communityDetails.createdBy}
        authUserId={user.id}
        name={communityDetails.name}
        imgUrl={communityDetails.image}
        bio={communityDetails.bio}
        communityId={communityDetails.id}
        type='Community'
        status={isCurrentUserFollower}
        isOwner={isUserOwner}
        noOfMembers={noOfMembers}
      />

      <div className='mt-9'>
        <Tabs defaultValue='threads' className='w-full'>
          <TabsList className='tab'>
            {communityTabs.map((tab) => (
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
                    {communityDetails.threads.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value='threads' className='w-full text-light-1'>
            {/* @ts-ignore */}
            {/* <PostThread/> */}
            {/* <PostThread userId={userInfo._id} image={userInfo.image} communities={communities}
              postLocationOptions={postLocationOptions} postAt={{ name: 'Profile', image: userInfo.image }} /> */}
            <ThreadsTab
              currentUserId={user.id}
              currentUser_ID= {userInfo._id}
              accountId={communityDetails._id}
              accountType='Community'
            />
          </TabsContent>

          <TabsContent value='settings' className='mt-9 w-full  text-light-1'>
            {isUserOwner &&
              <section className='mt-9 flex flex-col gap-5'>
                <CommunitySettings communityId={communityDetails._id} communityPostSettings={communityDetails.postSettings} />
              </section>
            }
            <section className='mt-9 flex flex-col gap-5'>
              <h2>Moderators :</h2>
              <UserCard
                id={communityDetails.createdBy.id}
                name={communityDetails.createdBy.name}
                imgUrl={communityDetails.createdBy.image}
                personType="User"
                communityUserCard
                username={communityDetails.createdBy.username}
              />
              {communityDetails.moderators.map((member: any) => (
                <UserCard
                  key={member.id}
                  id={member.id}
                  _id={member._id}
                  name={member.name}
                  username={member.username}
                  imgUrl={member.image}
                  personType='User'
                  communityUserCard
                  isOwner={isUserOwner}
                  communityId={communityDetails.id}
                  modId={user.id}
                />
              ))}
            </section>

            {communityDetails.bannedUsers.length > 0 &&
              <section className='mt-9 flex flex-col gap-5'>
                <h2>Banned Users  :</h2>
                {communityDetails.bannedUsers.map((member: any) => (
                  <UserCard
                    key={member.id}
                    id={member.id}
                    _id={member._id}
                    name={member.name}
                    username={member.username}
                    imgUrl={member.image}
                    personType='User'
                    communityUserCard
                    isOwner={isUserOwner}
                    communityId={communityDetails.id}
                    modId={user.id}
                    bannedUser
                  />
                ))}
              </section>}

            <section className="mt-10 flex flex-col gap-2">
              <h2>Search Members :</h2>
              <UserSearch communityUserCard isCommunityAdmin={isUserAdmin} members={communityMembers}
                communityId={communityDetails.id} modId={user.id} />
            </section>
          </TabsContent>

          <TabsContent value='about' className='w-full text-light-1'>
            {/* @ts-ignore */}
            <section className='mt-9 flex flex-col gap-5'>
              <h2>Post Settings : {communityDetails.postSettings == 'public' ? 'Anyone Can Post' : 'Only Moderators can post'}</h2>
              <h2>Moderators :</h2>
              <UserCard
                id={communityDetails.createdBy.id}
                name={communityDetails.createdBy.name}
                imgUrl={communityDetails.createdBy.image}
                personType="User"
                communityUserCard
                username={communityDetails.createdBy.username}
              />
              {communityDetails.moderators.map((member: any) => (
                <UserCard
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  username={member.username}
                  imgUrl={member.image}
                  personType='User'
                  communityUserCard
                />
              ))}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export default Page;