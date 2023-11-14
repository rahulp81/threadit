"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "@/lib/models/user.model";
import Thread from "@/lib/models/thread.models";
import Community from "@/lib/models/community.models";
import Comment from "@/lib/models/comment.model";
import mongoose from "mongoose";

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
      select: "id name image username",
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
      path: "community",
      model: Community,
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

  // Count the total number of top-level posts (threads) i.e., threads that are not comments.
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  postsQuery.lean();

  const posts = await postsQuery.exec();
  const isNext = totalPostsCount > skipAmount + posts.length;
  return { posts, isNext };
}

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
  mediaType?: string | null;
  mediaLink?: [string] | null;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
  mediaType,
  mediaLink,
}: Params) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: communityId, // Assign communityId if provided, or null for personal account
      media: {
        mediaType,
        mediaLink,
      },
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    if (communityId) {
      // Update Community model
      await Community.findByIdAndUpdate(communityId, {
        $push: { threads: createdThread._id },
      });
    }
    revalidatePath(path);
    return {
      sucess: `Created Post : ${createdThread._id}`,
      id: createdThread._id,
    };
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });
  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the thread to be deleted (the main thread)
    const mainThread = await Thread.findById(id).populate("author community");

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildThreads(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

export async function fetchThreadById(threadId: string) {
  try {
    connectToDB();
    const thread = (await Thread.findById(threadId)
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
      .exec()) as any;

    console.log("the thread is", thread);

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
  }
}

export async function addCommentToThread(
  mainThreadId: string,
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original thread by its ID
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId, // Set the parentId to the original thread's ID
      threadPostId: mainThreadId,
    });

    // Save the comment thread to the database
    const savedCommentThread = await commentThread.save();

    // Access the default _id field
    originalThread.comments.push(savedCommentThread._id);

    // Save the updated original thread to the database
    await originalThread.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}

export async function toggleThreadLike({
  threadId,
  likeActionBy,
  currentLikeStatus,
}: {
  threadId: String;
  likeActionBy: String;
  currentLikeStatus: Boolean;
}) {
  connectToDB();
  console.log({
    threadId,
    likeActionBy,
    currentLikeStatus,
  });

  try {
    const thread = await Thread.findById(threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (currentLikeStatus) {
      thread.likes.pull(likeActionBy);
      await thread.save();
      return { sucess: "Thread Unliked " };
    } else {
      thread.likes.addToSet(likeActionBy);
      await thread.save();
      return { sucess: "Thread Liked " };
    }
  } catch (error) {
    console.error("Error while toggling like:", error);
    throw new Error("Unable to toggle like ");
  }
}

export async function repostThread({
  userId,
  threadId,
}: {
  userId: string;
  threadId: string;
}) {
  try {
    connectToDB();
    const user = await User.findOne({ id: userId });
    if (!user) {
      throw new Error("User doesnt Exist ");
    }
    const threadToRepost = Thread.findById(threadId);
    if (!threadToRepost) {
      throw new Error("Thread doesnt Exist ");
    }
    const repost = new Thread({
      author: user._id,
      isRepost: threadId,
    });

    const savedRepostThread = await repost.save();
    console.log("saved is ", savedRepostThread);
    revalidatePath("/");
    user.threads.push(savedRepostThread._id);
    await user.save();
    return savedRepostThread._id;
  } catch (error) {
    console.error("Repost Error:", error);
  }
}

export async function qouteThread({
  qouteText,
  qouteThreadId,
  qouteByUser,
}: {
  qouteText: string;
  qouteThreadId: string;
  qouteByUser: string;
}) {
  try {
    connectToDB();
    const user = await User.findById(qouteByUser);
    if (!user) {
      throw new Error("User doesnt Exist ");
    }
    const threadToQoute = Thread.findById(qouteThreadId);
    if (!threadToQoute) {
      throw new Error("threadToQoute doesnt Exist ");
    }
    const qoute = new Thread({
      author: user._id,
      text: qouteText,
      isQuote: qouteThreadId,
    });

    const savedQouteThread = await qoute.save();
    console.log("saved is ", savedQouteThread);
    user.threads.push(savedQouteThread._id);
    await user.save();
    revalidatePath("/");
    return savedQouteThread._id;
  } catch (error) {
    console.error("Repost Error:", error);
  }
}

//For Nested Infite comment thread
// {
//   path: "replies", // Populate the children field within children
//   model: Comment, // The model of the nested children (assuming it's the same "Thread" model)
//   populate: {
//     path: "author", // Populate the author field within nested children
//     model: User,
//     select: "_id id name username image", // Select only _id and username fields of the author
//   },
// },

// export async function fetchThreadById(threadId: string) {
//   try {
//     connectToDB();
//     const thread = (await Thread.findById(threadId)
//       .populate({
//         path: "author",
//         model: User,
//         select: "_id id username name image",
//       }) // Populate the author field with _id and username
//       .populate({
//         path: "community",
//         model: Community,
//         select: "_id id name username image",
//       }) // Populate the community field with _id and name
//       .populate({
//         path: "comments",
//         match: { parentCommentId: null },
//         options: { sort: { likes: -1 } }, // Sort top-level comments by likes in descending order
//         populate: [
//           {
//             path: "author",
//             model: User,
//             select: "_id id name username image",
//           },
//         ],
//       })
//       .lean()
//       .exec()) as any;

//     thread.commentCount =await Comment.countDocuments({ thread: threadId });

//     const populateReplies = async (comment: any) => {
//       if (comment.replies && comment.replies.length > 0) {
//          await Comment.populate(comment, {
//           path: "replies",
//           options: { sort: { likes: -1 }, lean : true },
//           populate: {
//             path: "author",
//             model: User,
//             select: "_id id name username image",
//             options: { lean: true}
//           },
//         });
//       }

//       if (comment.replies && comment.replies.length > 0) {
//         // Recursively populate replies
//         for (const reply of comment.replies) {
//           await populateReplies(reply);
//         }
//       }
//     };

//     for (const comment of thread.comments) {
//       await populateReplies(comment);
//     }

//     // Log fullyPopulatedComments before sending it to the frontend
//     console.log("oop ", thread.comments.length);

//     return thread;
//   } catch (err) {
//     console.error("Error while fetching thread:", err);
//   }
// }

// export async function addCommentToThread(
//   threadId: string,
//   commentText: string,
//   userId: string,
//   path: string
// ) {
//   connectToDB();

//   try {
//     // Find the original thread by its ID
//     const originalThread = await Thread.findById(threadId);

//     if (!originalThread) {
//       throw new Error("Thread not found");
//     }

//     // Create the new comment thread
//     const commentThread = new Comment({
//       text: commentText,
//       author: userId, // userId is _id not id of (clerk auth)
//       parentCommentId: null,
//     });

//     // Save the comment thread to the database
//     const savedCommentThread = await commentThread.save();

//     // Access the default _id field
//     originalThread.comments.push(savedCommentThread._id);

//     // Save the updated original thread to the database
//     await originalThread.save();

//     revalidatePath(path);
//   } catch (err) {
//     console.error("Error while adding comment:", err);
//     throw new Error("Unable to add comment");
//   }
// }
