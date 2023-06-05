import { useState, useRef, type ReactElement, useEffect } from "react";
// import SwitchTheme from "~/components/SwitchTheme";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import UserPost from '~/components/UserPost';
import Image from 'next/image'
import UploadWidget from "~/components/UploadWidget";
import type { NextPageWithLayout } from "./_app";
import DefaultLayout from "~/components/Layouts";
import { useContext } from "react";
import { FeedContext } from "~/components/Layouts";


// Final output
const Feed: NextPageWithLayout = () => {
  const { ctxFeedType, ctxUserId, ctxOwner } = useContext(FeedContext);
  const canMakePost = (ctxFeedType == "space" && ctxOwner == ctxUserId) ? true : false;

  return <>
    <div className="flex flex-col items-center justify-center h-full w-full rounded-3xl rounded-b-none p-4 gap-2 bg-base-300">
      {canMakePost && <CreatePostWizard></CreatePostWizard>}
      <FeedData></FeedData>
    </div>
  </>
};
Feed.getLayout = (page: ReactElement) => {
  return (
    <DefaultLayout>
      {page}
    </DefaultLayout>
  )
}

export default Feed;

// Handler for creating a post
const CreatePostWizard = () => {
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

  if (!user) {
    return <></>;
  }

  // TODO: Improve the flow of the component when uploading with or without an image
  function handleUpload(imageUrl: string | null) {
    if (imageUrl) {
      mutate({
        content: content,
        image: imageUrl,
        spaceId: ctxFeed,
      });
    } else if (imageUrl === null) {
      mutate({
        content: content,
        image: '',
        spaceId: ctxFeed,
      });
    }
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
      <UploadWidget submitRef={submitRef} onUpload={handleUpload}></UploadWidget>
    </div >
  )
}

// Handles collection of posts
const FeedData = () => {
  const { ctxFeedType: type, ctxFeed: id } = useContext(FeedContext);

  const { data, isLoading } = (type == "feed") ?
    api.feeds.getFeedPostsById.useQuery({
      feedId: id
    }) : api.spaces.getSpacePostsById.useQuery({
      spaceId: id
    })
  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <span className="loading loading-bars loading-lg text-primary"></span>
      </div>
    );

  if (!data) return <div>Something went wrong</div>;

  else
    return (
      <div className="flex flex-col gap-4">
        {data.map((post) => {
          return <UserPost key={post.id} {...post} />
        })
        }
      </div>
    )
}