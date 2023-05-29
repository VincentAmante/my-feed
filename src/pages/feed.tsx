import { useState, useMemo } from "react";
import Sidebar from "~/components/Sidebar";
// import SwitchTheme from "~/components/SwitchTheme";
import { api } from "~/utils/api";
import { useAuth, useUser } from "@clerk/nextjs";
import UserPost from '~/components/UserPost';
import type {Post} from '@prisma/client'
import { User } from "@clerk/nextjs/dist/server";
import Image from 'next/image'

const CreatePostWizard = () => {
  const { user } = useUser();

  if (!user) {
    return <></>;
  }
  
  return (
    <div className="flex items-center gap-2">
      <img src={user.profileImageUrl} alt="Profile Image" className="h-14 w-14 rounded-full" />
      <input className="input input-ghost w-full" placeholder="Hello"></input>
    </div>
  )
}

const Feed = () => {
  const [currentFeed, setCurrentFeed] = useState("global");
  const [currentFeedType, setCurrentFeedType] = useState("feed");
  const [ownerId, setOwnerId] = useState("");
  const [feedName, setFeedName] = useState("Global");

  function setFeed(feedId: string, feedType: string, feedName: string, ownerId: string) {
    console.log("setFeed", feedId, feedType, ownerId, feedName);
    setCurrentFeed(feedId);
    setCurrentFeedType(feedType);
    setOwnerId(ownerId);
    setFeedName(feedName);
  }
  
  return (
    <>
      <div className="flex h-full w-full flex-row-reverse items-stretch">
        <FeedPage feedId={currentFeed} feedType={currentFeedType} feedName={feedName} ownerId={ownerId}></FeedPage>
        <Sidebar handleSelectFeed={setFeed}></Sidebar>
      </div>
    </>
  );
};

type FeedPageProps = {
  feedId: string;
  feedType: string;
  feedName: string;
  ownerId: string;
}
const FeedPage = (props: FeedPageProps) => {
  const { feedId, feedType, feedName, ownerId } = props;
  const { userId } = useAuth();

  const canMakePost = (feedType == "space" && ownerId == userId) ? true : false;

  return <>
    <main className="relative flex min-h-screen w-full flex-col items-center">
      <div className="flex w-full items-center justify-center bg-slate-900 bg-opacity-80 py-6 pb-4">
        {feedName}
      </div>
      <div className=" h-full w-full bg-slate-900 bg-opacity-80 p-2 px-4 pb-4">
        <div className="flex h-full w-full rounded-3xl bg-slate-900 p-4 flex-col">
          {canMakePost && <CreatePostWizard></CreatePostWizard>}
          <FeedData id={feedId} type={feedType}></FeedData>
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
  if (!data) return <div>Something went wrong</div>;
  else 

 return ( 
  <div>
    {data.map((post: Post) => {
      return <UserPost key={post.id} {...post} />
    })
  }
   </div>
 )
}

type PostWizardProps = {
  spaceId: string;
  content: string;
}

export default Feed;