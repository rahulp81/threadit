"use client"
import { Button } from "@/app/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { checkCommunityExists, createCommunity } from "@/lib/actions/community.actions"
import { useUploadThing } from "@/lib/uploadthing"
import { useRouter } from "next/navigation"
import { Textarea } from "../ui/textarea"
import LoadingSpinner from "./LoadingSpinner"
import useAutosizeTextArea from "@/lib/customHooks/useAutoSizeTextArea"
import Link from "next/link"
import ThreadCard from "../cards/ThreadCard"
import { qouteThread } from "@/lib/actions/thread.actions"


function QouteThreadDialog({ open, setOpen, thread, currentUser_Id, currentUserId }: {
    open: boolean, setOpen: any, thread: any, currentUser_Id: string, currentUserId: string
}) {
    const [qouteText, setQouteText] = useState('');
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    useAutosizeTextArea(textAreaRef.current, qouteText);

    const router = useRouter();

    function reset() {
        setQouteText('')
    }


    async function handleQouteThread() {
        try {
            setLoading(true)
            const res = await qouteThread({ qouteByUser: currentUser_Id, qouteText: qouteText, qouteThreadId: thread._id })
            console.log(res);
            reset();
            router.push(`/thread/${res}`)
        } catch (error) {
            console.log(error);
            setError('There was an error try again')
        } finally {
            setLoading(false)
        }
    }





    return (
        <Dialog open={open} onOpenChange={() => setOpen(!open)} >
            <DialogContent className="sm:max-w-[600px] flex-col flex gap-1 bg-dark-1 text-white">
                <DialogHeader>
                    <DialogTitle className="font-mono text-[17px]">Qoute this Thread</DialogTitle>
                    <p>{error}</p>
                </DialogHeader>
                <div className="flex flex-col gap-2 py-2 text-white bg-dark-1">
                    <div className="border rounded-md flex flex-col px-3">
                        <Textarea
                            placeholder={`Share your Thoughts...`}
                            value={qouteText}
                            onChange={(e) => { setQouteText(e.target.value) }}
                            className="bg-black text-white resize-none outline-none border-none overflow-hidden min-h-0 "
                            rows={3}
                            ref={textAreaRef}
                            maxLength={200}
                        />
                    </div>

                    <div>
                        <ThreadCard thread={thread}
                            key={thread._id} currentUserId={currentUserId} CurrentUser_ID={currentUser_Id} />
                    </div>

                </div>
                <DialogFooter>
                    <Button onClick={() => handleQouteThread()} disabled={qouteText.length < 1}
                        className="bg-primary-500" >
                        {loading ? <LoadingSpinner /> :
                            'Qoute Thread'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default QouteThreadDialog;