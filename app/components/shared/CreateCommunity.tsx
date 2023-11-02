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


function CreateCommunityDialog({ userId }: { userId: string }) {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('')
    const [postSettings, setPostSettings] = useState('public')
    const [viewSettings, setViewSettings] = useState('public');
    const [communityProfilePic, setCommunityProfilePic] = useState<File | null>(null)
    const [error, setError] = useState('')
    const [existingCommunity, setExistingCommunity] = useState<boolean>()
    const [loading, setLoading] = useState(false)

    const bioInputRef = useRef<HTMLTextAreaElement>(null)
    const isDisabled = name.trim().length < 3 || existingCommunity || bio.length < 3 || loading;

    const router = useRouter();
    const { startUpload } = useUploadThing('media');

    function handlePostSettings(value: string) {
        setPostSettings(value)
    }


    function reset() {
        setPostSettings('public')
        setViewSettings('public')
        setName('')
        setCommunityProfilePic(null)
        setBio('')
        setLoading(false)
    }

    function handleName(e: React.ChangeEvent<HTMLInputElement>) {
        const inputValue = e.target.value;
        const trimmedValue = inputValue.trim(); // Remove leading and trailing spaces
        if (trimmedValue === inputValue) {
            setName(inputValue);
        }
    }


    function handleFileChanges(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0];

        if (selectedFile) {
            // Check the file type
            if (!selectedFile.type.startsWith('image/')) {
                alert('Please select an image file.');
                return;
            }
            // Check the file size (4MB = 4 * 1024 * 1024 bytes)
            if (selectedFile.size > 4 * 1024 * 1024) {
                alert('Selected file is too large. Please choose a file smaller than 4MB.');
                return;
            }
            // Set the community profile pic if it passes the checks
            setCommunityProfilePic(selectedFile);
        }
    }


    async function handleCreateCommunity() {
        try {
            setLoading(true)
            if (communityProfilePic) {
                const res = await startUpload([communityProfilePic])
                if (res) {
                    const image = res[0].url
                    const community = {
                        name,
                        createdBy: userId,
                        image,
                        viewSettings,
                        postSettings,
                        bio
                    }

                    const communityRes = await createCommunity(community)
                    console.log(`/communities/${communityRes}`);
                    router.push(`/communities/${communityRes}`)
                }
            } else {
                const community = {
                    name,
                    createdBy: userId,
                    viewSettings,
                    postSettings,
                    bio: bioInputRef.current?.value as string
                }

                const communityRes = await createCommunity(community)
                console.log(`/communities/${communityRes}`);
                router.push(`/communities/${communityRes}`)
            }
        } catch (error) {
            console.log(error);
            setError('There was an error try again')
        }
    }



    useEffect(() => {
        let canceled = false;
        let timeout: any;
        const fetchData = async () => {
            const existing = await checkCommunityExists(name);
            console.log(existing);
            if (!canceled) {
                // Check if this request is still relevant
                if (existing) {
                    setExistingCommunity(true);
                } else {
                    setExistingCommunity(false);
                }
            }
        };

        if (name.length >= 3) {
            timeout = setTimeout(() => {
                fetchData();
            }, 1000);
        }

        return () => {
            canceled = true;
            clearTimeout(timeout)
        };
    }, [name]);




    return (
        <Dialog onOpenChange={reset} >
            <DialogTrigger asChild>
                <Button className="bg-primary-500 text-white py-2 rounded-lg px-2 text-base-regular ">+ Create Community</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-dark-1 text-white">
                <DialogHeader>
                    <DialogTitle>Create Community</DialogTitle>
                    <p>{error}</p>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4 text-white bg-dark-1">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name" className="text-left">
                            Community Name <span className="text-[10px]">(Min : 3, Max : 25)</span> :
                            <span> {name.length > 2 && (existingCommunity ? <span className="text-red-700 text-[12px]">❗Community Exist with 
                            Same Name</span> :
                            '✅')}</span>
                        </Label>
                        <Input id="name" value={name} onChange={handleName} placeholder="Name"
                            className="col-span-3 bg-dark-1 border border-primary-500"
                            maxLength={25} autoComplete="off" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="bio" className="text-left">
                            Bio <span className="text-[10px]">(Min : 3, Max : 200)</span>
                        </Label>
                        <Textarea id="name" placeholder="Add Bio" ref={bioInputRef}
                            className="col-span-3 bg-dark-1 border border-primary-500" value={bio}
                            maxLength={200} autoComplete="off" onChange={(e) => setBio(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-5">
                        <Label htmlFor="pp" className="">
                            Display Picture:
                        </Label>
                        <div className="flex gap-2">
                            {
                                communityProfilePic ?
                                    <Image height={40} width={40} src={URL.createObjectURL(communityProfilePic)} alt="profile-pic"
                                        className="rounded-full " /> :
                                    <Image height={40} width={40} src={'/assets/community.svg'} alt="profile-pic"
                                        className="rounded-full " />
                            }
                            <Input id="pp" accept="image/jpeg, image/png" type="file" onChange={handleFileChanges} className="col-span-3 bg-dark-1 border max-w-[200px] account-form_image-input " />
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex gap-1 border-primary-500 border p-3 justify-between rounded">
                            <h3 className="text-[15px]">Who can Post Thread in the community?</h3>
                            <RadioGroup className="text-[13px]" defaultValue={postSettings} onValueChange={handlePostSettings} >
                                <div className="flex items-center  space-x-2">
                                    <RadioGroupItem className="text-primary-500 border-sky-800 border-2" value="public"
                                        id="option-one" />
                                    <Label htmlFor="option-one">Everyone</Label>
                                </div>
                                <div className="flex  items-center space-x-2">
                                    <RadioGroupItem className=" text-primary-500 border-sky-800 border-2" value="restricted" id="option-two" />
                                    <Label htmlFor="option-two">Moderators Only</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => handleCreateCommunity()} disabled={name.trim().length < 3 || existingCommunity || bioInputRef.current?.value?.length! < 3}
                        className="bg-primary-500" >
                        {loading ? <LoadingSpinner /> :
                            'Create Community'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default CreateCommunityDialog;