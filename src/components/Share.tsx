'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageKitAbortError, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload } from '@imagekit/next';
import { authenticator } from '@/app/utils/authenticator';
import ImageEditor from './ImageEditor';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

type PostData = {
  desc: string;
  img?: string | null;
  video?: string | null;
  imgHeight?: number | null;
  isSensitive: boolean;
}

const Share = () => {
  const [media, setMedia] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<{
    type: "original" | "wide" | "square";
    sensitive: boolean;
  }>({
    type: 'original',
    sensitive: false
  })

  const queryClient = useQueryClient();
  const router = useRouter();

  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");

  const {user} = useUser();

  useEffect(() => {
    if(error) {
      toast.error(error);
    }
  }, [error])
  
  const createPostMutation = useMutation({
    mutationFn: async (postData: PostData) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
  
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Failed to create post');
      }
  
      return res.json(); // You can return created post if you want to prepend manually
    },
  
    onSuccess: async () => {
      setDesc('');
      setSettings({ sensitive: false, type: 'original' });
      setMedia(null);
      setError('');
  
      // ✅ Re-render server component
      router.refresh();
  
      // ✅ Clear client cache *after* refresh to prevent duplication
      setTimeout(() => {
        queryClient.removeQueries({ queryKey: ['posts'], exact: false });
      }, 0);
    },
  
    onError: (error: any) => {
      setError(error?.message || 'Something went wrong');
    },
  
    onSettled: () => {
      setLoading(false);
    },
  });

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
      return {
        isImage: file.type.includes("image"),
        imageUrl: file.type.includes("image") ? uploadResponse.url : null,
        videoUrl: !file.type.includes("image") ? uploadResponse.url : null,
        height: uploadResponse.height
      }
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
    setLoading(true);
  
    const description = desc;
    const isSensitive = settings.sensitive;
  
    if (!description || description.length > 280) {
      !description
        ? setError('Description is required')
        : setError("Description can't exceed more than 280 characters");
      setLoading(false);
      return;
    }
  
    let fileUploadResponse;
  
    const postData: PostData = {
      desc: description,
      isSensitive,
    };
  
    if (media) {
      fileUploadResponse = await uploadFile(media);
  
      if (!fileUploadResponse) {
        setError('File upload failed. Try again!');
        setLoading(false);
        return;
      }
  
      if (fileUploadResponse.hasOwnProperty('isImage')) {
        postData.img = fileUploadResponse.imageUrl;
        postData.video = fileUploadResponse.videoUrl;
        postData.imgHeight = fileUploadResponse.isImage
          ? fileUploadResponse.height
          : null;
      }
    }
  
    createPostMutation.mutate(postData);
  }
  

  useEffect(() => {
    if(media) {
      const url = URL.createObjectURL(media)
      setPreviewUrl(url);
    }
    else {
      setPreviewUrl(null);
    }
  }, [media])
  // const previewUrl = media ? URL.createObjectURL(media) : null;

  return (
    <form className='p-4 flex gap-4' onSubmit={handleSubmit}>
      {error && <p>{error}</p>}
      {/* AVATAR  */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden">
        <Image src={user?.imageUrl || "/general/avatar.png"} alt='User avatar' width={100} height={100} />
      </div>
      {/* OTHERS  */}
      <div className="flex flex-1 flex-col gap-4">
        <input type="text" name='desc' placeholder='What is happening?!'
          className='bg-transparent outline-none placeholder:text-textGray text-xl' autoComplete="off" autoCorrect="off"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          />
        {/* preview image  */}
        {previewUrl && media?.type.includes("image") && (
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
            <div 
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm"
            onClick={() => setMedia(null)}>
              X
            </div>
          </div>
        )}
        {/* preview video  */}
        {media?.type.includes("video") && previewUrl && (
          <div className='relative'>
            <video src={previewUrl} controls />
            <div 
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm"
            onClick={() => setMedia(null)}>
              X
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
          <button className="bg-white text-black font-bold rounded-full py-2 px-4 cursor-pointer" type="submit" disabled={loading}>
            {loading ? 'Posting' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default Share