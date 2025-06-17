import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

const Recommendations = async () => {
  const { userId } = await auth();

  if (!userId) return;

  const followingIds = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followedUserIds = followingIds.map((f) => f.followingId);

  let friendRecommendations = await prisma.user.findMany({
    where: {
      id: { not: userId, notIn: followedUserIds },
      followings: { some: { followerId: { in: followedUserIds } } },
    },
    take: 3,
    select: { id: true, displayName: true, username: true, img: true },
  });

  if(friendRecommendations.length === 0) {
    friendRecommendations = await prisma.user.findMany({
      where: {
        id: {not: userId, notIn: followedUserIds}
      },
      take: 3,
      select: { id: true, displayName: true, username: true, img: true }
    })
  }

  return (
    <div className="p-4 rounded-2xl border-[1px] border-borderGray flex flex-col gap-4">
      {/* USER CARD */}
      {friendRecommendations?.map((person) => (
        <div className='flex items-center justify-between' key={person.id}>
        {/* IMAGE AND USER INFO */}
        <div className="flex items-center gap-2">
            <div className="relative rounded-full overflow-hidden w-10 h-10">
              <Image
                src={person.img || "/general/avatar.png"}
                alt={person.username}
                width={100}
                height={100}
              />
            </div>
            <div className="">
              <h1 className="text-md font-bold">{person.displayName || person.username}</h1>
              <span className="text-textGray text-sm">@{person.username}</span>
            </div>
          </div>
          {/* BUTTON */}
          <button className="py-1 px-4 font-semibold bg-white text-black rounded-full">
            Follow
          </button>
      </div>
      ))}
      
      <Link href="/" className="text-iconBlue">
        Show More
      </Link>
    </div>
  );
};

export default Recommendations;