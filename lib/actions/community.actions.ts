"use server";

import { FilterQuery, SortOrder } from "mongoose";

import Community from "@/lib/models/community.models";
import Thread from "@/lib/models/thread.models";
import User from "@/lib/models/user.model";

import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";

type createCommunityProps = {
  createdBy: string;
  name: string;
  image?: string;
  bio?: string;
  viewSettings: "public" | "restricted" | string;
  postSettings: "public" | "restricted" | string;
  bannedUsers?: [];
};

export async function createCommunity({
  createdBy,
  name,
  image,
  bio,
  viewSettings,
  postSettings,
}: createCommunityProps) {
  try {
    connectToDB();

    console.log("input", {
      createdBy,
      name,
      image,
      bio,
      viewSettings,
      postSettings,
    });

    // Find the user with the provided unique id
    const user = await User.findOne({ id: createdBy });

    if (!user) {
      throw new Error("User not found"); // Handle the case if the user with the id is not found
    }

    const id = Date.now().toString();

    const newCommunity = new Community({
      id,
      name,
      image,
      bio,
      createdBy: user._id, // Use the mongoose ID of the user
      members: [user._id],
      viewSettings: "public",
      postSettings,
    });

    console.log(newCommunity);

    const createdCommunity = await newCommunity.save();

    // Update User model
    user.communities.push(createdCommunity._id);
    await user.save();

    return createdCommunity.id;
  } catch (error) {
    // Handle any errors
    console.error("Error creating community:", error);
    throw error;
  }
}

export async function checkCommunityExists(name: string) {
  try {
    connectToDB();
    const communityExists = await Community.findOne({ name: name });
    if (communityExists) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching community details:", error);
    throw error;
  }
}

export async function fetchCommunityDetails(id: string) {
  try {
    connectToDB();

    const communityDetails = await Community.findOne({ id }).populate([
      "createdBy",
      {
        path: "moderators",
        model: User,
        select: "name username image _id id",
      },
      {
        path: "members",
        model: User,
        select: "name username image _id id",
      },
      {
        path: "bannedUsers",
        model: User,
        select: "name username image _id id",
      },
    ]);

    return communityDetails;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community details:", error);
    throw error;
  }
}

export async function makeModerator({
  communityId,
  userId,
  requestBy,
}: {
  communityId: string;
  userId: string;
  requestBy: string;
}) {
  try {
    const community = await Community.findOne({ id: communityId }).populate([
      { path: "createdBy", model: User, select: "id" },
    ]);
    if (
      !(
        community.moderators.includes(requestBy) ||
        community.createdBy.id == requestBy
      )
    ) {
      return {
        fail: " Only moderator or owner has authorization for this action",
      };
    }
    if (!community.moderators.includes(userId)) {
      community.moderators.push(userId);
      await community.save();
      revalidatePath(`/communities/${communityId}`);
      return { success: true };
    } else {
      return { fail: " User already moderator" };
    }
  } catch (error) {
    console.error("Error fetching community details:", error);
    throw error;
  }
}

export async function removeModerator({
  communityId,
  userId,
  requestBy,
}: {
  communityId: string;
  userId: string;
  requestBy: string;
}) {
  try {
    const community = await Community.findOne({ id: communityId }).populate([
      { path: "createdBy", model: User, select: "id" },
    ]);
    if (!(community.createdBy.id == requestBy)) {
      return { fail: "Only moderator Owner has authorization for this action" };
    }
    if (community.moderators.includes(userId)) {
      await community.updateOne({ $pull: { moderators: userId } });
      revalidatePath(`/communities/${communityId}`);
      return { success: true };
    } else {
      return { fail: "User is not a moderator of this community" };
    }
  } catch (error) {
    console.error("Error fetching community details:", error);
    throw error;
  }
}

export async function banUser({
  userId,
  communityId,
  requestBy,
}: {
  userId: string;
  communityId: string;
  requestBy: string;
}) {
  try {
    const community = await Community.findOne({ id: communityId }).populate([
      { path: "createdBy", model: User, select: "id" },
    ]);
    if (
      !(
        community.moderators.includes(requestBy) ||
        community.createdBy.id == requestBy
      )
    ) {
      return {
        fail: " Only moderator or owner has authorization for this action",
      };
    }

    if (
      community.moderators.includes(userId) &&
      !(community.createdBy.id == requestBy)
    ) {
      return { fail: " The user is Moderator, contact the owner." };
    }

    await Community.updateOne(
      { id: community.id },
      {
        $pull: {
          members: userId,
        },
        $push: {
          bannedUsers: userId,
        },
      }
    );

    revalidatePath(`/communities/${communityId}`);

    return { sucess: "User banned" };
  } catch (error) {
    console.error("Error fetching community details:", error);
    throw error;
  }
}

export async function unBanUser({
  userId,
  communityId,
  requestBy,
}: {
  userId: string;
  communityId: string;
  requestBy: string;
}) {
  try {
    const community = await Community.findOne({ id: communityId }).populate([
      { path: "createdBy", model: User, select: "id" },
    ]);
    if (!(community.createdBy.id == requestBy)) {
      return { fail: " Only owner has authorization for this action" };
    }

    await Community.updateOne(
      { id: community.id },
      {
        $pull: {
          bannedUsers: userId,
        },
      }
    );

    revalidatePath(`/communities/${communityId}`);
    return { sucess: "User unbanned" };
  } catch (error) {
    console.error("Error fetching community details:", error);
    throw error;
  }
}

