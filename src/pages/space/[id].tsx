import { useRouter } from "next/router";
import type { NextPageWithLayout } from "~/pages/_app";
import { FeedContext } from "~/components/Layouts";
import { useContext } from "react";
import DefaultLayout from "~/components/Layouts";
import { api } from "~/utils/api";
import Post from "~/components/UserPost";
import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";



const SpacePage: NextPageWithLayout = () => {
    const { setCtxFeedType, setCtxFeedName, setCtxFeed } = useContext(FeedContext);
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

    // storing is useMemo prevents bug where it stays on the space after re-routing
    useMemo(() => {
        if (data) {
            setCtxFeedType('space');
            setCtxFeedName(data.name);
            setCtxFeed(data.id);
        }
    }, [data, setCtxFeedType, setCtxFeedName, setCtxFeed])

    if (isLoading)
        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
                <span className="loading loading-bars loading-lg text-primary"></span>
            </div>
        );
    else if (data?.visibility === 'private' && data.ownerId !== userId) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
                <span className="text-2xl font-bold">This space is private</span>
                <button className="btn btn-primary " onClick={() => void router.push('/feed')}>Go Back</button>
            </div>
        )
    }
    return <>
        <div className="flex flex-col items-center h-full w-full rounded-3xl rounded-b-none p-4 gap-2 bg-base-300">
            {/* {canMakePost && <CreatePostWizard></CreatePostWizard>} */}
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

const SpacePosts = () => {
    const router = useRouter();
    const id = router.query.id;

    const { data, isLoading } = api.spaces.getSpacePostsById.useQuery({
        spaceId: id as string
    })

    if (isLoading)
        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
                <span className="loading loading-bars loading-lg text-primary"></span>
            </div>
        );
    if (data?.length === 0) {
        console.log('empty')
        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
                <span className="text-2xl font-bold">This space is empty</span>
            </div>
        )
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