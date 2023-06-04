import { set } from 'zod';
import Sidebar from './Sidebar';
import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@clerk/nextjs';

export const FeedContext = createContext({
    ctxFeed: "global",
    ctxFeedType: 'feed',
    ctxOwner: '',
    ctxFeedName: 'Global',
    ctxUserId: '',
});

type LayoutProps = {
    children: React.ReactNode;
};

const DefaultLayout = ({ children }: LayoutProps) => {
    const { ctxFeed, ctxFeedType, ctxOwner, ctxFeedName } = useContext(FeedContext);
    const [activeFeed, setActiveFeed] = useState(ctxFeed);
    const [activeFeedType, setActiveFeedType] = useState(ctxFeedType);
    const [activeOwner, setActiveOwner] = useState(ctxOwner);
    const [activeFeedName, setActiveFeedName] = useState(ctxFeedName);
    const { userId } = useAuth()

    function handleFeedChange(feed: string, feedType: string, feedName: string, ownerId: string,) {
        setActiveFeed(feed);
        setActiveFeedType(feedType);
        setActiveOwner(ownerId);
        setActiveFeedName(feedName);
    }

    if (!userId) return (
        <>
            <main className="w-full h-screen flex flex-col items-center justify-center">
                <span className="loading loading-bars loading-lg text-primary"></span>
            </main>
        </>
    );

    return (
        <>
            <main className="flex h-full w-full  items-stretch">
                <FeedContext.Provider value={{ ctxFeed: activeFeed, ctxFeedType: activeFeedType, ctxOwner: activeOwner, ctxFeedName: activeFeedName, ctxUserId: userId }}>
                    <Sidebar handleSelectFeed={handleFeedChange} />
                    <div className='relative flex min-h-screen w-full flex-col items-center'>
                        <div className="flex text-xl w-full items-center justify-center py-6 pb-4 bg-base-100">
                            {activeFeedName}
                        </div>
                        {children}
                    </div>
                </FeedContext.Provider>
            </main>
        </>
    )
}
export default DefaultLayout;