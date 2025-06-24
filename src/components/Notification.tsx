"use client";

import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { socket } from '@/socket';
import { useRouter } from "next/navigation";

type NotificationType = {
  id: string;
  senderUsername: string;
  type: "like" | "comment" | "rePost" | "follow";
  link: string
}

const Notification = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    socket.on("getNotification", (data: NotificationType) => {
      console.log({data})
      setNotifications((prev) => [...prev, data]);
    })
  }, [])

  const router = useRouter();

  const reset = () => {
    setNotifications([]);
    setOpen(false);
  };

  const handleClick = (notification: NotificationType) => {
    const filteredList = notifications.filter((n) => n.id !== notification.id);
    setNotifications(filteredList);
    setOpen(false);
    router.push(notification.link);
  };

  return (
    <div className="relative">
      <div
        className="cursor-pointer p-2 rounded-full hover:bg-[#181818] flex items-center gap-4" onClick={() => setOpen(!open)}
      >
        <div className="relative">
        <Image
          src={`/icons/notification.svg`}
          alt="notification"
          width={24}
          height={24}
        />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-iconBlue text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            {notifications.length}
         </span>
        )}
        
        </div>
        
        <span className="hidden xxl:inline">Notifications</span>
      </div>
      {open && (
        <div className="absolute -right-full p-4 rounded-lg bg-white text-black flex flex-col gap-4 w-max">
        <h1 className="text-xl text-textGray">Notifications</h1>
        {notifications.map((notification) => {
          return (
            <div className='cursor-pointer' key={notification.id} onClick={() => handleClick(notification)}>
              <b> {notification.senderUsername} </b> {" "} {notification.type === 'like' ? 'liked your post' : notification.type === 'rePost' ? "reposted your post" : notification.type === 'comment' ? "replied to your post" : "followed you"}
            </div>
          )
        })}
        {notifications.length > 0 && (
          <button
          onClick={reset}
          className="bg-black text-white p-2 text-sm rounded-lg cursor-pointer"
          >
            Mark as read
          </button>
        )}
        
      </div>
      )}
      
    </div>

  )
}

export default Notification