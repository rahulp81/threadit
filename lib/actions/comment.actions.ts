"use server";

import { revalidatePath } from "next/cache";
import Comment from "../models/comment.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.models";

export async function toggleCommentLike({
  commentId,
  likeActionBy,
  currentLikeStatus,
}: {
  commentId: String;
  likeActionBy: String;
  currentLikeStatus: Boolean;
}) {
  try {
    connectToDB();
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }
    if (currentLikeStatus) {
      comment.likes.pull(likeActionBy);
      await comment.save();
      return { sucess: "Comment Unliked " };
    } else {
      comment.likes.addToSet(likeActionBy);
      await comment.save();
      return { sucess: "Comment Liked" };
    }
  } catch (error) {
    console.error("Error while toggling Comment like:", error);
    throw new Error("Unable to toggle Comment like ");
  }
}

export async function addReplyToComment({
  commentBy,
  onCommentId,
  commentText,
  path,
  threadId,
}: {
  onCommentId: string;
  commentBy: string;
  commentText: string;
  path: string;
  threadId: string;
}) {
  try {
    connectToDB();

    const originalThread = await Thread.findById(threadId);
    const parentComment = await Comment.findById(onCommentId);

    if (!parentComment) {
      throw new Error("Comment not found");
    }

    const reply = new Comment({
      text: commentText,
      author: commentBy, // commentBy is _id not id of (clerk auth)
      parentCommentId: onCommentId,
    });

    const savedReply = await reply.save();
    parentComment.replies.push(savedReply._id);
    originalThread.comments.push(savedReply._id);
    await parentComment.save();
    await originalThread.save();
    revalidatePath(path);
  } catch (error: any) {
    console.log(error);
    throw new Error(`Error while adding Reply to comment : ${error}`);
  }
}
