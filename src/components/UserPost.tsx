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
        <figure className="w-full bg-black">
          <Image
            className="image object-cover w-full h-auto"
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
    if (spaceId && Space.name) return `/space/${spaceId}`;
    else return "";
  }, [spaceId, Space.name]);

  if (!props.author) return <></>;

  return (
    <div className="card w-full bg-slate-800 shadow-xl min-w-[18rem] max-w-sm">
      <div className="card-body py-6 gap-2   px-0">
        <div className="flex items-center gap-2 px-4">
          <div className="avatar">
            <div className="w-8 rounded-full bg-neutral-focus text-neutral-content">
              <Image
                width={64}
                height={64}
                src={props.author.profileImageUrl}
                alt="Profile Picture" />
            </div>
          </div>
          <div>
            <p>@{props.author.username}</p>
            <p className="text-xs italic opacity-50">{dateCreated}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 px-4">
          <Link href={spaceUrl} className="flex gap-1">
            <span className="underline">
              {Space.name}
            </span>
          </Link>
        </div>
        <AppImage src={image} alt="" />
        <div className="px-4">{content}</div>
      </div>
    </div>
  );
};

export default UserPost;
