import { useRouter } from "next/router";
import type { NextPageWithLayout } from "~/pages/_app";
import DefaultLayout from "~/components/Layouts";
import { api } from "~/utils/api";
import { useAuth } from "@clerk/nextjs";
import React, { ChangeEvent, useEffect } from "react";
import Link from "next/link";
import {
  LoadingSkeleton,
  ErrorSkeleton,
} from "~/components/SkeletonViews/FeedSkeletons";
import PostImages from "~/components/PostImage";
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
import { animate, useAnimate } from "framer-motion";
import { UniqueLikeEnforcer } from "~/components/UserPost";
import DeletePostModal from "~/components/DeletePostModal";
import Head from "next/head";

// For relative time
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const PostPage: NextPageWithLayout = () => {
  const { userId } = useAuth();

  const router = useRouter();
  const postId = router.query.id as string;
  const { data: post, isLoading: postLoading } = api.posts.getPostById.useQuery(
    {
      postId: postId,
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

  const isLikedByUser = useMemo(() => {
    return post?.likedByIDs.includes(userId || "");
  }, [post?.likedByIDs, userId]);

  const delModal: React.RefObject<HTMLDialogElement> = useRef(null);

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
      <Head>
        <title>Post by {post.author.username} | Kiurate</title>
        <meta
          property="og:title"
          content={`Post by ${post.author.username || "a kiurator"} | Kiurate`}
          key="title"
        />
        <meta property="og:title" content="Social Title for Cool Page" />
        <meta property="og:description" content={post.content || ""} />
        <meta property="og:image" content={post.images[0] || ""} />
      </Head>
      {isOwnedByUser && <DeletePostModal ref={delModal} id={postId} />}
      <div className="flex h-full w-full flex-col items-center gap-2 bg-base-200 p-4 pt-12 lg:px-12">
        <div className="card flex w-full max-w-2xl bg-base-300">
          <div className="card-body pb-2">
            <div className="card-title flex w-full justify-between">
              <UserHeader
                userUrl={userUrl}
                spaceUrl={spaceUrl}
                createdAt={post.createdAt}
                spaceName={post.Space?.name}
                profileImageUrl={post.author.profileImageUrl}
                nameDisplay={nameDisplay}
              />

              {isOwnedByUser && (
                <div className="dropdown-end dropdown-left dropdown">
                  <label
                    tabIndex={0}
                    className="btn-ghost btn-sm btn-circle btn m-1"
                  >
                    <FontAwesomeIcon
                      icon={faEllipsisVertical}
                    ></FontAwesomeIcon>
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu rounded-box w-fit bg-neutral p-2 shadow"
                  >
                    <li className="flex items-center justify-center">
                      <button
                        className="btn-ghost btn-sm btn w-full text-error"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          delModal.current?.show();
                        }}
                      >
                        <span>Delete Post</span>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div className="w-full py-2 text-lg">
              <p>{post.content}</p>
            </div>
          </div>
          <PostImages imageUrls={post.images} />
          <div className="mt-2 flex w-full max-w-2xl select-none px-8 pb-4">
            <LikeButton
              postId={post.id}
              isLiked={isLikedByUser || false}
              likesCount={post.likedByIDs.length}
            />
          </div>
        </div>
        <div className="w-full max-w-2xl">
          <CommentInput postId={post.id} />
          <Comments postId={post.id} />
        </div>
      </div>
    </>
  );
};

const CommentInput = (props: { postId: string }) => {
  const { userId } = useAuth();
  const { postId } = props;

  const { data: currentUser, isLoading: currentUserLoading } =
    api.users.getCurrentUser.useQuery({});
  const [comment, setComment] = useState("");

  const ctx = api.useContext();
  const { mutate: createComment } = api.posts.createComment.useMutation({
    onSuccess: () => {
      setComment("");
      void ctx.posts.getInfiniteComments.invalidate({ postId: postId });
    },
  });

  const MAX_CONSECUTIVE_NEW_LINES = 2; // Maximum number of consecutive new lines between lines

  // Handle text input change
  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const text: string = event.target.value;
    const cleanedText: string = cleanText(text);
    setComment(cleanedText);
  };

  // Clean text by limiting consecutive new lines between lines
  const cleanText = (text: string): string => {
    const cleanedText: string = text.replace(
      /\n{3,}/g,
      "\n".repeat(MAX_CONSECUTIVE_NEW_LINES)
    );

    return cleanedText;
  };

  const handleCreateComment = () => {
    if (comment.length > 0) {
      void createComment({
        postId: postId,
        content: comment,
      });
    }
  };

  return (
    <div className="flex w-full gap-2 p-3">
      {currentUser?.profileImageUrl && (
        <Link
          className="avatar rounded-full"
          href={
            (currentUser?.username && `/user/${currentUser?.username}`) || ""
          }
        >
          <div className="h-8 w-8  lg:h-12 lg:w-12">
            <Image
              className="rounded-full"
              src={currentUser.profileImageUrl}
              alt="Avatar"
              width={100}
              height={100}
            />
          </div>
        </Link>
      )}
      <div className="join w-full">
        <textarea
          className="input-bordered input join-item w-full resize-none py-2 lg:min-h-[4rem]"
          placeholder="Comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={280}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey === false) {
              handleCreateComment();
            }
          }}
        />
        <button
          className="join-item btn h-full"
          onClick={handleCreateComment}
          disabled={comment.length === 0}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
          <span className="hidden lg:block">Post</span>
        </button>
      </div>
    </div>
  );
};

