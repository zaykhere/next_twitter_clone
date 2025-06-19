import React from 'react'
import Post from './Post'
import { prisma } from '@/prisma'
import { auth } from '@clerk/nextjs/server';
import InfiniteFeed from './InfiniteFeed';

const Feed = async ({userProfileId}: {userProfileId?: string}) => {
  const { userId } = await auth();

  if (!userId) return;

  const whereCondition = userProfileId
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

  let posts = await prisma.post.findMany(
    {where: whereCondition, 
      take: 3, 
      skip: 0, 
      orderBy: {createdAt: 'desc'}, 
      include: {
        rePost: {
          include: postIncludeQuery,
        },
        ...postIncludeQuery,
      },
  });

  if(posts.length === 0) {
    posts = await prisma.post.findMany({
      take: 3,
      orderBy: {createdAt: 'desc'},
      include: {
        rePost: {
          include: postIncludeQuery,
        },
        ...postIncludeQuery,
      },
    })
  }

  return (
    <div className=''>
        {/* {posts?.map((post) => (
          <div key={post.id}>
            <Post post={post as any}/>
          </div>
        ))} */}
        <InfiniteFeed userProfileId={userProfileId} />
    </div>
  )
}

export default Feed