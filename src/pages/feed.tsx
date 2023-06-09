import { useState, useRef, type ReactElement, useEffect, useMemo } from "react";
// import SwitchTheme from "~/components/SwitchTheme";
import { api } from "~/utils/api";
import { useAuth, useUser } from "@clerk/nextjs";
import UserPost from '~/components/UserPost';
import type { NextPageWithLayout } from "./_app";
import DefaultLayout from "~/components/Layouts";
import { useContext } from "react";
import { FeedContext } from "~/components/Layouts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWind, faPenToSquare, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import CreatePost from "~/components/Post/CreatePost";
import UpdateFeedModal from "~/components/Feed/UpdateFeedModal";
import { useInView } from 'react-intersection-observer';
import Head from "next/head";

import { LoadingSkeleton, ErrorSkeleton } from "~/components/SkeletonViews/FeedSkeletons";
import { createPortal } from "react-dom";

// Final output
const Feed: NextPageWithLayout = () => {
  const { ctxFeedType, ctxUserId, ctxOwner } = useContext(FeedContext);
  const canMakePost = (ctxFeedType == "space" && ctxOwner == ctxUserId);

  return <>
    <FeedHeader></FeedHeader>
    <div className="flex flex-col items-center justify-center h-full w-full rounded-3xl rounded-b-none p-4 gap-4 bg-base-200">
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
  const { ctxFeedType, ctxUserId, ctxOwner, ctxFeedName, ctxFeed, addToast } = useContext(FeedContext);
  const userOwnsFeed = (ctxFeedType == "feed" && ctxOwner == ctxUserId)
  const feedModalRef = useRef<HTMLDialogElement>(null);

  const isSubscribed = api.feeds.isUserSubscribedToFeed.useQuery({
    feedId: ctxFeed
  })

  const ctx = api.useContext();
  const { mutate: subscribeToFeed } = api.feeds.subscribeToFeed.useMutation({
    onSuccess: () => {
      void ctx.feeds.isUserSubscribedToFeed.refetch({
        feedId: ctxFeed
      })
      void ctx.feeds.getUserFeeds.refetch()

      addToast('Subscribed to feed', 'success')
    },
  })
  const { mutate: unsubscribeFromFeed } = api.feeds.unsubscribeFromFeed.useMutation({
    onSuccess: () => {
      void ctx.feeds.isUserSubscribedToFeed.refetch({
        feedId: ctxFeed
      })
      void ctx.feeds.getUserFeeds.refetch()
      addToast('Unsubscribed from feed', 'info')
    },
  })

  return (
    <>
      <Head>
        <title>{ctxFeedName} | Kiurate</title>
      </Head>
      {userOwnsFeed && createPortal(<UpdateFeedModal feedId={ctxFeed} ref={feedModalRef} />, document.body)}
      <div className="flex text-xl w-full items-center justify-center py-6 pb-4 bg-base-100 gap-4">
        <span className="text-2xl font-bold">
          {ctxFeedName}
        </span>
        {userOwnsFeed && (
          <button className="btn btn-ghost btn-sm text-2xl ml-2 btn-circle" onClick={() => feedModalRef.current?.show()}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
        )
        }
        {
          (ctxFeedName !== 'Global') && !userOwnsFeed && isSubscribed.data && (
            <button className="btn btn-error btn-sm ml-2" onClick={() => unsubscribeFromFeed({ feedId: ctxFeed })}>
              <span>Unsubscribe</span>
              <FontAwesomeIcon icon={faMinus} />
            </button>
          )
        }
        {
          (ctxFeedName !== 'Global') && !userOwnsFeed && !isSubscribed.data && (
            <button className="btn btn-success btn-sm ml-2" onClick={() => subscribeToFeed({ feedId: ctxFeed })}>
              <span>Subscribe</span>
              <FontAwesomeIcon icon={faPlus} />
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
  const { ref, inView, entry } = useInView({
    threshold: 0,
  });
  const { userId } = useAuth();


  const { isLoading, isError, data, error, isFetchingNextPage, fetchNextPage, hasNextPage } = api.feeds.getInfiniteFeedPostsById.useInfiniteQuery({
    feedId: id,
    limit: 10,
  },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage()
    }
  }, [inView])

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorSkeleton />;
  if (data.pages[0]?.posts.length == 0) {
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
      <>
        <div className="flex flex-col gap-4 w-full h-full items-center">
          {
            data && data.pages.map((page) => {
              return page.posts.map((post) => {
                return <UserPost key={post.id} {...post} />
              })
            }
            )
          }
        </div>
        {
          isFetchingNextPage && <LoadingSkeleton />
        }
        {
          !isFetchingNextPage && (
            <div ref={ref} className="invisible">
              <h2>{`Header inside viewport ${inView.toString()}.`}</h2>
            </div>
          )
        }
        {
          !hasNextPage && <div className="flex flex-col items-center justify-center w-full h-full select-none">
            <FontAwesomeIcon icon={faWind} className="text-6xl opacity-30" />
            <span className="text-2xl font-bold opacity-30">
              No more posts
            </span>
          </div>
        }
      </>
    )
}

