import type { Post } from "@prisma/client";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/clerk-react";
import {
  faTrash,
  faHeart,
  faPaperPlane,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "~/utils/api";
import React from "react";
import PostImages from "./PostImage";
import DeletePostModal from "./DeletePostModal";
import { animate, useAnimate } from "framer-motion";

// Comments
import Comment from "./Comment";
import type { CommentWithUser } from "./Comment";

// For relative time
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type Author = {
  id: string;
  username: string | null;
  profileImageUrl: string;
  firstName: string | null;
  lastName: string | null;
};
type PostWithUser = Post & {
  author: Author | undefined;
  Space:
    | {
        name: string;
      }
    | undefined
    | null;
  comments: CommentWithUser[];
};

const UserPost = (props: PostWithUser) => {
  const {
    id,
    content,
    createdAt,
    authorId,
    spaceId,
    likedByIDs,
    author,
    Space,
    comments,
    images,
  } = props;

  const { userId } = useAuth();

  const spaceUrl = useMemo(() => {
    if (spaceId && Space?.name) return `/space/${spaceId}`;
    else return "";
  }, [spaceId, Space?.name]);

  const isOwnedByUser = useMemo(() => {
    return userId === authorId;
  }, [userId, authorId]);

  const nameDisplay = useMemo(() => {
    if (isOwnedByUser) return <span className="italic">You</span>;
    else if (author?.username) return `@${author.username}`;
  }, [isOwnedByUser, author?.username]);

  const delModal: React.RefObject<HTMLDialogElement> = useRef(null);

  const ctx = api.useContext();
  const { mutate: likeUnlikePost } = api.posts.likeUnlikePost.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacePostsById.invalidate();
      void ctx.feeds.getInfiniteFeedPostsById.invalidate();
    },
  });

  const [likeCount, setLikeCount] = React.useState(likedByIDs.length);
  const [isLiked, setIsLiked] = React.useState(
    likedByIDs.includes(userId || "")
  );
  const [likeScope] = useAnimate();

  useMemo(() => {
    setIsLiked(likedByIDs.includes(userId || ""));
    setLikeCount(likedByIDs.length);
  }, [likedByIDs, userId]);

  const handleLike = () => {
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
      setLikeCount(likeCount - 1);
      setIsLiked(false);
      void likeUnlikePost({ postId: id });
    } else {
      setLikeCount(likeCount + 1);
      setIsLiked(true);
      void likeUnlikePost({ postId: id });
    }
  };

  // This is a hacky way to check if the likes are unique
  const isLikesUnique = useMemo(() => {
    const uniqueLikes = new Set(likedByIDs).size;
    const answer = likedByIDs.length === uniqueLikes;
    if (!answer) setLikeCount(uniqueLikes);

    return answer;
  }, [likedByIDs]);

  const userUrl = useMemo(() => {
    if (author?.username) return `/user/@${author.username}`;
    else return "";
  }, [author?.username]);

  if (!props.author) return <></>;

  return (
    <>
      {isOwnedByUser && <DeletePostModal ref={delModal} id={id} />}
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body gap-4 px-0   py-4">
          <div className="flex w-full justify-between px-4">
            <UserHeader
              userUrl={userUrl}
              nameDisplay={nameDisplay}
              spaceUrl={spaceUrl}
              spaceName={Space?.name}
              createdAt={createdAt}
              profileImageUrl={author?.profileImageUrl || ""}
            />

            {isOwnedByUser && (
              <div className="dropdown-left dropdown-end dropdown">
                <label
                  tabIndex={0}
                  className="btn-ghost btn-sm btn-circle btn m-1"
                >
                  <FontAwesomeIcon icon={faEllipsisVertical}></FontAwesomeIcon>
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
          <div className="px-4">{content}</div>
          <PostImages imageUrls={images} />

          <div className="flex flex-col gap-2 px-4 pr-8">
            <div className=" flex select-none items-center gap-2">
              <FontAwesomeIcon
                ref={likeScope}
                className="cursor-pointer text-lg text-secondary"
                icon={isLiked ? faHeart : faHeartOutline}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLike();
                }}
              />
              <p className="text-lg font-bold text-secondary opacity-50">
                {likeCount}
              </p>
              {!isLikesUnique && <UniqueLikeEnforcer postId={id} />}
            </div>
            {comments && comments.length > 0 && (
              <>
                <div className="divider my-0 py-0"></div>
                <div className="flex flex-col gap-2">
                  {comments.map((comment) => (
                    <Comment
                      key={comment.id}
                      {...comment}
                      userId={userId || ""}
                    />
                  ))}
                </div>
              </>
            )}
            <CommentInput postId={id} />
          </div>
        </div>
      </div>
    </>
  );
};

type CommentInputProps = {
  postId: string;
};
const CommentInput = (props: CommentInputProps) => {
  const { postId } = props;
  const [content, setContent] = useState("");
  const handleSubmit = () => {
    if (!content) return;
    const commentContent = content.trim();
    setContent("");
    void mutate({ postId, content: commentContent });
  };

  const ctx = api.useContext();
  const { mutate } = api.posts.createComment.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacePostsById.invalidate();
      void ctx.feeds.getInfiniteFeedPostsById.invalidate();
    },
  });

  return (
    <div className="join w-full">
      <input
        className="input-bordered input input-sm join-item w-full"
        type="text"
        placeholder="Write comment!"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />
      <button
        className="btn-sm join-item btn"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
      >
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </div>
  );
};

type UniqueLikeEnforcerProps = {
  postId: string;
};

// if likes are not unique, this sets a call to the server to enforce unique likes
// This fix is gimmicky and should be fixed on the server side
const UniqueLikeEnforcer = (props: UniqueLikeEnforcerProps) => {
  console.log("enforcing unique likes");
  const ctx = api.useContext();
  const { mutate } = api.posts.enforceUniqueLikes.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacePostsById.invalidate();
      void ctx.feeds.getInfiniteFeedPostsById.invalidate();
    },
  });
  useMemo(() => {
    void mutate({ postId: props.postId });
  }, [props.postId, mutate]);
  return <></>;
};
export default UserPost;

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
              width={64}
              height={64}
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
