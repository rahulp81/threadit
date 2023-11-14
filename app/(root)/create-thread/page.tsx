import PostThread from "@/app/components/forms/PostThread";
import { fetchCommunities, getUserCommunities } from "@/lib/actions/community.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import Community from "@/lib/models/community.models";
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"

async function page() {

    const user = await currentUser()

    if (!user) redirect('/sign-in');

    const userInfo = await fetchUser(user.id)

    if (!userInfo?.onboarded) redirect('/onboarding');

    const communities = await getUserCommunities(userInfo._id);

    const postLocationOptions = (communities && communities.length > 0) ?
    [{ name: 'Profile', image: userInfo.image }, ...communities] : [{ name: 'Profile', image: userInfo.image }];

    return (
        <>
            <h1 className="head-text">
                Create a Thread
            </h1>
            <PostThread  userId={userInfo._id} image={userInfo.image} communities={communities}
             postLocationOptions={postLocationOptions} postAt={{ name: 'Profile', image: userInfo.image }} />
        </>

    )
}

export default page
