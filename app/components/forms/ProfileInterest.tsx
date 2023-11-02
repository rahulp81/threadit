"use client"
import { ChangeEvent, useState } from 'react'
import { interestTopics } from '@/constants/sharedLinks'

export default function ProfileInterest({interests, setInterests} : {
    interests : number[] , setInterests : React.Dispatch<React.SetStateAction<number[]>>
}) {

    function toggleInterest(id: number) {
        if (interests.includes(id)) {
            const updateInterest = interests.filter((interestId) => !(interestId == id))
            setInterests(updateInterest)
        } else {
            const updateInterest = interests.length > 0 ? [...interests] : [];
            updateInterest.push(id)
            setInterests(updateInterest)
        }
    }

    return (
        <main className='flex flex-col gap-5'>
            <h2 className='text-[17px] text-white'>Interests to follow (Select atleast 3)</h2>
            <section className='flex flex-col gap-3'>
                <ul className='flex gap-3 flex-wrap text-[14px]'>
                    {
                        interestTopics.map((topic) => {
                            return (
                                <li key={topic.id} onClick={() => toggleInterest(topic.id)}
                                    className={`text-white py-1 px-2 border border-primary-500 rounded hover:cursor-pointer
                                     ${interests.includes(topic.id) && 'bg-primary-500'}`}>
                                    {topic.name}
                                </li>
                            )
                        })
                    }
                </ul>
            </section>
        </main>
    )
}
