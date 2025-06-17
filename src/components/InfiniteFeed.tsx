"use client";

import { useInfiniteQuery } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from './Post';
import Loader from './Loader';

const fetchPosts = async (pageParam: number, userProfileId?: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL!;
  const res = await fetch(`${baseUrl}/api/posts?cursor=${pageParam}&user=${userProfileId}`);

  return res.json();
}

const InfiniteFeed = ({userProfileId}: {userProfileId?: string}) => {
  const {data, error, status, hasNextPage, fetchNextPage} = useInfiniteQuery({
    queryKey: ["posts"], 
    queryFn: ({pageParam = 2}) => fetchPosts(pageParam, userProfileId),
    initialPageParam: 2,
    getNextPageParam: (lastPage, pages) => lastPage.hasMore ? pages.length+2 : undefined
  })

  if(error) return "Something went wrong!";

  if(status === 'pending') return <Loader />;

  const allPosts = data?.pages?.flatMap((page) => page.posts) || [];

  console.log({post: allPosts?.[0]})

  return (
    <InfiniteScroll 
      dataLength={allPosts.length} 
      next={fetchNextPage} 
      hasMore={hasNextPage} 
      loader={<Loader />}
      >
        {allPosts?.map((post) => (
          <Post key={post.id} post={post} />
        ))}
    </InfiniteScroll>
  )
}

export default InfiniteFeed