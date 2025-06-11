import React from 'react';
import Image from 'next/image';
import PostInfo from './PostInfo';
import PostInteractions from './PostInteractions';

const Post = () => {
  return (
    <div className='p-4 border-y-[1px] border-borderGray'>
        {/* POST TYPE  */}
        <div className="flex items-center gap-2 text-sm text-textGray mb-2 font-bold">
            <Image src="/svg/repost.svg" alt="repost icon" width={16} height={16} />
            <span>Zain reposted</span>
        </div>
        {/* POST CONTENT  */}
        <div className="flex gap-4">
            {/* USER AVATAR  */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image src="/general/avatar.png" alt="User avatar" width={100} height={100} />
            </div>
            {/* CONTENT  */}
            <div className="flex-1 flex-col gap-2">
                {/* TOP SECTION  */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className='text-md font-bold'>User Name</h1>
                        <span className='text-textGray'>@nameUser</span>
                        <span className='text-textGray'>1 day ago</span>
                    </div>
                    <PostInfo />
                </div>
                {/* TEXT & MEDIA  */}
                <p className='leading-[1.2] mb-3'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iure facilis nobis debitis consequuntur similique! Dicta, soluta! Natus consequuntur, officia dolores corporis perferendis in excepturi quisquam, ipsam, asperiores distinctio quis praesentium necessitatibus tempore eum accusantium dignissimos vitae. Vitae recusandae voluptatibus minima.</p>
                <Image src="/general/post.jpeg" alt="Post image" width={600} height={600} />
                <PostInteractions />
            </div>
        </div>
    </div>
  )
}

export default Post