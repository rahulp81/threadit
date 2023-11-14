"use client"
import React, { useState } from 'react'
import ThreadCard from '../cards/ThreadCard';
import { toggleThreadLike } from '@/lib/actions/thread.actions';
import { Link } from 'lucide-react';
import Image from 'next/image';

type props = {
    posts: any;
    currentUser: string;
    currentUser_ID : string;
}

function Feed({ posts, currentUser, currentUser_ID }: props) {
    const [postData, setPostData] = useState(posts);
    return (
        <main className='mt-9 flex flex-col '>
            {posts.length === 0 ? (
                <p className='no-result'>No threads found</p>
            ) : (
                <section className='flex flex-col gap-7'>
                    {postData.map((post: any) => {
                        const isLiked = post.likes?.includes(currentUser) || false;
                        return <ThreadCard thread={post}
                            key={post._id} currentUserId={currentUser} CurrentUser_ID={currentUser_ID} />
                    })}
                </section>
            )}
        </main>
    )
}

export default Feed
