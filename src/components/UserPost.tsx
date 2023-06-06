import type { Post } from "@prisma/client";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/clerk-react";
import { faTrash, faHeart, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "~/utils/api";
import React from "react";
import PostImage from "./PostImage";
import DeleteModal from "./DeleteModal";
import { animate, useAnimate } from "framer-motion"


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
}
type PostWithUser = Post & {
  author: Author | undefined;
  Space: {
    name: string;
  } | undefined | null;
  comments: CommentWithUser[]
}

const UserPost = (props: PostWithUser) => {
  const {
    id,
    content,
    image,
    createdAt,
    authorId,
    spaceId,
    likedByIDs,
    author,
    Space,
    comments
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
  }, [isOwnedByUser, author?.username])

  const delModal: React.RefObject<HTMLDialogElement> = useRef(null);

  const ctx = api.useContext();
  const { mutate: likeUnlikePost } = api.posts.likeUnlikePost.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacePostsById.invalidate();
      void ctx.feeds.getFeedPostsById.invalidate();
    }
  });

  const [likeCount, setLikeCount] = React.useState(likedByIDs.length);
  const [isLiked, setIsLiked] = React.useState(likedByIDs.includes(userId || ""));
  const [likeScope] = useAnimate();

  useMemo(() => {
    setIsLiked(likedByIDs.includes(userId || ""));
    setLikeCount(likedByIDs.length);
  }, [likedByIDs, userId]);

  const handleLike = () => {
    void animate(likeScope.current, {
      scale: [1, 1.15, 1],
    }, {
      duration: 0.3,
    })

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

  if (!props.author) return <></>;

  return (
    <>
      {isOwnedByUser
        &&
        <DeleteModal ref={delModal} id={id} />
      }
      <div className="card w-full shadow-xl max-w-md bg-base-100">
        <div className="card-body py-4 gap-4   px-0">
          <div className="flex justify-between w-full px-4">
            <div className="flex items-center gap-2 ">
              <div className="avatar">
                <div className="w-12 rounded-full bg-neutral-focus text-neutral-content">
                  <Image
                    width={64}
                    height={64}
                    src={props.author.profileImageUrl}
                    alt="Profile Picture" />
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex gap-2 items-center">
                  <p className="flex">{nameDisplay}</p>
                  <p className="text-xs italic opacity-50">{`· ${dayjs(createdAt).fromNow()}`}</p>
                </div>
                <Link href={spaceUrl} className="flex gap-1">
                  <span className="badge badge-primary hover:badge-secondary">
                    {Space?.name}
                  </span>
                </Link>
              </div>
            </div>
            <div>
              {isOwnedByUser &&
                <button className="btn btn-ghost btn-circle text-error btn-sm " onClick={() => delModal.current?.show()}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              }
            </div>
          </div>
          <div className="px-4">{content}</div>
          <PostImage
            src={image} alt="" />

          <div className="px-4 flex flex-col gap-2 pr-8">
            <div className=" flex gap-2 items-center select-none">
              <FontAwesomeIcon
                ref={likeScope}
                className="text-lg text-secondary cursor-pointer"
                icon={isLiked ? faHeart : faHeartOutline}
                onClick={handleLike}
              />
              <p className="text-lg text-secondary opacity-50 font-bold">{likeCount}</p>
              {!isLikesUnique && <UniqueLikeEnforcer postId={id} />}
            </div>
            {comments && comments.length > 0 && (
              <>
            <div className="divider py-0 my-0"></div>
            <div className="flex flex-col gap-2">
                  {comments.map((comment) => <Comment key={comment.id} {...comment} userId={userId || ""} />)}
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
}
const CommentInput = (props: CommentInputProps) => {
  const { postId } = props;
  const [content, setContent] = useState("");
  const handleSubmit = () => {
    if (!content) return;

    console.log("submitting comment");
    console.log(content);
    console.log(postId);

    const commentContent = content.trim();
    setContent("");
    void mutate({ postId, content: commentContent });
  }
  
  const ctx = api.useContext();
  const { mutate } = api.posts.createComment.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacePostsById.invalidate();
      void ctx.feeds.getFeedPostsById.invalidate();
    }
  });
  
  return (
    <div className="join w-full">
      <input
        className="input input-bordered input-sm join-item w-full"
        type="text"
        placeholder="Write comment!"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />
      <button
        className="btn join-item btn-sm"
        onClick={handleSubmit}
      >
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </div>
  )
}

type UniqueLikeEnforcerProps = {
  postId: string;
}
// if likes are not unique, this sets a call to the server to enforce unique likes
// This fix is gimmicky and should be fixed on the server side
const UniqueLikeEnforcer = (props: UniqueLikeEnforcerProps) => {
  console.log("enforcing unique likes");
  const ctx = api.useContext();
  const { mutate } = api.posts.enforceUniqueLikes.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacePostsById.invalidate();
      void ctx.feeds.getFeedPostsById.invalidate();
    }
  });
  useMemo(() => {
    void mutate({ postId: props.postId });
  }, [props.postId, mutate]);
  return <></>
}
export default UserPost;
