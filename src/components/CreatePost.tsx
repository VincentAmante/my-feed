import { useState, useRef } from "react";
// import SwitchTheme from "~/components/SwitchTheme";
import { api } from "~/utils/api";

import { useAuth, useUser } from "@clerk/nextjs";
import Image from 'next/image'
import UploadWidget from "~/components/UploadWidget";
import { useContext } from "react";
import { FeedContext } from "~/components/Layouts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWind } from "@fortawesome/free-solid-svg-icons";
import DragAndDropImages from "./DragAndDropImages";

// Handler for creating a post
const CreatePost = () => {
    const { ctxFeed } = useContext(FeedContext);
  
    const { user } = useUser();
    const [content, setContent] = useState("");
  
    const submitRef = useRef<HTMLButtonElement>(null);
  
    const ctx = api.useContext();
  
    const { mutate } = api.posts.createPost.useMutation({
      onSuccess: () => {
        setContent("");
        void ctx.spaces.getSpacePostsById.invalidate();
        void ctx.feeds.getFeedPostsById.invalidate();
      },
  
      onError: (error) => {
        console.log(error);
      },
    });

    function onImagesUploaded(imageUrls: string[]) {
        mutate({
          content: content,
          images: imageUrls,
          spaceId: ctxFeed,
        });
      }
  
    if (!user) {
      return <></>;
    }
  
    function triggerUpload() {
      submitRef.current?.click();
    }
  
    return (
      <div className="flex gap-2 flex-col w-full max-w-lg">
        <div className="flex items-center gap-2 w-full">
          <Image
            width={128}
            height={128}
            src={user.profileImageUrl}
            alt="Profile Image" className="h-14 w-14 rounded-full" />
          <input
            className="input input-ghost w-full"
            placeholder="Write your thoughts here.."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                triggerUpload();
              }
            }}
          >
          </input>
        </div>
        <DragAndDropImages submitRef={submitRef} onImagesUploaded={onImagesUploaded} />
        {/* <UploadWidget submitRef={submitRef} onUpload={handleUpload}></UploadWidget> */}
      </div >
    )
}
  
export default CreatePost;