import Feed from "@/components/Feed";
import FollowButton from "@/components/FollowButton";
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const UserPage = async ({params}: {
  params: Promise<{username: string}>
}) => {
  const { userId } = await auth();
  
  if (!userId) return;

  const username = (await params).username;

  const user = await prisma.user.findUnique({
    where: { username: username },
    include: {
      _count: { select: { followers: true, followings: true } },
      followings: userId ? { where: { followerId: userId } } : undefined,
    },
  });

  if (!user) return notFound();

  return (
    <div className="">
      {/* PROFILE TITLE */}
      <div className="flex items-center gap-8 sticky top-0 backdrop-blur-md p-4 z-10 bg-[#00000084]">
        <Link href="/">
          <Image src="/icons/back.svg" alt="back" width={24} height={24} />
        </Link>
        <h1 className="font-bold text-lg">{user.displayName}</h1>
      </div>
      {/* INFO */}
      <div className="">
        {/* COVER & AVATAR CONTAINER */}
        <div className="relative w-full">
          {/* COVER */}
          <div className="w-full aspect-[3/1] relative">
            <Image src={`${user.cover || '/general/cover.jpg'}`} alt="" width={600} height={200} />
          </div>
          {/* AVATAR */}
          <div className="w-1/5 aspect-square rounded-full overflow-hidden border-4 border-black bg-gray-300 absolute left-4 -translate-y-1/2">
            <Image src={`${user.img || '/general/avatar.png'}`} alt="profile image" width={100} height={100} />
          </div>
        </div>
        <div className="flex w-full items-center justify-end gap-2 p-2">
          <div className="w-9 h-9 flex items-center justify-center rounded-full border-[1px] border-gray-500 cursor-pointer">
            <Image src="/icons/more.svg" alt="more" width={20} height={20} />
          </div>
          <div className="w-9 h-9 flex items-center justify-center rounded-full border-[1px] border-gray-500 cursor-pointer">
            <Image src="/icons/explore.svg" alt="more" width={20} height={20} />
          </div>
          <div className="w-9 h-9 flex items-center justify-center rounded-full border-[1px] border-gray-500 cursor-pointer">
            <Image src="/icons/message.svg" alt="more" width={20} height={20} />
          </div>
          {userId && userId !== user.id && (
            <FollowButton userId={user.id} isFollowed={!!user.followings.length} />
          )}
          
          
        </div>
        {/* USER DETAILS */}
        <div className="p-4 flex flex-col gap-2">
          {/* USERNAME & HANDLE */}
          <div className="">
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            <span className="text-textGray text-sm">@{user.username}</span>
          </div>
          {user.bio && (
            <p>{user.bio}</p>
          )}
          
          {/* JOB & LOCATION & DATE */}
          <div className="flex gap-4 text-textGray text-[15px]">
            {user.location && (
              <div className="flex items-center gap-2">
                <Image
                src="/icons/userLocation.svg"
                alt="location"
                width={20}
                height={20}
                />
                <span>{user.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Image src="/icons/date.svg" alt="date" width={20} height={20} />
              <span>Joined {user.createdAt.toDateString()}</span>
            </div>
          </div>
          {/* FOLLOWINGS & FOLLOWERS */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold">{user._count.followers}</span>
              <span className="text-textGray text-[15px]">Followers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{user._count.followings}</span>
              <span className="text-textGray text-[15px]">Followings</span>
            </div>
          </div>
        </div>
      </div>
      {/* FEED */}
      <Feed userProfileId={user.id} />
    </div>
  );
};

export default UserPage;