import { useState, useRef, useEffect, ChangeEvent } from "react";
// import SwitchTheme from "~/components/SwitchTheme";
import { api } from "~/utils/api";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useContext } from "react";
import { FeedContext } from "~/components/Layouts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import DragAndDropImages from "../ImagePostWidget";
import { LoadingSkeleton } from "../SkeletonViews/FeedSkeletons";

// Handler for creating a post
const CreatePost = () => {
  const { ctxFeed } = useContext(FeedContext);
  const { user } = useUser();

  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const MAX_CONSECUTIVE_NEW_LINES = 2; // Maximum number of consecutive new lines between lines

  // Handle text input change
  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const text: string = event.target.value;
    const cleanedText: string = cleanText(text);
    setContent(cleanedText);
  };

  // Clean text by limiting consecutive new lines between lines
  const cleanText = (text: string): string => {
    const cleanedText: string = text.replace(
      /\n{3,}/g,
      "\n".repeat(MAX_CONSECUTIVE_NEW_LINES)
    );

    return cleanedText;
  };

  const submitRef = useRef<HTMLButtonElement>(null);
  const fileBtnRef = useRef<HTMLButtonElement>(null);

  const maxTextLimit = 280;
  const [textLimitCount, setTextLimitCount] = useState(0);

  useEffect(() => {
    setTextLimitCount(content.length);
  }, [content]);

  const ctx = api.useContext();

  // Handler for post creating
  const { mutate } = api.posts.createPost.useMutation({
    onSuccess: () => {
      // Resets the text content
      setIsPosting(false);
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
    if (content.length === 0 && imageUrls.length === 0) {
      return;
    }
    if (content.trim().length === 0 && imageUrls.length === 0) {
      return;
    }

    void mutate({
      content: content,
      images: imageUrls,
      spaceId: ctxFeed,
    });
    setContent("");
  }

  function triggerUpload() {
    submitRef.current?.click();
  }

  if (!user) {
    return <></>;
  }
  return (
    <div className="mb-2 flex w-full max-w-lg flex-col gap-2 rounded-2xl bg-base-300 bg-opacity-50 px-4 py-4 pb-6">
      <div className=" flex w-full flex-col gap-4">
        <div className="flex gap-2">
          <Image
            width={128}
            height={128}
            src={user.profileImageUrl}
            alt="Profile Image"
            className="h-14 w-14 rounded-full"
          />
        </div>
        {!isPosting && (
          <div className="relative">
            <textarea
              className="input min-h-[8rem] w-full resize-none py-2 pr-12 pt-2 "
              maxLength={maxTextLimit}
              placeholder="Write your thoughts here.."
              value={content}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.shiftKey === false) {
                  triggerUpload();
                  setIsPosting(true);
                }
              }}
            ></textarea>
            <span className="absolute right-0 m-1 text-xs opacity-20">
              {textLimitCount} / {maxTextLimit}
            </span>
          </div>
        )}
        {isPosting && (
          <div className="flex h-full min-h-[8rem] w-full animate-pulse flex-col items-center justify-center bg-base-300 py-2 pr-12 pt-2"></div>
        )}
      </div>

      {/* 
          The refs interact with the component, when it submits, it runs
          the onImagesUploaded function, which is passed in as a prop
      */}
      <DragAndDropImages
        onImagesUploaded={onImagesUploaded}
        submitRef={submitRef}
        fileBtnRef={fileBtnRef}
      />
      <div className="flex justify-between">
        {/* this button clicks a button embedded inside the DragAndDropImages form
            this opens up the file dialog */}
        <button
          onClick={() => fileBtnRef.current?.click()}
          className="btn-ghost btn-square btn mx-4 mb-2 text-3xl"
        >
          <FontAwesomeIcon icon={faImage} />
        </button>

        {/* This button triggers DragAndDropImages to attempt an upload */}
        <button onClick={triggerUpload} className="btn-primary btn-md btn px-8">
          <FontAwesomeIcon icon={faPaperPlane} />
          <span>Post</span>
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
