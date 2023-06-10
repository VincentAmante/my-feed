import { useRouter } from "next/router";
import type { NextPageWithLayout } from "~/pages/_app";
import { FeedContext } from "~/components/Layouts";
import { useContext } from "react";
import DefaultLayout from "~/components/Layouts";
import { api } from "~/utils/api";
import { useAuth } from "@clerk/nextjs";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LoadingSkeleton,
  ErrorSkeleton,
} from "~/components/SkeletonViews/FeedSkeletons";
import PostImages from "~/components/PostImage";
import { createPortal } from "react-dom";
import { useRef } from "react";
import SpaceIcon from "~/components/AppIcon";
import Head from "next/head";

const PostPage: NextPageWithLayout = () => {
  const {
    setCtxFeedType,
    setCtxFeedName,
    setCtxOwner,
    setCtxFeed,
    ctxFeedName,
  } = useContext(FeedContext);
  const { userId } = useAuth();
  const router = useRouter();

  const { data: postData, isLoading: postLoading } =
    api.posts.getPostById.useQuery({
      postId: router.query.id as string,
    });

  if (postLoading) {
    return (
      <>
        <div className="flex h-full w-full flex-col items-center bg-black bg-opacity-20 p-2">
          <LoadingSkeleton />
        </div>
      </>
    );
  }
  if (!postData) {
    return (
      <>
        <div className="flex h-full w-full flex-col items-center bg-black bg-opacity-20 p-2">
          <ErrorSkeleton />
        </div>
      </>
    );
  }

  const userUrl = `/user/${postData.author.username || ""}`;
  return (
    <>
      <div className="flex h-full w-full flex-col items-center bg-black bg-opacity-20 p-2">
        <div className="card">
          <div className="card-body">
            <div className="card-title">
              <Link href={userUrl} className="avatar">
                <div className="w-12 rounded-full bg-neutral-focus text-neutral-content">
                  <Image
                    width={64}
                    height={64}
                    src={postData.author.profileImageUrl}
                    alt="Profile Picture"
                  />
                </div>
              </Link>
              <h2>{postData.author.username}</h2>
            </div>
          </div>
          <PostImages imageUrls={postData.images} />
        </div>
      </div>
    </>
  );
};

PostPage.getLayout = (page) => {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default PostPage;
