"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";
import { Button } from "../ui/button";
import { useState } from "react";
import { updateCommunityInfo } from "@/lib/actions/community.actions";
import LoadingSpinner from "./LoadingSpinner";

type Props = {
    communityPostSettings: string,
    communityId: string
}

function CommunitySettings({ communityPostSettings, communityId }: Props) {
    const [loading, setLoading] = useState(false)
    const [postSettings, setPostSettings] = useState(communityPostSettings)
    const [changed, setChanged] = useState(false)

    function handlePostSettings(value: string) {
        setPostSettings(value)
        setChanged(true)
    }

    return (
        <section className="w-full flex flex-wrap gap-4 justify-between">
            <div className='flex gap-10 flex-wrap'>
                <p>Who can post ?</p>
                <RadioGroup className="text-[13px] " defaultValue={communityPostSettings} onValueChange={handlePostSettings} >
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
            {changed &&
                <Button disabled={loading} onClick={async () => {
                    try {
                        setLoading(true)
                        const res = await updateCommunityInfo(communityId, postSettings)
                        console.log(res);
                    } catch (error) {
                        console.log(error);
                    } finally {
                        setLoading(false)
                        setChanged(false)
                    }

                }}
                    className="max-w-[200px]"> {loading ? <LoadingSpinner /> : changed ?  'Save Changes' : 'Saved' }</Button>}
        </section>
    )
}

export default CommunitySettings