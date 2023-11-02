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
  type?: string;
  memberCount?: number,
  status?: boolean,
  communityId?: string,
  isOwner?: boolean,
  noOfMembers?: number
}

function ProfileHeader({
  accountId,
  authUserId,
  name,
  username,
  imgUrl,
  bio,
  type,
  memberCount,
  status,
  communityId,
  isOwner,
  noOfMembers
}: Props) {

  console.log('profile header', status);

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
            {accountId === authUserId && type !== "Community" && <p className='text-base-medium text-gray-1'> @{username}</p>}
          </div>

          {type == 'Community' &&
            <ToggleStatus isOwner={isOwner!} currentStatus={status!} currentUserId={authUserId} communityId={communityId}
              type="community" />
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

      <div className="mt-2 max-w-lg text-base-regular text-light-2 font-mono rounded w-fit py-1 px-2 text-[12px] bg-violet-950">
        Members : {noOfMembers}</div>

      <p className='mt-5 max-w-lg text-base-regular text-light-2'>{bio}</p>

      <div className='mt-12 h-0.5 w-full bg-dark-3' />
    </div>
  );
}

export default ProfileHeader;