import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import ToggleStatus from "./ToggleStatus";

interface Props {
  accountId: string;
  authUserId: string;
  name: string;
  username?: string;
  imgUrl: string;
  bio?: string;
  type?: 'Community' | 'User';
  status?: boolean,
  communityId?: string,
  isOwner?: boolean,
  noOfMembers?: number,
  followCount?: number;
  followingCount?: number;
  targetUserId?: string,
  isUser?: boolean,
}

function ProfileHeader({
  accountId,
  authUserId,
  name,
  username,
  imgUrl,
  bio,
  type,
  status,
  communityId,
  isOwner,
  noOfMembers,
  followCount,
  followingCount,
  targetUserId,
  isUser
}: Props) {


  return (
    <div className='flex w-full flex-col justify-start'>
      <div className='flex items-center justify-between '>
        <div className='flex items-center gap-3  w-full flex-wrap'>
          <div className='relative h-20 w-20 object-cover'>
            <Image
              src={!imgUrl ? '/assets/community.svg' : imgUrl}
              alt='logo'
              fill
              className='rounded-full object-contain shadow-2xl'
            />
          </div>

          <div className='flex-1'>
            <h2 className='text-left text-heading3-bold text-light-1'>
              {name}
            </h2>
            {type == 'User' &&  <p className='text-base-medium text-gray-1'> @{username}</p>}
          </div>

          {type == 'Community' ?
            <ToggleStatus isOwner={isOwner!} currentStatus={status as boolean} currentUserId={authUserId} communityId={communityId}
              type="Community" /> :
            <ToggleStatus isUser={isUser!} currentStatus={status as boolean} currentUserId={authUserId} targetUserId={targetUserId}
              type="Profile" />
          }

        </div>
        {accountId === authUserId && type !== "Community" && (
          <Link href='/profile/edit'>
            <div className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2'>
              <Image
                src='/assets/edit.svg'
                alt='logout'
                width={16}
                height={16}
              />
              <p className='text-light-2 max-sm:hidden'>Edit</p>
            </div>
          </Link>
        )}
      </div>

      <div className="mt-2 max-w-lg flex flex-wrap gap-3 text-base-regular text-light-2 font-mono  w-fit  text-[12px] ">
        {
          type == 'User' ?
            <>
              <span className="bg-violet-950 py-1 px-2 rounded">Followers : {followCount}</span>
              <span className="bg-violet-950 py-1 px-2 rounded">Following : {followingCount}</span>
            </> :
            <span className="bg-violet-950 py-1 px-2">Members : {noOfMembers}</span>
        }
      </div>

      <p className='mt-5 max-w-lg text-base-regular text-light-2 break-words '>{bio}</p>

      <div className='mt-12 h-0.5 w-full bg-dark-3' />
    </div>
  );
}

export default ProfileHeader;