export async function fetchCommunityPosts(community_Id: string) {
  try {
    connectToDB();

    const postsQuery = Thread.find({
      parentId: { $in: [null, undefined] },
      community: community_Id,
    })
      .sort({ createdAt: "desc" })
      // .skip(skipAmount)
      // .limit(pageSize)
      .populate({
        path: "author",
        model: User,
        select: "id name image username",
      })
      .populate({
        path: "isQuote",
        model: Thread,
      })
      .populate({
        path: "community",
        model: Community,
      })
      .populate({
        path: "isRepost",
        model: Thread,
      })
      .populate({
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
      });

    postsQuery.lean();

    const posts = await postsQuery.exec();
    // const isNext = totalPostsCount > skipAmount + posts.length;
    // return { posts, isNext };
    return posts;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community posts:", error);
    throw error;
  }
}

export async function fetchCommunities({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    // Calculate the number of communities to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter communities.
    const query: FilterQuery<typeof Community> = {};

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched communities based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    // Create a query to fetch the communities based on the search and sort criteria.
    const communitiesQuery = Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("members");

    // Count the total number of communities that match the search criteria (without pagination).
    const totalCommunitiesCount = await Community.countDocuments(query);

    const communities = await communitiesQuery.exec();

    // Check if there are more communities beyond the current page.
    const isNext = totalCommunitiesCount > skipAmount + communities.length;

    return { communities, isNext };
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
}

export async function addMemberToCommunity(
  communityId: string,
  memberId: string
) {
  try {
    connectToDB();

    // Find the community by its unique id
    const community = await Community.findOne({ id: communityId });

    if (!community) {
      throw new Error("Community not found");
    }

    // Find the user by their unique id
    const user = await User.findOne({ id: memberId });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user is already a member of the community
    if (community.members.includes(user._id)) {
      throw new Error("User is already a member of the community");
    }

    // Add the user's _id to the members array in the community using $addToSet
    community.members.addToSet(user._id);
    await community.save();

    // Add the community's _id to the communities array in the user using $addToSet
    user.communities.addToSet(community._id);
    await user.save();

    revalidatePath(`/communities/${communityId}`);
    return { success: true };
  } catch (error) {
    // Handle any errors
    console.error("Error adding member to community:", error);
    throw error;
  }
}

export async function removeUserFromCommunity(
  userId: string,
  communityId: string
) {
  try {
    connectToDB();

    const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    if (!userIdObject) {
      throw new Error("User not found");
    }

    if (!communityIdObject) {
      throw new Error("Community not found");
    }

    // Remove the user's _id from the members array in the community
    await Community.updateOne(
      { _id: communityIdObject._id },
      {
        $pull: {
          members: userIdObject._id,
          moderators: userIdObject._id,
        },
      }
    );

    // Remove the community's _id from the communities array in the user
    await User.updateOne(
      { _id: userIdObject._id },
      { $pull: { communities: communityIdObject._id } }
    );
    revalidatePath(`/communities/${communityId}`);
    return { success: true };
  } catch (error) {
    // Handle any errors
    console.error("Error removing user from community:", error);
    throw error;
  }
}

export async function updateCommunityInfo(
  communityId: string,
  postSettings: string
) {
  try {
    connectToDB();
    console.log(" this is the input", communityId, postSettings);
    // Find the community by its _id and update the information
    const updatedCommunity = await Community.findOneAndUpdate(
      { _id: communityId },
      { postSettings: postSettings }
    );

    if (!updatedCommunity) {
      throw new Error("Community not found");
    }
    revalidatePath(`/communities/${communityId}`);
    return { updatedCommunity: "yes" };
  } catch (error) {
    // Handle any errors
    console.error("Error updating community information:", error);
    throw error;
  }
}

export async function deleteCommunity(communityId: string) {
  try {
    connectToDB();

    // Find the community by its ID and delete it
    const deletedCommunity = await Community.findOneAndDelete({
      id: communityId,
    });

    if (!deletedCommunity) {
      throw new Error("Community not found");
    }

    // Delete all threads associated with the community
    await Thread.deleteMany({ community: communityId });

    // Find all users who are part of the community
    const communityUsers = await User.find({ communities: communityId });

    // Remove the community from the 'communities' array for each user
    const updateUserPromises = communityUsers.map((user) => {
      user.communities.pull(communityId);
      return user.save();
    });

    await Promise.all(updateUserPromises);

    return deletedCommunity;
  } catch (error) {
    console.error("Error deleting community: ", error);
    throw error;
  }
}

export async function getUserCommunities(user_Id: string) {
  try {
    connectToDB();

    const userInfo = await User.findById(user_Id);

    const communities = await Community.find({
      _id: { $in: userInfo?.communities },
      bannedUsers: { $nin: [userInfo._id] }, // Exclude communities where the user is banned
      $or: [
        { postSettings: "public" },
        {
          postSettings: "restricted",
          $or: [
            { createdBy: userInfo._id },
            { moderators: { $in: [userInfo._id] } },
          ],
        },
      ],
    });
    return communities;
  } catch (error) {
    console.error("Error getting community: ", error);
    throw error;
  }
}
