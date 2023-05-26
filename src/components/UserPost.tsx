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

const UserPost = (props: Post) => {
  const {
    id,
    content,
    image,
    createdAt,
    authorId,
    feedId,
    likedByIDs,
    updatedAt,
  } = props;

  const dateCreated = useMemo(
    () => createdAt.toLocaleDateString("en-us"),
    [createdAt]
  );

  return (
    <div className="card w-full bg-slate-800 shadow-xl min-w-[18rem]">
      <div className="card-body py-6 gap-6 px-0">
        <div className="flex items-center gap-2 px-4">
          <div className="placeholder avatar">
            <div className="w-10 rounded-full bg-neutral-focus text-neutral-content">
              <span className="text-xs">AA</span>
            </div>
          </div>
          <div>
            <p>Name goes here</p>
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
