import { useState, useMemo, useRef } from "react";
import Sidebar from "~/components/Sidebar";
// import SwitchTheme from "~/components/SwitchTheme";
import { api } from "~/utils/api";
import { useAuth, useUser } from "@clerk/nextjs";
import UserPost from '~/components/UserPost';
import type { Post } from '@prisma/client'
import Image from 'next/image'
import UploadWidget from "~/components/UploadWidget";


import { useContext, createContext } from "react";
export const FeedContext = createContext({
  currentFeed: "global",
  currentFeedType: 'feed',
  ownerId: '',
  feedName: 'Global',
  userId: '',
});

type CreatePostWizardProps = {
  spaceId: string;
}

// Handler for creating a post
const CreatePostWizard = (props: CreatePostWizardProps) => {
  const { user } = useUser();
  const [content, setContent] = useState("");

  const submitRef = useRef<HTMLButtonElement>(null);

  const ctx = api.useContext();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
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
        spaceId: props.spaceId,
      });
    } else if (imageUrl === null) {
      mutate({
        content: content,
        image: '',
        spaceId: props.spaceId,
      });
    }
  }

  function triggerUpload() {
    submitRef.current?.click();
  }

  return (
    <div className="flex gap-2 flex-col w-full">

      <div className="flex items-center gap-2">
        <Image
          width={128}
          height={128}
          src={user.profileImageUrl}
          alt="Profile Image" className="h-14 w-14 rounded-full" />
        <input
          className="input input-ghost w-full"
          placeholder="Hello"
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

const Feed = () => {
  const [currentFeed, setCurrentFeed] = useState("global");
  const [currentFeedType, setCurrentFeedType] = useState("feed");
  const [ownerId, setOwnerId] = useState("");
  const [feedName, setFeedName] = useState("Global");
  const { userId } = useAuth();
  if (!userId) return (
    <>
      <main className="w-full h-screen flex flex-col items-center justify-center">
        <p className="text-4xl">Loading..</p>
      </main>
    </>
  );

  function setFeed(feedId: string, feedType: string, feedName: string, ownerId: string) {
    setCurrentFeed(feedId);
    setCurrentFeedType(feedType);
    setOwnerId(ownerId);
    setFeedName(feedName);
  }

  return (
    <>
      <div className="flex h-full w-full flex-row-reverse items-stretch">
        <FeedContext.Provider value={{ currentFeed, currentFeedType, ownerId, feedName, userId }}>
          <FeedPage></FeedPage>
          <Sidebar handleSelectFeed={setFeed}></Sidebar>
        </FeedContext.Provider>
      </div>
    </>
  );
};
const FeedPage = () => {
  const { currentFeed, currentFeedType, ownerId, feedName } = useContext(FeedContext);
  const { userId } = useAuth();

  const canMakePost = (currentFeedType == "space" && ownerId == userId) ? true : false;

  return <>
    <main className="relative flex min-h-screen w-full flex-col items-center">
      <div className="flex w-full items-center justify-center bg-slate-900 bg-opacity-80 py-6 pb-4">
        {feedName}
      </div>

      <div className=" h-full w-full bg-slate-900 bg-opacity-80 p-2 px-4 pb-4">
        <div className="grid h-full w-full rounded-3xl bg-slate-900 p-4 flex-col gap-4">
          {canMakePost && <CreatePostWizard spaceId={currentFeed}></CreatePostWizard>}
          <FeedData id={currentFeed} type={currentFeedType}></FeedData>
        </div>
      </div>
    </main>
  </>
}


type FeedDataProps = {
  id: string;
  type: string;
}


const FeedData = (props: FeedDataProps) => {
  const { id, type } = props;
  const { data, isLoading } = (type == "feed") ?
    api.feeds.getFeedPostsById.useQuery({
      feedId: id
    }) : api.spaces.getSpacePostsById.useQuery({
      spaceId: id
    })
  if (isLoading)
    return (
      <div className="flex grow">
        <div>..Loading</div>
      </div>
    );

  console.log("FeedData", data)
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

export default Feed;