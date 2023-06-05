import type { Post } from "@prisma/client";
import Image from "next/image";
import { useMemo, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/clerk-react";
import { faTrash, faHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "~/utils/api";
import React from "react";
import PostImage from "./PostImage";
import DeleteModal from "./DeleteModal";

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
    Space
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

  const handleLike = () => {
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
          <div className="flex px-4 gap-2 items-center">
            <FontAwesomeIcon
              className="text-lg text-secondary cursor-pointer"
              icon={isLiked ? faHeart : faHeartOutline}
              onClick={handleLike}
            />
            <p className="text-lg text-secondary opacity-50 font-bold">{likeCount}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserPost;
