"use server";

import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs";
import Community from "../models/community.models";
import Thread from "../models/thread.models";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";
import { NextResponse } from "next/server";

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User.findOne({ id: userId }).populate([
      {
        path: "followers",
        model: User,
        select: "name username image _id id",
      },
      {
        path: "following",
        model: User,
        select: "name username image _id id",
      },
    ]);
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserName(userId: string) {
  try {
    connectToDB();
    const user = await User.findById(userId);
    return user.username;
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function userInfoFrom_id(id: string) {
  try {
    connectToDB();
    const user = await User.findById(id);

    return {
      id: user.id,
      name: user.name,
      image: user.image,
      _id: user._id.toString(),
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {
  try {
    connectToDB();

    const params = { firstName: name, username: username };
    const updatedUser = await clerkClient.users.updateUser(userId, params);

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error(`Username ${error.keyValue.username} is already taken`);
    } else {
      throw new Error(`Error while onboarding, ${error}`);
    }
  }
}

export async function checkUsername(username: string) {
  try {
    connectToDB();
    const userExist = await User.findOne({ username: username });
    return !!userExist;
  } catch (error) {
    throw new Error(`Error chekcing username - ${error}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    const posts = Thread.find({
      parentId: { $in: [null, undefined] },
      author: userId,
    })
      .sort({ createdAt: "desc" })
      // .skip(skipAmount)
      // .limit(pageSize)
       .populate({
        path: "author",
        model: User,
        select: "_id id username name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "community",
        model: Community,
        select: "_id id name username image",
      }) // Populate the community field with _id and name
      .populate({
        path: "comments",
        model: Thread,
        options: { sort: { likes: "desc" } },
        populate: [
          {
            path: "author",
            model: User,
            select: "id name image username",
          },
          {
            path: "comments",
            model: Thread,
            options: { sort: { likes: "desc" } },
            populate: [
              {
                path: "author",
                model: User,
                select: "id name image username",
              },
            ],
          },
        ],
      })
      .populate({
        path: "isQuote",
        model: Thread,
        populate: [
          {
            path: "author",
            model: User,
            select: "id name image username",
          },
          {
            path: "comments",
            model: Thread,
            populate: [
              {
                path: "author",
                model: User,
                select: "id name image username",
              },
              {
                path: "comments",
                model: Thread,
                populate: [
                  {
                    path: "author",
                    model: User,
                    select: "id name image username",
                  },
                ],
              },
            ],
          },
        ],
      })
      .populate({
        path: "isRepost",
        model: Thread,
        populate: [
          {
            path: "author",
            model: User,
            select: "id name image username",
          },
          {
            path: "comments",
            model: Thread,
            populate: [
              {
                path: "author",
                model: User,
                select: "id name image username",
              },
              {
                path: "comments",
                model: Thread,
                populate: [
                  {
                    path: "author",
                    model: User,
                    select: "id name image username",
                  },
                ],
              },
            ],
          },
        ],
      })
      .lean()
      .exec() as any;

    // const isNext = totalPostsCount > skipAmount + posts.length;
    // return { posts, isNext };
    return posts;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching user posts:", error);
    throw error;
  }
}

// Almost similar to Thead (search + pagination) and Community (search + pagination)
export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    // Calculate the number of users to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter users.
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }, // Exclude the current user from the results.
    };

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched users based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of users that match the search criteria (without pagination).
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    // Check if there are more users beyond the current page.
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// export async function getActivity(userId: string) {
//   try {
//     connectToDB();

//     // Find all threads created by the user
//     const userThreads = await Thread.find({ author: userId });

//     // Collect all the child thread ids (replies) from the 'children' field of each user thread
//     const childThreadIds = userThreads.reduce((acc, userThread) => {
//       return acc.concat(userThread.children);
//     }, []);

//     // Find and return the child threads (replies) excluding the ones created by the same user
//     const replies = await Thread.find({
//       _id: { $in: childThreadIds },
//       author: { $ne: userId }, // Exclude threads authored by the same user
//     }).populate({
//       path: "author",
//       model: User,
//       select: "name image _id",
//     });

//     return replies;
//   } catch (error) {
//     console.error("Error fetching replies: ", error);
//     throw error;
//   }
// }

export async function followUser(
  userToFollowId: string,
  userId: string,
  path: string
) {
  try {
    connectToDB();

    // Find the community by its unique id
    const userToFollow = await User.findOne({ id: userToFollowId });

    if (!userToFollow) {
      throw new Error("User to follow not found");
    }

    // Find the user by their unique id
    const user = await User.findOne({ id: userId });

    if (!user) {
      throw new Error("User details not found, please relogin or re register");
    }

    // Add the user's _id to the user to follow's followers array in the user using $addToSet
    userToFollow.followers.addToSet(user._id);
    await userToFollow.save();

    // Add the userToFollow's _id to the user's following  array  using $addToSet
    user.following.addToSet(userToFollow._id);
    await user.save();

    revalidatePath(path);
    return { success: true };
  } catch (error) {
    // Handle any errors
    console.error("Error adding member to community:", error);
    throw error;
  }
}

export async function unfollowUser(
  userToUnFollowId: string,
  userId: string,
  path: string
) {
  try {
    connectToDB();

    const userToUnFollow = await User.findOne(
      { id: userToUnFollowId },
      { _id: 1 }
    );
    const user = await User.findOne({ id: userId }, { _id: 1 });

    if (!userToUnFollow) {
      throw new Error("User to unfollow not found");
    }

    if (!user) {
      throw new Error("User not found, please re login");
    }

    // Remove the user's _id from the user to follows  follower array in the community
    await User.updateOne(
      { _id: userToUnFollow._id },
      {
        $pull: {
          followers: user._id,
        },
      }
    );

    // Remove the userToFollows 's _id from the user following array in the user
    await User.updateOne(
      { _id: user._id },
      { $pull: { following: userToUnFollow._id } }
    );
    revalidatePath(path);
    return { success: true };
  } catch (error) {
    // Handle any errors
    console.error("Error removing user from community:", error);
    throw error;
  }
}

export async function isUserFollowing({
  currentUser,
  actionUserId,
}: {
  currentUser: any;
  actionUserId: any;
}) {

  const isFollower = await User.exists({
    _id: actionUserId,
    followers: { $in: [currentUser] },
  });

  return !!isFollower;

}
