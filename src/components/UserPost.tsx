import type { Post } from "@prisma/client";
import App from "next/app";
import Image from "next/image";
import { useMemo, useRef, ForwardedRef } from "react";
import Link from "next/link";
import { CldImage } from 'next-cloudinary';
import { useAuth } from "@clerk/clerk-react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "~/utils/api";
import React from "react";

type ImageType = {
  src: string | undefined | null;
  alt: string | undefined;
};
const AppImage = (props: ImageType) => {
  const image = useMemo(() => props.src || "", [props.src]);
  const alt = useMemo(() => props.alt || "", [props.alt]);


  if (!image || image === "") return <></>;
  else
    return (
      <>
        <figure className="w-full">
          <Image
            className="image object-cover w-full select-none"
            src={image}
            width={400}
            height={400}
            alt={alt}
          />
        </figure>
      </>
    );
};


const DeleteModal = React.forwardRef(function DeleteModal(
  props: { id: string }, ref: ForwardedRef<HTMLDialogElement>,) {
  const ctx = api.useContext();

  const { mutate } = api.posts.deletePost.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacePostsById.invalidate();
      void ctx.feeds.getFeedPostsById.invalidate();
    },

    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <dialog ref={ref} className="modal">
      <form method="dialog" className="modal-box flex flex-col  items-center">
        <h3 className="font-bold text-xl text-error">Delete Post?</h3>
        <p className="pt-4">You might not be able to recover this again</p>
        <p className="py-0 text-xs italic text-info opacity-30 text-center max-w-xs">
          dev-note: If this fails and [comments, likes] are implemented, please contact me.
        </p>
        <div className="modal-action flex gap-4">
          {/* if there is a button in form, it will close the modal */}
          <button
            onClick={() => mutate({ postId: props.id })}
            className="btn btn-error">
            Delete
          </button>
          <button className="btn">Cancel</button>
        </div>
      </form>
    </dialog >
  )

})


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
    updatedAt,
    author,
    Space
  } = props;

  const { userId } = useAuth();
  const dateCreated = useMemo(
    () => createdAt.toLocaleDateString("en-us"),
    [createdAt]
  );
  const spaceUrl = useMemo(() => {
    if (spaceId && Space?.name) return `/space/${spaceId}`;
    else return "";
  }, [spaceId, Space?.name]);

  const isOwnedByUser = useMemo(() => {
    return userId === authorId;
  }
    , [userId, authorId]);

  const nameDisplay = useMemo(() => {
    if (isOwnedByUser) return <span className="italic">You</span>;
    else if (author?.username) return `@${author.username}`;
  }, [isOwnedByUser, author?.username])


  const delModal: React.RefObject<HTMLDialogElement> = useRef(null);
  if (!props.author) return <></>;

  return (
    <>
      {isOwnedByUser
        &&
        <DeleteModal ref={delModal} id={id} />
      }
      <div className="card w-full shadow-xl max-w-md bg-base-100">
        <div className="card-body py-6  pt-4 gap-4   px-0">
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
                  <p className="text-xs italic opacity-50">{dateCreated}</p>
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
          <AppImage
            src={image} alt="" />
        </div>
      </div>
    </>
  );
};

export default UserPost;
