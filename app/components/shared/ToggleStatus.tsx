"use client"

import { addMemberToCommunity, removeUserFromCommunity } from '@/lib/actions/community.actions'
import { useState, useEffect, useRef } from 'react'
import LoadingSpinner from './LoadingSpinner'

function ToggleStatus({ type, currentStatus, communityId, currentUserId, isOwner }: {
  type: 'community' | 'profile', currentStatus: boolean, communityId?: string, profileId?: string, currentUserId: string, isOwner: boolean
}) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const currentOp = useRef<NodeJS.Timeout>()
  const prevStatus = useRef<boolean>();

  async function toggle() {
    if (loading) {
      return; // Prevent toggling when an operation is in progress
    }
    prevStatus.current = status
    setStatus((prevStatus) => !prevStatus);
    setLoading(true);

    try {
      const res = status
        ? await removeUserFromCommunity(currentUserId, communityId!)
        : await addMemberToCommunity(communityId!, currentUserId);
      console.log(res);
    } catch (error) {
      setStatus(prevStatus.current);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (isOwner) {
    return null
  }


  return (

    <button className={`text-light-1 ml-auto font-mono py-2  ${status ? 'bg-indigo-900' : 'bg-primary-500'} rounded-md min-w-[80px] `}
      disabled={loading}
      onClick={() => toggle()} >
      {!(loading) && (type == 'community' ?
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
