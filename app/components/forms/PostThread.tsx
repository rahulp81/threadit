"use client";


import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { useUploadThing, uploadFiles } from '@/lib/uploadthing'
import { createThread } from "@/lib/actions/thread.actions";
import { useRef, useState } from "react";
import { Input } from "../ui/input";
import { usePathname, useRouter } from "next/navigation";
import useAutosizeTextArea from "@/lib/customHooks/useAutoSizeTextArea";
import Image from "next/image";
import { Label } from "@radix-ui/react-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayOptions, HourOptions, MinuteOptions } from "@/constants/sharedLinks";
import Poll from "./Poll";
import { Autocomplete, InputAdornment, TextField } from "@mui/material";
import PostLocation from "./PostLocationPicker";
import LoadingSpinner from "../shared/LoadingSpinner";

interface Props {
  userId: string,
  communities: any[],
  image: string,
  postAt?: any,
  postLocationOptions: any[],
}

function PostThread({ userId, image, communities, postAt, postLocationOptions }: Props) {
  const router = useRouter();
  const path = usePathname();
  const [isPollActive, setIsPollActive] = useState(false)
  const [postThreadAt, setPostThreadAt] = useState(postAt || null)
  const [threadtext, setThreadText] = useState('');
  const [previewImages, setPreviewImages] = useState<File[]>([])
  const [previewVideo, setpreviewVideo] = useState<File[]>([])
  const [previewGif, setpreviewGif] = useState<File[]>([])
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [pollOption, setPollOption] = useState(2)
  const [pollDayDuration, setPollDayDuration] = useState('1')
  const [pollHourDuration, setPollHourDuration] = useState('0')
  const [pollMinuteDuration, setPollMinuteDuration] = useState('0')
  const [choice1, setChoice1] = useState('');
  const [choice2, setChoice2] = useState('');
  const [choice3, setChoice3] = useState('');
  const [choice4, setChoice4] = useState('');
  const [loading, setLoading] = useState(false);

  const { startUpload } = useUploadThing('ThreadUpload');


  const isPollDisabled = previewImages.length > 0 || previewGif.length > 0 || previewVideo.length > 0 || isPollActive
  const isUploadDisabled = previewImages.length == 4 || previewGif.length > 0 || previewVideo.length > 0 || isPollActive;
  useAutosizeTextArea(textAreaRef.current, threadtext);

  function handlePreviewDelete(deleteIndex: number) {
    setPreviewImages((prev) => {
      const filtered = [...prev].filter((img, index) => !(index == deleteIndex))
      return filtered
    })
  }

  function handleVideoGifDelete(identifer: string) {
    if (identifer == 'gif') {
      setpreviewGif([])
    } else {
      setpreviewVideo([])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files as FileList)
    if (selectedFiles.length == 0) {
      return
    }

    if (selectedFiles.length > 4) {
      alert('Please choose either max 4 images , or 1 Gif or 1 Video')
      return
    }

    const types = selectedFiles.map((file) => {

      const fileType = file.type.startsWith('image/') ? (file.type.endsWith('gif') ? 'gif' : 'image') :
        file.type.startsWith('video/') ? 'video' : null;

      const fileSizeMB = file.size / (1024 * 1024);

      if (!fileType) {
        return null
      }

      if (fileType == 'image' && fileSizeMB <= 4 || fileType == 'gif' && fileSizeMB <= 8 || fileType == 'video' && fileSizeMB <= 512) {
        return file.type.split('/');
      }
      return null;
    });

    if (types.includes(null)) {

      alert('Please choose only maximum 4 images (<4 mb), a gif(<8 mb), or a video file (<512 mb) ');
      return;
    }

    const hasVideoAndGif = types.some(subarray => subarray && (subarray[0] === 'video' || subarray[1] === 'gif'));


    if (hasVideoAndGif && selectedFiles.length > 1) {
      alert('Please choose either max 4 images , or 1 Gif or 1 Video')
      return
    }

    if (!hasVideoAndGif && previewImages.length == 0) {
      const images = selectedFiles.map((f) => URL.createObjectURL(f))
      setPreviewImages(selectedFiles)
      return
    }

    if (selectedFiles[0].type.split('/')[0] == 'video' && previewImages.length == 0 && !(previewGif.length > 0)) {
      setpreviewVideo([selectedFiles[0]])
      return
    }


    if (selectedFiles[0].type.split('/')[1] == 'gif' && previewImages.length == 0 && !(previewVideo.length > 0)) {
      setpreviewGif([selectedFiles[0]])
      return
    }

    if (previewImages.length > 0 && hasVideoAndGif) {
      alert('Please select additional images only or remove the existing image and then selct video or gif')
      return
    }


    if (previewImages.length > 0 && selectedFiles.length > (4 - previewImages.length)) {
      alert('Max 4 image Files or 1 Video or 1 Gif')
      return
    } else if (previewImages.length > 0 && selectedFiles.length <= (4 - previewImages.length) && !hasVideoAndGif) {
      setPreviewImages((prev) => {
        return [...prev, ...selectedFiles]
      })
      return
    }

  }

  function resetPoll() {
    setChoice1('');
    setChoice2('');
    setChoice3('');
    setChoice4('');
    setPollDayDuration('1');
    setPollHourDuration('0');
    setPollMinuteDuration('0');
    setIsPollActive(false);
    setPollOption(2);
  }


  async function handleThreadSubmit() {
    try {
      setLoading(true)
      let mediaUploadedLink: [string] | null;
      let mediaType;
      if (previewImages.length > 0) {
        const res = await startUpload(previewImages)
        mediaUploadedLink = res?.map((file) => file.url) as [string]
        mediaType = 'Image'
        console.log(mediaUploadedLink);
      } else if (previewVideo.length > 0) {
        const res = await startUpload(previewVideo)
        mediaUploadedLink = res?.map((file) => file.url) as [string]
        mediaType = 'Video'
        console.log(mediaUploadedLink);
      } else if (previewGif.length > 0) {
        const res = await startUpload(previewGif)
        mediaUploadedLink = res?.map((file) => file.url) as [string]
        mediaType = 'Gif'
        console.log(mediaUploadedLink);
      } else {
        mediaUploadedLink = null;
        mediaType = null;
      }
      const communityId = (postThreadAt?.name == 'Profile' && !(postThreadAt._id)) ? null : postThreadAt._id;
      const res = await createThread({ text: threadtext, author: userId, communityId, path, mediaLink: mediaUploadedLink, mediaType })
      console.log(res);
    } catch (error) {
      console.error('Error posting thread:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col gap-5 max-w-3xl">

      <PostLocation setPostThreadAt={setPostThreadAt} postThreadAt={postThreadAt!} postLocationOptions={postLocationOptions} />

      <div className="border rounded-md flex flex-col px-3">
        <Textarea
          placeholder={isPollActive ? `Ask a Question?` : `What's happening?`}
          value={threadtext}
          onChange={(e) => { setThreadText(e.target.value) }}
          className="bg-black text-white resize-none outline-none border-none overflow-hidden min-h-0 "
          rows={3}
          ref={textAreaRef}
        />

        {
          isPollActive ?
            <div className="w-full  overflow-clip  flex flex-col border border-gray-700 rounded-lg text-white">
              <div className="flex  gap-x-1">
                <div className="flex py-2 gap-2 w-full flex-col">
                  <label className="border  border-gray-700 rounded-md mx-2 p-2 focus-within:border-primary-500 focus-within:border-2
                   focus-within:text-primary-500 " >
                    <div className="text-[13px] flex justify-between">
                      <span>Choice 1</span>
                      <span className="text-gray-500" >{choice1.length}/25</span>
                    </div>
                    <input maxLength={25} className="bg-black  w-full outline-none text-white" id="choice-1" value={choice1}
                      onChange={(e) => setChoice1(e.target.value)} />
                  </label>
                  <label className="border  border-gray-700 rounded-md p-2 mx-2 focus-within:border-primary-500 focus-within:border-2
                   focus-within:text-primary-500 " >
                    <div className="text-[13px] flex justify-between">
                      <span>Choice 2</span>
                      <span className="text-gray-500" >{choice2.length}/25</span>
                    </div>
                    <input maxLength={25} className="bg-black  w-full outline-none text-white" id="choice-2" value={choice2}
                      onChange={(e) => setChoice2(e.target.value)} />
                  </label>
                  {
                    pollOption > 2 &&
                    <label className="border  border-gray-700 rounded-md mx-2 p-2 focus-within:border-primary-500 focus-within:border-2
                   focus-within:text-primary-500 " >
                      <div className="text-[13px] flex justify-between">
                        <span>Choice 3 (Optional)</span>
                        <span className="text-gray-500" >{choice3.length}/25</span>
                      </div>
                      <input maxLength={25} className="bg-black  w-full outline-none text-white" id="choice-3" value={choice3}
                        onChange={(e) => setChoice3(e.target.value)} />
                    </label>
                  }
                  {
                    pollOption > 3 &&
                    <label className="border  border-gray-700 mx-2 rounded-md p-2 focus-within:border-primary-500 focus-within:border-2
                   focus-within:text-primary-500 " >
                      <div className="text-[13px] flex justify-between">
                        <span>Choice 4 (Optional)</span>
                        <span className="text-gray-500" >{choice4.length}/25</span>
                      </div>
                      <input maxLength={25} className="bg-black  w-full outline-none text-white" id="choice-4"
                        onChange={(e) => setChoice4(e.target.value)} />
                    </label>
                  }
                </div>
                {pollOption < 4 &&
                  <button className="font-mono text-[25px] text-primary-500 px-3 mr-2  mb-5 bg-primary-500 bg-opacity-0
                   hover:bg-opacity-30 self-end  rounded-full" onClick={() => setPollOption((n) => n + 1)}>
                    +
                  </button>
                }
              </div>

              {/* <Poll pollDayDuration={pollDayDuration} pollMinuteDuration={pollMinuteDuration} setPollHourDuration={setPollHourDuration}
                pollHourDuration={pollHourDuration} setPollDayDuration={setPollDayDuration} setPollMinuteDuration={setPollMinuteDuration}
              /> */}

              <button className="text-red-600 bg-red-950 bg-opacity-0 text-center  py-2.5 hover:bg-opacity-40 w-full"
                onClick={resetPoll} >Remove Poll</button>

            </div>
            :
            <>
              {
                previewImages.length > 0 &&
                <div className={`p-2.5 grid  gap-1 rounded max-h-[400px] ${previewImages.length < 2 ? `grid-cols-[1fr] max-w-[400px]` :
                  previewImages.length < 3 ? 'grid-cols-[1fr,1fr]' :
                    'grid-cols-2 grid-rows-2'
                  } `}>
                  {previewImages.map((file, index) =>
                    <div key={file.name} className={` max-h-[340px] overflow-clip rounded-xl border-gray-800 border p-1 px-3 relative`}>
                      <button className="absolute right-1  hover:bg-opacity-100 p-1 rounded-full bg-opacity-60 z-40 bg-gray-700 top-0 text-white"
                        onClick={() => handlePreviewDelete(index)}>
                        <Image src={'/assets/close.svg'} height={25} width={25} alt="remove" />
                      </button>
                      <img className=" h-full w-full object-contain" src={URL.createObjectURL(file)} alt="uploaded image" />
                    </div>
                  )}
                </div>
              }

              {
                previewGif.length > 0 &&
                <div className={` overflow-clip rounded-xl flex w-full border p-1 px-3 relative max-h-[400px]`}>
                  <button className="absolute right-1  hover:bg-opacity-100 p-1 rounded-full bg-opacity-60 z-40 bg-gray-700 top-0 text-white"
                    onClick={() => handleVideoGifDelete('gif')}>
                    <Image src={'/assets/close.svg'} height={25} width={25} alt="remove" />
                  </button>
                  <img className=" h-full w-full object-contain" src={URL.createObjectURL(previewGif[0])} alt="uploaded gif" />
                </div>
              }

              {
                previewVideo.length > 0 &&
                <div className={` overflow-clip rounded-xl flex w-full border p-1 px-3 relative max-h-[400px]`}>
                  <button className="absolute right-1  hover:bg-opacity-100 p-1 rounded-full bg-opacity-60 z-40 bg-gray-700 top-0 text-white"
                    onClick={() => handleVideoGifDelete('video')}>
                    <Image src={'/assets/close.svg'} height={25} width={25} alt="remove" />
                  </button>
                  <video className=" h-full w-full max-h-[400px]" src={URL.createObjectURL(previewVideo[0])} controls />
                </div>
              }
            </>
        }

        <div className="border-y mt-3 border-gray-700 rounded flex gap-3 py-2.5 px-4 ">
          <button disabled={isUploadDisabled} className={`${isUploadDisabled && 'opacity-40'}`}  >
            <Label htmlFor="file-upload" className={`${isUploadDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`} >
              <Image src={'/assets/create.svg'} height={25} width={25} alt="add image" />
              {!isUploadDisabled &&
                <Input id="file-upload" type="file" multiple className="hidden"
                  accept={`${previewImages.length > 0 ? 'image/jpeg,image/png,image/jpg' : 'image/*,video/*,image/gif'} `} onChange={handleFileChange} />
              }
            </Label>
          </button>
          <button disabled={isPollDisabled} className={`${isPollDisabled && 'opacity-40'} text-white flex `} onClick={() => { setIsPollActive(true) }}  >
            <Image src={'/assets/poll.svg'} height={25} width={25} alt="add poll" />Poll
          </button>
          <div className="font-mono text-primary-500 ml-auto mr-4">
            <span className={`${threadtext.length <= 300 && 'text-white'} ${threadtext.length > 300 && 'text-red-500'} `}>
              {threadtext.length}</span>
            /300
          </div>
        </div>
      </div>




      <Button onClick={handleThreadSubmit} disabled={(threadtext.length > 300 || threadtext.length == 0) ||
        (isPollActive && (choice2.length == 0 || choice1.length == 0)) || !postThreadAt}
        className={`bg-primary-500  `} >
        {loading ? <LoadingSpinner /> : 'Post Thread'}
      </Button>

    </main>
  );
}

export default PostThread;