"use client"

import { addMemberToCommunity, removeUserFromCommunity } from '@/lib/actions/community.actions'
import { useState, useEffect, useRef } from 'react'
import LoadingSpinner from './LoadingSpinner'
import { followUser, unfollowUser } from '@/lib/actions/user.actions'
import { usePathname } from 'next/navigation'

function ToggleStatus({ type, currentStatus, communityId, currentUserId, isOwner, isUser, targetUserId }: {
  type: 'Community' | 'Profile', currentStatus?: boolean, communityId?: string, profileId?: string, currentUserId: string,
  isOwner?: boolean, isUser?: boolean,targetUserId? : string,
}) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const currentOp = useRef<NodeJS.Timeout>()
  const prevStatus = useRef<boolean>();

  const pathname = usePathname();

  console.log('isUser' , isUser,'currenStatus', currentStatus,status )

  async function toggle() {
    if (loading) {
      return; // Prevent toggling when an operation is in progress
    }
    prevStatus.current = status
    setStatus((prevStatus) => !prevStatus);
    setLoading(true);

    try {
      if(type == 'Community'){
        const res = status
        ? await removeUserFromCommunity(currentUserId, communityId!)
        : await addMemberToCommunity(communityId!, currentUserId);
        console.log(res);
      }else{
        const res = status
        ? await unfollowUser(targetUserId!,currentUserId,pathname)
        : await followUser(targetUserId!,currentUserId,pathname);
        console.log(res);
      }
    } catch (error) {
      setStatus(prevStatus.current);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (isOwner || isUser ) {
    return null
  }


  return (

    <button className={`text-light-1 ml-auto font-mono py-2  ${status ? 'bg-indigo-900' : 'bg-primary-500'} rounded-md min-w-[80px] `}
      disabled={loading}
      onClick={() => toggle()} >
      {!(loading) && (type == 'Community' ?
        (status ? 'Joined' : 'Join') :
        (status ? 'Unfollow' : 'Follow'))
      }
      {loading &&
        <LoadingSpinner />
      }
    </button>

  )
}

export default ToggleStatus
