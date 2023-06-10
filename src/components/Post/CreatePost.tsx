import { useState, useRef, useEffect } from "react";
// import SwitchTheme from "~/components/SwitchTheme";
import { api } from "~/utils/api";

import { useUser } from "@clerk/nextjs";
import Image from 'next/image'
import { useContext } from "react";
import { FeedContext } from "~/components/Layouts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import DragAndDropImages from "../ImagePostWidget";

// Handler for creating a post
const CreatePost = () => {
  const { ctxFeed } = useContext(FeedContext);
  const { user } = useUser();

  const [content, setContent] = useState("");

  const submitRef = useRef<HTMLButtonElement>(null);
  const fileBtnRef = useRef<HTMLButtonElement>(null);

  const maxTextLimit = 280;
  const [textLimitCount, setTextLimitCount] = useState(0);

  useEffect(() => {
    setTextLimitCount(content.length);
  }, [content])


  const ctx = api.useContext();

  // Handler for post creating
  const { mutate } = api.posts.createPost.useMutation({
    onSuccess: () => {
      // Resets the text content
      setContent("");

      // Invalidates the cache for the feed and space posts
      void ctx.spaces.getSpacePostsById.invalidate();
      void ctx.feeds.getInfiniteFeedPostsById.invalidate();
    },

    onError: (error) => {
      console.log(error);
    },
  });

  // Even if images is empty, it will still create a post
  function onImagesUploaded(imageUrls: string[]) {
    mutate({
      content: content,
      images: imageUrls,
      spaceId: ctxFeed,
    });
  }

  function triggerUpload() {
    submitRef.current?.click();
  }


  if (!user) {
    return <></>;
  }
  return (
    <div className="bg-base-300 bg-opacity-50 rounded-2xl flex gap-2 flex-col w-full max-w-lg px-4 py-4 pb-6 mb-2">
      <div className=" flex flex-col gap-4 w-full">
        <div className="flex gap-2">
          <Image
            width={128}
            height={128}
            src={user.profileImageUrl}
            alt="Profile Image" className="h-14 w-14 rounded-full" />
        </div>
        <div className="relative">
          <textarea
            className="input py-2 w-full resize-none min-h-[8rem] pr-12 pt-2"
            maxLength={maxTextLimit}
            placeholder="Write your thoughts here.."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                triggerUpload();
              }
            }}
          >
          </textarea>
          <span className="absolute right-0 m-1 text-xs opacity-20">{textLimitCount} / { maxTextLimit }</span>
        </div>
      </div>

      {/* 
          The refs interact with the component, when it submits, it runs
          the onImagesUploaded function, which is passed in as a prop
      */}
      <DragAndDropImages onImagesUploaded={onImagesUploaded} submitRef={submitRef} fileBtnRef={fileBtnRef} />
      <div className="flex justify-between">
        
        {/* this button clicks a button embedded inside the DragAndDropImages form
            this opens up the file dialog */}
        <button
          onClick={() => fileBtnRef.current?.click()}
          className='btn btn-ghost btn-square mx-4 mb-2 text-3xl'>
          <FontAwesomeIcon icon={faImage} />
        </button>

        {/* This button triggers DragAndDropImages to attempt an upload */}
        <button onClick={triggerUpload} className="btn btn-primary px-8 btn-md">
          <FontAwesomeIcon icon={faPaperPlane} />
          <span>Post</span>
        </button>
      </div>
    </div >
  )
}

export default CreatePost;