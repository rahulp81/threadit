import { redirect } from "next/navigation";

import { fetchUserPosts } from "@/lib/actions/user.actions";

import ThreadCard from "../cards/ThreadCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";
import Feed from "./Feed";

interface Result {
  _id : string,
  name: string;
  image: string;
  bio : string;
  id: string;
  createdBy : {

  }
  threads: {
    _id: string;
    text: string;
    parentId: string | null;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    createdAt: string;
    children: {
      author: {
        image: string;
      };
    }[];
  }[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
  currentUser_ID : string
}

async function ThreadsTab({ currentUserId, accountId, accountType,currentUser_ID }: Props) {
  let threads: any;

  if (accountType === "Community") {
    threads = await fetchCommunityPosts(accountId);
  } else {
    threads = await fetchUserPosts(accountId);
  }

  if (!threads) {
   return <h2 className="text-white text-[20px] mt-10 ml-5">No Threads Found</h2>
  }

  return (
    <>
      <Feed currentUser={currentUserId} posts={threads} currentUser_ID= {currentUser_ID} />
    </>
  );
}

export default ThreadsTab;