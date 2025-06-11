import React from 'react';
import Image from 'next/image';

const Share = () => {
  return (
    <div className='p-4 flex gap-4'>
      {/* AVATAR  */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden">
        <Image src="/general/avatar.png" alt='User avatar' width={100} height={100} />
      </div>
      {/* OTHERS  */}
      <div className="flex flex-1 flex-col gap-4">
        <input type="text" placeholder='What is happening?!' className='bg-transparent outline-none placeholder:text-textGray text-xl' />
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-4 flex-wrap ">
            <Image src="/icons/image.svg" alt="Add Image" width={20} height={20} className='cursor-pointer' />
            <Image src="/icons/gif.svg" alt="Add Gif" width={20} height={20} className='cursor-pointer' />
            <Image src="/icons/poll.svg" alt="Add Poll" width={20} height={20} className='cursor-pointer' />
            <Image src="/icons/emoji.svg" alt="Add Emoji" width={20} height={20} className='cursor-pointer' />
            <Image src="/icons/schedule.svg" alt="Schedule post" width={20} height={20} className='cursor-pointer' />
            <Image src="/icons/location.svg" alt="Add Location" width={20} height={20} className='cursor-pointer' />
          </div>
          <button className="bg-white text-black font-bold rounded-full py-2 px-4 cursor-pointer">Post</button>
        </div>
      </div>
    </div>
  )
}

export default Share