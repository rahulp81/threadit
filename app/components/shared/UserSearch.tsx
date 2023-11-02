"use client"
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react'
import { Input } from '../ui/input';
import UserCard from '../cards/UserCard';
import { useForkRef } from '@mui/material';

function UserSearch({ members, isCommunityAdmin, communityUserCard, communityId,modId }: {
    members: any[], isCommunityAdmin: boolean, communityUserCard: boolean, communityId : string, modId? : string
}) {
    const [search, setSearch] = useState("");
    const [result, setResult] = useState<any>([])
    const resultRef = useRef<any>()
    resultRef.current = members.filter((member: any) => member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className='searchbar'>
                <Image
                    src='/assets/search-gray.svg'
                    alt='search'
                    width={24}
                    height={24}
                    className='object-contain'
                />
                <Input
                    id='text'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={"Search Users in Community"}
                    className='no-focus searchbar_input'
                />
            </div>
            <div className='mt-9'>
                {
                    resultRef.current.map((member: any) => (
                        <UserCard
                            key={member.id}
                            id={member.id}
                            _id={member._id}
                            name={member.name}
                            username={member.username}
                            imgUrl={member.image}
                            personType='User'
                            communityUserCard
                            isCommmunityAdmin={isCommunityAdmin}
                            communityId = {communityId}
                            modId= {modId!}
                        />
                    ))
                }
            </div>

        </>

    )
}


export default UserSearch


