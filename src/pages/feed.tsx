import { useEffect, useState, useMemo } from "react";
import Sidebar from "~/components/Sidebar";
// import SwitchTheme from "~/components/SwitchTheme";
import { api } from "~/utils/api";
import { useAuth, useUser } from "@clerk/nextjs";
import UserPost from '~/components/UserPost';
import type {Post} from '@prisma/client'
import { User } from "@clerk/nextjs/dist/server";

const Feed = () => {
  const [currentFeed, setCurrentFeed] = useState("global");
  const [currentFeedType, setCurrentFeedType] = useState("feed");

  function setFeed (feedId: string, feedType: string) {
    setCurrentFeed(feedId);
    setCurrentFeedType(feedType);
  }
  
  return (
    <>
      <div className="flex h-full w-full flex-row-reverse items-stretch">
        <main className="relative flex min-h-screen w-full flex-col items-center">
          <div className="flex w-full items-center justify-center bg-slate-900 bg-opacity-80 py-6 pb-4">
            Feed Name
          </div>
          <div className=" h-full w-full bg-slate-900 bg-opacity-80 p-2 px-4 pb-4">
            <div className="flex h-full w-full rounded-3xl bg-slate-900 p-4">
              <FeedData id={currentFeed} type={currentFeedType}></FeedData>
            </div>
          </div>
        </main>
        <Sidebar handleSelectFeed={setFeed}></Sidebar>
      </div>
    </>
  );
};

type FeedPageProps = {
  feedId: string;
  feedType: string;
}
const FeedPage = (props: FeedPageProps) => {
  const { feedId, feedType } = props;
  
  useMemo(() => { 
    return <main>
      <div className="flex w-full items-center justify-center bg-slate-900 bg-opacity-80 py-6 pb-4">
        Feed Name
      </div>
      <div className=" h-full w-full bg-slate-900 bg-opacity-80 p-2 px-4 pb-4">
        <div className="flex h-full w-full rounded-3xl bg-slate-900 p-4">
          <FeedData id={feedId} type={feedType}></FeedData>
        </div>
      </div>
    </main>
  }, [feedId, feedType])
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

export default Feed;