import type { Post } from "@prisma/client";
import App from "next/app";
import Image from "next/image";
import { useState, useMemo } from "react";
import Link from "next/link";
import { CldImage } from 'next-cloudinary';

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

  const dateCreated = useMemo(
    () => createdAt.toLocaleDateString("en-us"),
    [createdAt]
  );
  const spaceUrl = useMemo(() => {
    if (spaceId && Space?.name) return `/space/${spaceId}`;
    else return "";
  }, [spaceId, Space?.name]);

  if (!props.author) return <></>;

  return (
    <div className="card w-full shadow-xl max-w-md bg-base-100">
      <div className="card-body py-6 gap-4   px-0">
        <div className="flex items-center gap-2 px-4">
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
              <p>@{props.author.username}</p>

              <p className="text-xs italic opacity-50">{dateCreated}</p>
            </div>
            <Link href={spaceUrl} className="flex gap-1">
              <span className="badge badge-primary hover:badge-secondary">
                {Space?.name}
              </span>
            </Link>
          </div>
        </div>
        <AppImage
          src={image} alt="" />
        <div className="px-4">{content}</div>
      </div>
    </div>
  );
};

export default UserPost;
