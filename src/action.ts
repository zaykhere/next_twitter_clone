"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";

export const likePost = async (postId: number) => {
  const {userId} = await auth();

  if(!userId) return;

  const existingLike = await prisma.like.findFirst({
    where: {
      userId,
      postId
    }
  });

  if(existingLike) {
    await prisma.like.delete({
      where: {
        id: existingLike.id
      }
    })
  } else {
    await prisma.like.create({
      data: {
        userId,
        postId
      }
    })
  }
}

export const rePost = async (postId: number) => {
  const {userId} = await auth();

  if(!userId) return;

  const existingRepost = await prisma.post.findFirst({
    where: {
      userId,
      rePostId: postId
    }
  });

  if(existingRepost) {
    await prisma.post.delete({
      where: {
        id: existingRepost.id
      }
    })
  } else {
    await prisma.post.create({
      data: {
        userId,
        rePostId: postId
      }
    })
  }
}

export const savePost = async (postId: number) => {
  const {userId} = await auth();

  if(!userId) return;

  const existingSavedPost = await prisma.savedPosts.findFirst({
    where: {
      userId,
      postId: postId
    }
  });

  if(existingSavedPost) {
    await prisma.savedPosts.delete({
      where: {
        id: existingSavedPost.id
      }
    })
  } else {
    await prisma.savedPosts.create({
      data: {
        userId,
        postId: postId
      }
    })
  }
}

export const addComment = async (prevState: {success: boolean, error: boolean}, formData: FormData) => {
  const {userId} = await auth();

  if(!userId) return {
    success: false,
    error: true
  }

  const postId = formData.get("postId")
  const desc = formData.get("desc")
  const username = formData.get("username");

  const Comment = z.object({
    parentPostId: z.number(),
    desc: z.string().max(280)
  });

  const validatedFields = Comment.safeParse({
    parentPostId: Number(postId),
    desc
  });

  console.log({validatedFields})

  if(!validatedFields.success) {
    return {
      success: false,
      error: true
    }
  }

  try {
    await prisma.post.create({
      data: {
        ...validatedFields.data,
        userId
      }
    });

    revalidatePath(`/${username}/status/${postId}`)

    return {
      success: true,
      error: false
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: true
    }
  }
}