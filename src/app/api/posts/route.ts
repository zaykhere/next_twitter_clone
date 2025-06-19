import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const userProfileId = searchParams.get('user');
  const { userId } = await auth();

  if (!userId) return;

  const page = searchParams.get('cursor');
  const LIMIT = 10;

  const whereCondition = userProfileId && userProfileId !== 'undefined'
    ? { parentPostId: null, userId: userProfileId }
    : {
      parentPostId: null,
      userId: {
        in: [
          userId,
          ...(
            await prisma.follow.findMany({
              where: { followerId: userId },
              select: { followingId: true },
            })
          ).map((follow) => follow.followingId),
        ],
      },
    };

    const postIncludeQuery = {
      user: { select: { displayName: true, username: true, img: true } },
      _count: { select: { likes: true, rePosts: true, comments: true } },
      likes: { where: { userId: userId }, select: { id: true } },
      rePosts: { where: { userId: userId }, select: { id: true } },
      saves: { where: { userId: userId }, select: { id: true } },
    };

  const posts = await prisma.post.findMany({ 
    where: whereCondition, 
    take: LIMIT, 
    skip: (Number(page) - 1) * LIMIT, 
    orderBy: {createdAt: 'desc'}, 
    include: {
      rePost: {
        include: postIncludeQuery,
      },
      ...postIncludeQuery,
    },
  });

  const totalPosts = await prisma.post.count({where: whereCondition});

  const hasMore = Number(page) * LIMIT < totalPosts;

  return NextResponse.json({posts, hasMore});
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();

    const { desc, img, video, imgHeight, isSensitive } = body;

    if (!desc) {
      return new Response('Invalid input', { status: 400 });
    }

    const newPost = await prisma.post.create({
      data: {
        desc,
        img,
        video,
        imgHeight,
        isSensitive,
        userId
      }
    })

    // Return a success response
    return Response.json({
      success: true,
      message: 'Post created successfully',
      data: newPost,
    });
  } catch (error: any) {
    console.error('POST /api/posts error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}