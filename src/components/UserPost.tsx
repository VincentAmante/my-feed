import type { Post } from "@prisma/client";
import App from "next/app";
import Image from "next/image";
import { useState, useMemo } from "react";


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
        <figure>
          <img className="image object-cover max-w-sm" src={image} alt={alt} />
        </figure>
      </>
    );
};

type Author = {
  id: string;
  username: string | null;
  profileImageUrl: string;
  firstName: string | null;
  lastName: string | null;
}

type PostWithUser = Post & {
  author: Author | undefined;
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
  } = props;

  const dateCreated = useMemo(
    () => createdAt.toLocaleDateString("en-us"),
    [createdAt]
  );

  if (!props.author) return <></>;

  return (
    <div className="card w-full bg-slate-800 shadow-xl min-w-[18rem]">
      <div className="card-body py-6 gap-6 px-0">
        <div className="flex items-center gap-2 px-4">
          <div className="avatar">
            <div className="w-16 rounded-full bg-neutral-focus text-neutral-content">
              <img src={props.author.profileImageUrl} alt="Profile Picture" />
            </div>
          </div>
          <div>
            <p>@{props.author.username}</p>
            <p className="text-xs italic opacity-50">{dateCreated}</p>
          </div>
        </div>
        <AppImage src={image} alt="" />
        <div className="px-4">{content}</div>
      </div>
    </div>
  );
};

export default UserPost;
