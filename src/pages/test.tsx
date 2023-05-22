import { useState } from "react";
import Sidebar from "~/components/Sidebar";
import SwitchTheme from "~/components/SwitchTheme";
import { api } from "~/utils/api";

const Test = () => {
  const [currentFeed, setCurrentFeed] = useState("global");
  return (
    <>
      <div className="flex h-full w-full flex-row-reverse items-stretch">
        <main className="relative flex min-h-screen w-full flex-col items-center">
          <div className="flex w-full items-center justify-center bg-slate-900 bg-opacity-80 py-6 pb-4">
            Feed Name
          </div>
          <div className=" h-full w-full bg-slate-900 bg-opacity-80 p-2 px-4 pb-4">
            <div className="flex h-full w-full rounded-3xl bg-slate-900 p-4">
              <Feed feedId={currentFeed}></Feed>
            </div>
          </div>
        </main>
        <Sidebar handleSelectFeed={setCurrentFeed}></Sidebar>
      </div>
    </>
  );
};

type FeedProps = {
  feedId: string;
};

const Feed = (props: FeedProps) => {
  const { feedId } = props;

  const { data, isLoading: postsLoading } =
    feedId === "global"
      ? api.feeds.getGlobalPosts.useQuery()
      : api.feeds.getFeedPostsById.useQuery({
          feedId: feedId,
        });

  if (postsLoading) return <div>Loading..</div>;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div>
      {[...data].map((post) => (
        <div className="card  bg-slate-800" key={post.id}>
          <div className="card-body">
            <div>{post.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default Test;