PostPage.getLayout = (page) => {
  return <DefaultLayout>{page}</DefaultLayout>;
};
export default PostPage;

const LikeButton = (props: {
  isLiked: boolean;
  likesCount: number;
  postId: string;
}) => {
  const { userId } = useAuth();
  const { postId } = props;

  const [isLiked, setIsLiked] = useState(props.isLiked);
  const [likesCount, setLikesCount] = useState(props.likesCount);

  const [likeScope] = useAnimate();
  const [likeCountScope] = useAnimate();

  const {
    data: likeData,
    isError: likeError,
    isLoading: likeLoading,
  } = api.posts.getPostLikeData.useQuery({
    postId: props.postId,
  });

  useEffect(() => {
    if (likeData) {
      setIsLiked(likeData.includes(userId || ""));
      setLikesCount(likeData.length);
    }
  }, [likeData, userId]);

  const ctx = api.useContext();
  const { mutate: likeUnlikePost } = api.posts.likeUnlikePost.useMutation({
    onSuccess: () => {
      void ctx.posts.getPostLikeData.refetch({ postId: props.postId });
    },
  });

  const handleLikeUnlike = () => {
    void likeUnlikePost({
      postId: props.postId,
    });

    void animate(
      likeScope.current,
      {
        scale: [1, 1.15, 1],
      },
      {
        duration: 0.3,
      }
    );

    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => prev - 1);
    }
    if (!isLiked) {
      setIsLiked(true);
      console.log("liking");
      setLikesCount((prev) => prev + 1);
    }
  };

  const areLikesUnique = useMemo(() => {
    const uniqueLikes = new Set(likeData).size;
    const answer = likeData?.length === uniqueLikes;
    if (!answer) setLikesCount(uniqueLikes);

    return answer;
  }, [likeData]);

  return (
    <>
      <div className="group flex cursor-pointer items-center gap-2 text-lg">
        <FontAwesomeIcon
          ref={likeScope}
          onClick={handleLikeUnlike}
          icon={isLiked ? faHeart : faHeartOutline}
          className="text-primary transition-all group-hover:scale-110 group-hover:transform"
        />
        <span className="ml-1">{likesCount}</span>
      </div>
      {areLikesUnique && <UniqueLikeEnforcer postId={postId || ""} />}
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
  const { userId } = useAuth();

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
      <div className="py-3xl flex w-full max-w-2xl flex-col gap-8 rounded-lg bg-base-300 p-4 py-8">
        {comments &&
          comments.pages.map((page) =>
            page.comments.map((comment) => (
              <>
                <Comment key={comment.id} {...comment} userId={userId || ""} />
              </>
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
