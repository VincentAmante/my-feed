import { useRouter } from "next/router";
import type { NextPageWithLayout } from "~/pages/_app";
import DefaultLayout from "~/components/Layouts";
import { api } from "~/utils/api";
import { useAuth } from "@clerk/nextjs";
import React from "react";
import Link from "next/link";
import {
  LoadingSkeleton,
  ErrorSkeleton,
} from "~/components/SkeletonViews/FeedSkeletons";
import PostImages from "~/components/PostImage";
import type { Post } from "@prisma/client";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  faTrash,
  faHeart,
  faPaperPlane,
  faEllipsisVertical,
  faEye,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Comment from "~/components/Comment";

// For relative time
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const PostPage: NextPageWithLayout = () => {
  const { userId } = useAuth();

  const router = useRouter();
  const { data: post, isLoading: postLoading } = api.posts.getPostById.useQuery(
    {
      postId: router.query.id as string,
    }
  );

  const spaceUrl = useMemo(() => {
    const { id: spaceId, name } = post?.Space || { id: "", name: "" };

    if (spaceId && name) return `/space/${spaceId}`;
    else return "";
  }, [post?.Space]);

  const isOwnedByUser = useMemo(() => {
    return userId === post?.authorId;
  }, [userId, post?.authorId]);

  const nameDisplay = useMemo(() => {
    if (isOwnedByUser) return <span className="italic">You</span>;
    else if (post?.author?.username) return `@${post?.author?.username}`;
  }, [isOwnedByUser, post?.author?.username]);

  if (postLoading) {
    return (
      <>
        <div className="flex h-full w-full flex-col items-center bg-opacity-20 p-2">
          <LoadingSkeleton />
        </div>
      </>
    );
  }
  if (!post) {
    return (
      <>
        <div className="flex h-full w-full flex-col items-center bg-opacity-20 p-2">
          <ErrorSkeleton />
        </div>
      </>
    );
  }

  const userUrl = `/user/${post.author.username || ""}`;
  return (
    <>
      <div className="flex h-full w-full flex-col items-center gap-2 bg-base-200 p-4 pt-12 lg:px-12">
        <div className="card flex w-full max-w-2xl bg-base-300">
          <div className="card-body pb-2">
            <div className="card-title">
              <UserHeader
                userUrl={userUrl}
                spaceUrl={spaceUrl}
                createdAt={post.createdAt}
                spaceName={post.Space?.name}
                profileImageUrl={post.author.profileImageUrl}
                nameDisplay={nameDisplay}
              />
            </div>
            <div className="w-full py-2 text-lg">
              <p>{post.content}</p>
            </div>
          </div>
          <PostImages className="rounded-b-2xl" imageUrls={post.images} />
        </div>
        <div className="flex w-full max-w-2xl px-8">
          <LikeButton isLiked={true} likesCount={5} />
        </div>
        <Comments postId={post.id} />
      </div>
    </>
  );
};
PostPage.getLayout = (page) => {
  return <DefaultLayout>{page}</DefaultLayout>;
};
export default PostPage;

const LikeButton = (props: { isLiked: boolean; likesCount: number }) => {
  return (
    <>
      <div className="flex items-center gap-2 text-lg">
        <FontAwesomeIcon
          icon={props.isLiked ? faHeart : faHeartOutline}
          className="text-primary"
        />
        <span className="ml-1">{props.likesCount}</span>
      </div>
    </>
  );
};

type UserHeaderProps = {
  userUrl: string;
  spaceUrl: string;
  createdAt: Date;
  spaceName: string | undefined;
  profileImageUrl: string;
  nameDisplay: string | undefined | React.JSX.Element;
};
const UserHeader = (props: UserHeaderProps) => {
  const {
    userUrl,
    spaceUrl,
    createdAt,
    spaceName,
    profileImageUrl,
    nameDisplay,
  } = props;

  return (
    <>
      <div className="flex items-center gap-2 ">
        <Link href={userUrl} className="avatar">
          <div className="w-12 rounded-full bg-neutral-focus text-neutral-content">
            <Image
              width={256}
              height={256}
              src={profileImageUrl}
              alt="Profile Picture"
            />
          </div>
        </Link>
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <Link
              className="btn-ghost btn-sm btn flex justify-start px-1 lowercase"
              href={userUrl}
            >
              <p className="flex">{nameDisplay}</p>
            </Link>
            <p className="text-xs italic opacity-50">{`· ${dayjs(
              createdAt
            ).fromNow()}`}</p>
          </div>
          <Link href={spaceUrl} className="flex gap-1">
            <span className="badge badge-primary hover:badge-secondary">
              {spaceName}
            </span>
          </Link>
        </div>
      </div>
    </>
  );
};

const Comments = (props: { postId: string }) => {
  const { postId } = props;

  const {
    isLoading,
    isError,
    data: comments,
    isFetchingNextPage: commentsLoading,
    hasNextPage: hasMoreComments,
    fetchNextPage: fetchNextComments,
  } = api.posts.getInfiniteComments.useInfiniteQuery(
    {
      postId,
    },
    {
      getNextPageParam: (lastPage: { nextCursor: unknown }) => {
        return lastPage.nextCursor;
      },
    }
  );

  if (isLoading) return <LoadingSkeleton />;
  return (
    <>
      <div className="flex w-full max-w-2xl flex-col gap-4 px-4 py-2">
        {comments &&
          comments.pages.map((page) =>
            page.comments.map((comment) => (
              <Comment
                key={comment.id}
                {...comment}
                userId={comment.authorId}
              />
            ))
          )}
        {commentsLoading && <LoadingSkeleton />}
        {!commentsLoading && hasMoreComments && (
          <button
            className="btn-ghost btn-sm btn flex justify-start text-left font-normal normal-case"
            onClick={() => void fetchNextComments()}
          >
            Load More...
          </button>
        )}
      </div>
    </>
  );
};
