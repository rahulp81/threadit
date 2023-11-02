"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { banUser, makeModerator, removeModerator, unBanUser } from "@/lib/actions/community.actions";

interface Props {
  id: string;
  _id?: string;
  name: string;
  username: string;
  imgUrl: string;
  personType: string;
  isCommmunityAdmin?: boolean;
  isOwner?: boolean;
  communityUserCard?: boolean;
  communityId?: string,
  modId?: string,
  bannedUser?: boolean
}

function UserCard({ id, name, username, imgUrl, personType, isCommmunityAdmin, isOwner, communityId, communityUserCard, _id, modId, bannedUser }:
  Props) {
  const router = useRouter();

  const isCommunity = personType === "Community";

  return (
    <article className='user-card'>
      <div className='user-card_avatar'>
        <div className='relative h-12 w-12'>
          <Image
            src={imgUrl}
            alt='user_logo'
            fill
            className='rounded-full object-cover'
          />
        </div>

        <div className='flex-1 text-ellipsis'>
          <h4 className='text-base-semibold text-light-1'>{name}</h4>
          <p className='text-small-medium text-gray-1'>@{username}</p>
        </div>
      </div>

      <Button
        className='user-card_btn'
        onClick={() => {
          if (isCommunity) {
            router.push(`/communities/${id}`);
          } else {
            router.push(`/profile/${id}`);
          }
        }}
      >
        View
      </Button>

      {
        communityUserCard && !(id == modId) && !bannedUser &&
          isOwner ?
          (<DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='user-card_btn'>
                <img src="/assets/options.svg" height={20} width={20} alt="options" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-[200px] overflow-y-auto">
              <DropdownMenuItem onClick={async () => {
                console.log({ communityId: communityId!, userId: _id!, requestBy: modId! });
                const res = await removeModerator({ communityId: communityId!, userId: _id!, requestBy: modId! })
                console.log(res);
              }}  >
                Remove Moderator
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                const res = await banUser({ communityId: communityId!, requestBy: modId!, userId: _id! })
                const res2 = await removeModerator({ communityId: communityId!, userId: _id!, requestBy: modId! })
                console.log(res, res2);
              }} >
                Ban User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>) : isCommmunityAdmin && !bannedUser ?
            (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className='user-card_btn'>
                    <img src="/assets/options.svg" height={20} width={20} alt="options" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-h-[200px] overflow-y-auto">
                  <DropdownMenuItem onClick={async () => {
                    const res = await makeModerator({ communityId: communityId!, userId: _id!, requestBy: modId! })
                    console.log(res);
                  }} >
                    Make  Moderator
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => {
                    const res = await banUser({ communityId: communityId!, requestBy: modId!, userId: _id! })
                    console.log(res);
                  }} >
                    Ban User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>) : bannedUser && isOwner && (


                <Button className='user-card_btn' onClick={async () => {
                  const res = await unBanUser({ userId: _id!, communityId: communityId!, requestBy: modId! })
                  console.log(res);
                }}>
                  Unban User 🛇
                </Button>

              )
      }




    </article>
  );
}

export default UserCard;