'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageKitAbortError, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload } from '@imagekit/next';
import { authenticator } from '@/app/utils/authenticator';
import ImageEditor from './ImageEditor';

const Share = () => {
  const [media, setMedia] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [settings, setSettings] = useState<{
    type: "original" | "wide" | "square";
    sensitive: boolean;
  }>({
    type: 'original',
    sensitive: false
  })

  async function uploadFile(file: File) {
    let authParams;
    try {
      authParams = await authenticator();
    } catch (authError) {
      console.error("Failed to authenticate for upload:", authError);
      return;
    }
    const { signature, expire, token, publicKey } = authParams;

    const abortController = new AbortController();

    const transformation = `w-600, ${
      settings.type === "square"
        ? "ar-1-1"
        : settings.type === "wide"
        ? "ar-16-9"
        : ""
    }`;

    try {
      const uploadResponse = await upload({
        // Authentication parameters
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name + new Date().toISOString(), // Optionally set a custom file name
        folder: '/posts',
        ...(file.type.includes("image") && {
          transformation: {
            pre: transformation,
          },
        }),
        customMetadata: {
          sensitive: settings.sensitive,
        },
        // Progress callback to update upload progress state
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
        // Abort signal to allow cancellation of the upload if needed.
        abortSignal: abortController.signal,
      });
      console.log("Upload response:", uploadResponse);
    } catch (error) {
      // Handle specific error types provided by the ImageKit SDK.
      if (error instanceof ImageKitAbortError) {
        console.error("Upload aborted:", error.reason);
      } else if (error instanceof ImageKitInvalidRequestError) {
        console.error("Invalid request:", error.message);
      } else if (error instanceof ImageKitUploadNetworkError) {
        console.error("Network error:", error.message);
      } else if (error instanceof ImageKitServerError) {
        console.error("Server error:", error.message);
      } else {
        // Handle any other errors that may occur.
        console.error("Upload error:", error);
      }
    }

  }

  async function handleMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files?.[0]) {
      setMedia(e.target.files[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    uploadFile(media as File);
  }

  const previewUrl = media ? URL.createObjectURL(media) : null;

  return (
    <form className='p-4 flex gap-4' onSubmit={handleSubmit}>
      {/* AVATAR  */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden">
        <Image src="/general/avatar.png" alt='User avatar' width={100} height={100} />
      </div>
      {/* OTHERS  */}
      <div className="flex flex-1 flex-col gap-4">
        <input type="text" name='desc' placeholder='What is happening?!'
          className='bg-transparent outline-none placeholder:text-textGray text-xl' autoComplete="off" autoCorrect="off" />
        {/* preview image  */}
        {previewUrl && (
          <div className='relative rounded-xl overflow-hidden'>
            <Image src={previewUrl} alt='preview post image' width={600} height={600} className={`w-full ${settings.type === "original"
              ? "h-full object-contain"
              : settings.type === "square"
                ? "aspect-square object-cover"
                : "aspect-video object-cover"
              }`} />
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white py-1 px-4 rounded-full font-bold text-sm cursor-pointer"
              onClick={() => setIsEditorOpen(true)}>
              Edit
            </div>
          </div>
        )}
        {isEditorOpen && previewUrl && (
          <ImageEditor
            onClose={() => setIsEditorOpen(false)} previewUrl={previewUrl} settings={settings} setSettings={setSettings} />
        )}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-4 flex-wrap ">
            <input className='hidden' name='file' type="file" onChange={handleMediaChange} id="file" />
            <label htmlFor="file">
              <Image src="/icons/image.svg" alt="Add Image" width={20} height={20} className='cursor-pointer' />
            </label>

            <Image src="/icons/gif.svg" alt="Add Gif" width={20} height={20} className='cursor-pointer' />
            <Image src="/icons/poll.svg" alt="Add Poll" width={20} height={20} className='cursor-pointer' />
            <Image src="/icons/emoji.svg" alt="Add Emoji" width={20} height={20} className='cursor-pointer' />
            <Image src="/icons/schedule.svg" alt="Schedule post" width={20} height={20} className='cursor-pointer' />
            <Image src="/icons/location.svg" alt="Add Location" width={20} height={20} className='cursor-pointer' />
          </div>
          <button className="bg-white text-black font-bold rounded-full py-2 px-4 cursor-pointer">Post</button>
        </div>
      </div>
    </form>
  )
}

export default Share