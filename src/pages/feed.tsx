import { useState, useRef, type ReactElement, useEffect } from "react";
// import SwitchTheme from "~/components/SwitchTheme";
import { api } from "~/utils/api";
import { useAuth, useUser } from "@clerk/nextjs";
import UserPost from '~/components/UserPost';
import Image from 'next/image'
import UploadWidget from "~/components/UploadWidget";
import type { NextPageWithLayout } from "./_app";
import DefaultLayout from "~/components/Layouts";
import { useContext } from "react";
import { FeedContext } from "~/components/Layouts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWind, faRectangleList } from "@fortawesome/free-solid-svg-icons";
import CreatePost from "~/components/CreatePost";
import UpdateFeedModal from "~/components/Feed/UpdateFeedModal";

import { LoadingSkeleton, ErrorSkeleton } from "~/components/SkeletonViews/FeedSkeletons";
import { createPortal } from "react-dom";

// Final output
const Feed: NextPageWithLayout = () => {
  const { ctxFeedType, ctxUserId, ctxOwner, ctxFeedName, ctxFeed } = useContext(FeedContext);
  const canMakePost = (ctxFeedType == "space" && ctxOwner == ctxUserId);

  return <>
    <FeedHeader></FeedHeader>
    <div className="flex flex-col items-center justify-center h-full w-full rounded-3xl rounded-b-none p-4 gap-2 bg-base-300">
      {canMakePost && <CreatePost></CreatePost>}
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

const FeedHeader = () => {
  const { ctxFeedType, ctxUserId, ctxOwner, ctxFeedName, ctxFeed } = useContext(FeedContext);
  const userOwnsFeed = (ctxFeedType == "feed" && ctxOwner == ctxUserId)
  const feedModalRef = useRef<HTMLDialogElement>(null); 

  return (
    <>
    {userOwnsFeed && createPortal(<UpdateFeedModal feedId={ctxFeed} ref={feedModalRef} />, document.body)}
    <div className="flex text-xl w-full items-center justify-center py-6 pb-4 bg-base-100">
      <span>
          {ctxFeedName}
        </span>
        {userOwnsFeed && (
          <button className="btn btn-ghost btn-sm ml-2 btn-circle" onClick={() => feedModalRef.current?.show()}>
            <FontAwesomeIcon icon={faRectangleList} />
          </button>
        )
        }
      </div>
    </>
  )
}

// Handles collection of posts
const FeedData = () => {
  const { ctxFeedType: type, ctxFeed: id, ctxOwner } = useContext(FeedContext);
  const { userId } = useAuth();

  const { data, isLoading } = (type == "feed") ?
    api.feeds.getFeedPostsById.useQuery({
      feedId: id
    }) : api.spaces.getSpacePostsById.useQuery({
      spaceId: id
    })
  if (isLoading) return <LoadingSkeleton />;
  if (!data) return <ErrorSkeleton />;

  if (data?.length === 0) {
    console.log('empty')
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <FontAwesomeIcon icon={faWind} className="text-6xl opacity-30" />
        <span className="text-2xl font-bold opacity-30">
          This <span>{type === 'space' ? 'Space' : 'Feed'}</span> is empty
        </span>
        {userId === ctxOwner && type === 'space' && <span className="text-md opacity-30">Fill it up with some posts!</span>}
        {userId === ctxOwner && type === 'feed' && <span className="text-md opacity-30">Add some spaces to it!</span>}
      </div>
    )
  }
  else
    return (
      <div className="flex flex-col gap-4 w-full h-full items-center">
        {data.map((post) => {
          return <UserPost key={post.id} {...post} />
        })
        }
      </div>
    )
}

