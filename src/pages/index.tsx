import { useState, useRef, type ReactElement, useEffect, useMemo } from "react";
// import SwitchTheme from "~/components/SwitchTheme";
import { api } from "~/utils/api";
import { useAuth, useUser } from "@clerk/nextjs";
import UserPost from "~/components/UserPost";
import type { NextPageWithLayout } from "./_app";
import DefaultLayout from "~/components/Layouts";
import { useContext } from "react";
import { FeedContext } from "~/components/Layouts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWind,
  faPenToSquare,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import CreatePost from "~/components/Post/CreatePost";
import UpdateFeedModal from "~/components/Feed/UpdateFeedModal";
import { useInView } from "react-intersection-observer";
import Head from "next/head";

import {
  LoadingSkeleton,
  ErrorSkeleton,
} from "~/components/SkeletonViews/FeedSkeletons";
import { createPortal } from "react-dom";

// Final output
const Feed: NextPageWithLayout = () => {
  const { ctxFeedType, ctxUserId, ctxOwner } = useContext(FeedContext);
  const canMakePost = ctxFeedType == "space" && ctxOwner == ctxUserId;

  return (
    <>
      <FeedHeader></FeedHeader>
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-3xl rounded-b-none bg-base-200 p-4">
        {canMakePost && <CreatePost></CreatePost>}
        <FeedData></FeedData>
      </div>
    </>
  );
};
Feed.getLayout = (page: ReactElement) => {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default Feed;
const FeedHeader = () => {
  const { ctxFeedType, ctxUserId, ctxOwner, ctxFeedName, ctxFeed, addToast } =
    useContext(FeedContext);
  const userOwnsFeed = ctxFeedType == "feed" && ctxOwner == ctxUserId;
  const feedModalRef = useRef<HTMLDialogElement>(null);

  const isSubscribed = api.feeds.isUserSubscribedToFeed.useQuery({
    feedId: ctxFeed,
  });

  const ctx = api.useContext();
  const { user: clerkUser } = useUser();
  const { userId } = useAuth();
  const { mutate } = api.users.initUser.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacesByUserId.refetch();
    },
  });

  useMemo(() => {
    mutate({
      clerkId: userId || "",
      firstName: clerkUser?.firstName || "",
      lastName: clerkUser?.lastName || "",
      username: clerkUser?.username || "",
    });
  }, [clerkUser, userId, mutate]);

  const { mutate: subscribeToFeed } = api.feeds.subscribeToFeed.useMutation({
    onSuccess: () => {
      void ctx.feeds.isUserSubscribedToFeed.refetch({
        feedId: ctxFeed,
      });
      void ctx.feeds.getUserFeeds.refetch();

      addToast("Subscribed to feed", "success");
    },
  });
  const { mutate: unsubscribeFromFeed } =
    api.feeds.unsubscribeFromFeed.useMutation({
      onSuccess: () => {
        void ctx.feeds.isUserSubscribedToFeed.refetch({
          feedId: ctxFeed,
        });
        void ctx.feeds.getUserFeeds.refetch();
        addToast("Unsubscribed from feed", "info");
      },
    });

  return (
    <>
      <Head>
        <title>{ctxFeedName} | Kiurate</title>
        <meta
          name="description"
          content="Your space, your content, your experience."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {userOwnsFeed &&
        createPortal(
          <UpdateFeedModal feedId={ctxFeed} ref={feedModalRef} />,
          document.body
        )}
      <div className="flex w-full items-center justify-center gap-4 bg-base-100 py-6 pb-4 text-xl">
        <span className="text-2xl font-bold">{ctxFeedName}</span>
        {userOwnsFeed && (
          <button
            className="btn-ghost btn-sm btn-circle btn ml-2 text-2xl"
            onClick={() => feedModalRef.current?.show()}
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
        )}
        {ctxFeedName !== "Global" && !userOwnsFeed && isSubscribed.data && (
          <button
            className="btn-error btn-sm btn ml-2"
            onClick={() => unsubscribeFromFeed({ feedId: ctxFeed })}
          >
            <span>Unsubscribe</span>
            <FontAwesomeIcon icon={faMinus} />
          </button>
        )}
        {ctxFeedName !== "Global" && !userOwnsFeed && !isSubscribed.data && (
          <button
            className="btn-success btn-sm btn ml-2"
            onClick={() => subscribeToFeed({ feedId: ctxFeed })}
          >
            <span>Subscribe</span>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>
    </>
  );
};

// Handles collection of posts
const FeedData = () => {
  const { ctxFeedType: type, ctxFeed: id, ctxOwner } = useContext(FeedContext);
  const {
    isLoading,
    isError,
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = api.feeds.getInfiniteFeedPostsById.useInfiniteQuery(
    {
      feedId: id,
      limit: 10,
    },
    {
      // function for fetching next page
      getNextPageParam: (lastPage: { nextCursor: unknown }) =>
        lastPage.nextCursor,
    }
  );

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView]);

  const { userId } = useAuth();

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorSkeleton />;
  if (data.pages[0]?.posts.length == 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <FontAwesomeIcon icon={faWind} className="text-6xl opacity-30" />
        <span className="text-2xl font-bold opacity-30">
          This <span>{type === "space" ? "Space" : "Feed"}</span> is empty
        </span>
        {userId === ctxOwner && type === "space" && (
          <span className="text-md opacity-30">
            Fill it up with some posts!
          </span>
        )}
        {userId === ctxOwner && type === "feed" && (
          <span className="text-md opacity-30">Add some spaces to it!</span>
        )}
      </div>
    );
  } else
    return (
      <>
        <div className="flex h-full w-full flex-col items-center gap-4">
          {data &&
            data.pages.map((page) => {
              return page.posts.map((post) => {
                return <UserPost key={post.id} {...post} />;
              });
            })}
        </div>
        {isFetchingNextPage && <LoadingSkeleton />}
        {!isFetchingNextPage && (
          <div ref={ref} className="invisible">
            <h2>{`Header inside viewport ${inView.toString()}.`}</h2>
          </div>
        )}
        {!hasNextPage && (
          <div className="flex h-full w-full select-none flex-col items-center justify-center">
            <FontAwesomeIcon icon={faWind} className="text-6xl opacity-30" />
            <span className="text-2xl font-bold opacity-30">No more posts</span>
          </div>
        )}
      </>
    );
};
