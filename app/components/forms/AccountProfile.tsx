"use client"
import React, { ChangeEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userValidation } from '@/lib/validations/user'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Button } from '@/app/components/ui/button'
import * as z from 'zod'
import Image from 'next/image'
import { Textarea } from '@/app/components/ui/textarea'
import { isBase64Image } from '@/lib/utils'
import { useUploadThing } from '@/lib/uploadthing'
import { updateUser } from '@/lib/actions/user.actions'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

interface Props {
    user: {
        id: string,
        objectId: string,
        username: string,
        name: string,
        bio: string,
        image: string,
    };
    btnTitle: string;
}

function AccountProfile({ user, btnTitle }:
    Props) {

    const [files, setFiles] = useState<File[]>([]);
    const { startUpload } = useUploadThing('media')
    const pathname = usePathname()
    const router = useRouter()

    const form = useForm({
        resolver: zodResolver(userValidation),
        defaultValues: {
            profile_photo: user?.image ? user.image : "",
            name: user?.name ? user.name : "",
            username: user?.username ? user.username : "",
            bio: user?.bio ? user.bio : "",
        }
    })


    async function onSubmit(values: z.infer<typeof userValidation>) {
        const blob = values.profile_photo;
        const imageChanged = isBase64Image(blob);

        if (imageChanged) {
            const imageRes = await startUpload(files)

            if (imageRes && imageRes[0].url) {
                values.profile_photo = imageRes[0].url;
            }

        }

        await updateUser({
            username: values.username,
            name: values.name,
            bio: values.bio,
            image: values.profile_photo,
            path: pathname,
            userId: user.id,
        })

        if (pathname == '/profile/edit') {
            router.back()
        } else {
            router.push('/')
        }

    }

    const handleImage = (
        e: ChangeEvent<HTMLInputElement>,
        fieldChange: (value: string) => void
    ) => {
        e.preventDefault();

        const fileReader = new FileReader();

        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFiles(Array.from(e.target.files));

            if (!file.type.includes("image")) return;

            fileReader.onload = async (event) => {
                const imageDataUrl = event.target?.result?.toString() || "";
                fieldChange(imageDataUrl);
            };

            fileReader.readAsDataURL(file);
        }
    };


    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col justify-start gap-10 ">
                <FormField
                    control={form.control}
                    name="profile_photo"
                    render={({ field }) => (
                        <FormItem className='flex items-center gap-4'>
                            <FormLabel className='account-form_image-label'>
                                {field.value ? (
                                    <Image
                                        src={field.value}
                                        alt='profile photo'
                                        width={96}
                                        height={96}
                                        priority
                                        className='rounded-full object-contain'
                                    />
                                ) : (
                                    <Image
                                        src={'/assets/profile.svg'}
                                        alt='profile photo'
                                        width={24}
                                        height={24}
                                        className='object-contain'
                                    />
                                )}
                            </FormLabel>
                            <FormControl className='flex-1 text-base-semibold text-gray-200 '>
                                <Input type='file' accept='image/*' placeholder='Upload a photo' className='account-form_image-input'
                                    onChange={(e) => handleImage(e, field.onChange)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className='flex  flex-col gap-3 w-full'>
                            <FormLabel className='text-base-semibold text-light-2'>
                                Name
                            </FormLabel>
                            <FormControl className=''>
                                <Input type='text' placeholder='Name'
                                    className='account-form_input no-focus'
                                    {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem className='flex flex-col gap-3 w-full'>
                            <FormLabel className='text-base-semibold text-light-2'>
                                User Name
                            </FormLabel>
                            <FormControl className=''>
                                <Input type='text' placeholder='Add a username'
                                    className='account-form_input no-focus'
                                    {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem className='flex flex-col gap-3 w-full'>
                            <FormLabel className='text-base-semibold text-light-2'>
                                Bio
                            </FormLabel>
                            <FormControl className=''>
                                <Textarea
                                    rows={10}
                                    placeholder='Add your bio'
                                    className='account-form_input no-focus'
                                    {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className='bg-primary-500'>{btnTitle}</Button>
            </form>
        </Form>
    )
}

export default AccountProfile

