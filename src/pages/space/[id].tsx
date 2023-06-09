import { useRouter } from "next/router";
import type { NextPageWithLayout } from "~/pages/_app";
import { FeedContext } from "~/components/Layouts";
import { useContext } from "react";
import DefaultLayout from "~/components/Layouts";
import { api } from "~/utils/api";
import Post from "~/components/UserPost";
import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import CreatePost from "~/components/CreatePost";
import React from "react";
import UpdateSpaceModal from "~/components/Space/UpdateSpaceModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faWind } from "@fortawesome/free-solid-svg-icons";
import { LoadingSkeleton, ErrorSkeleton } from "~/components/SkeletonViews/FeedSkeletons";
import { createPortal } from "react-dom";
import { useRef } from "react";
import SpaceIcon from "~/components/AppIcon";

const SpacePage: NextPageWithLayout = () => {
    const { setCtxFeedType, setCtxFeedName, setCtxOwner, setCtxFeed, ctxFeedName } = useContext(FeedContext);
    const { userId } = useAuth();
    const router = useRouter();

    // Parses id from url query
    const routerId = useRouter().query.id;
    let id = '';
    if (Array.isArray(routerId) && routerId.length > 0 && routerId[0]) {
        id = routerId[0];
    } else if (typeof routerId === 'string') {
        id = routerId;
    }

    const { data, isLoading } = api.spaces.getSpaceById.useQuery({
        spaceId: id
    })

    const spaceModalRef = useRef<HTMLDialogElement>(null);
    // storing is useMemo prevents bug where it stays on the space after re-routing
    useMemo(() => {
        if (data) {
            setCtxFeedType('space');
            setCtxFeedName(data.name);
            setCtxFeed(data.id);
            setCtxOwner(data.ownerId);
        }
    }, [data, setCtxFeedType, setCtxFeedName, setCtxFeed, setCtxOwner])

    const userOwnsSpace = useMemo(() => {
        if (data?.ownerId === userId) {
            return true;
        }
    }, [data, userId])

    function openModal() {
        spaceModalRef.current?.showModal();
    }

    if (isLoading) return <LoadingSkeleton />;
    else if (!data) return <ErrorSkeleton />;
    else if (data?.visibility === 'private' && data.ownerId !== userId) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
                <span className="text-2xl font-bold">This space is private</span>
                <button className="btn btn-primary " onClick={() => void router.push('/feed')}>Go Back</button>
            </div>
        )
    }
    else return <>
        {userOwnsSpace && createPortal(<UpdateSpaceModal spaceId={id} ref={spaceModalRef}></UpdateSpaceModal>, document.body)}
        <div className="flex text-xl w-full items-center justify-center py-6 pb-4 bg-base-100">

            <span className="flex  items-center justify-center gap-2">
            <SpaceIcon imageSrc={data?.icon || undefined}></SpaceIcon>
                {ctxFeedName}
            </span>
            {userOwnsSpace && 
            (<button className="btn btn-ghost btn-sm ml-2 btn-circle" onClick={() => openModal()}>
            <FontAwesomeIcon icon={faPenToSquare} />
        </button>)}
        </div>
        <div className="flex flex-col items-center h-full w-full rounded-3xl rounded-b-none p-4 gap-2 bg-base-300">

            {userOwnsSpace && <CreatePost></CreatePost>}
            <SpacePosts></SpacePosts>
        </div>
    </>
}

SpacePage.getLayout = function getLayout(page) {
    return (
        <DefaultLayout>
            {page}
        </DefaultLayout>
    )
}


const EmptySpace = () => {
    const { userId } = useAuth();
    const { ctxOwner } = useContext(FeedContext);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
        <FontAwesomeIcon icon={faWind} className="text-6xl opacity-30" />
        <span className="text-2xl font-bold opacity-30">This space is empty</span>
        {userId === ctxOwner && <span className="text-md opacity-30">Fill it up with some posts!</span>}
    </div>
    )
}

const SpacePosts = () => {
    const router = useRouter();
    const id = router.query.id;

    const { data, isLoading } = api.spaces.getSpacePostsById.useQuery({
        spaceId: id as string
    })

    if (isLoading)
        return <LoadingSkeleton />;
        
    if (data?.length === 0) {
        console.log('empty')
        return <EmptySpace/>
    }

    return (
        <>
            {data?.map((post) => (
                <Post key={post.id} {...post} />
            ))}
        </>
    )
}

export default SpacePage;  