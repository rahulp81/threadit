"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"

interface Params {
    userId : string,
    name : string,
    bio : string,
    image : string,
    path : string,
    username : string
}

export async function updateUser(
    {userId , name  , bio , image , path  , username } : Params
) : Promise<void> {
    connectToDB();

   try {
    await User.findOneAndUpdate(
        {id : userId},
        {
            username : username.toLowerCase(),
            name,
            bio,
            image,
            onboarded : true,
        },
        {upsert : true}
    );

    if(path == '/profile/edit'){
        revalidatePath(path)
    }
   } catch (error : any) {
    throw new  Error('Failed ', error.message)
   }

}


export async function fetchUser(userId : string){
    try {
        connectToDB();

        return await User
        .findOne({id : userId})
    } catch (error : any) {
        throw new Error('Failed to fetch User', error)
    }
}