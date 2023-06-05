import { set } from 'zod';
import Sidebar from './Sidebar';
import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@clerk/nextjs';

// Handles shared state between pages
export const FeedContext = createContext({
    ctxFeed: "global",
    ctxFeedType: 'feed',
    ctxOwner: '',
    ctxFeedName: 'Global',
    ctxUserId: '',
    setCtxFeed: (feed: string) => { console.log(feed) },
    setCtxFeedType: (feedType: string) => { console.log(feedType) },
    setCtxOwner: (owner: string) => { console.log(owner) },
    setCtxFeedName: (feedName: string) => { console.log(feedName) },
});

type LayoutProps = {
    children: React.ReactNode;
};


const Header = () => {
    const [header, setHeader] = useState("Global")
    const { ctxFeedName } = useContext(FeedContext);
    useEffect(() => {
        setHeader(ctxFeedName);
    }, [ctxFeedName])

    return (
        <div className="flex text-xl w-full items-center justify-center py-6 pb-4 bg-base-100">
            {header}
        </div>
    )
}


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
                <FeedContext.Provider value={{
                    ctxFeed: activeFeed,
                    ctxFeedType: activeFeedType,
                    ctxOwner: activeOwner,
                    ctxFeedName: activeFeedName,
                    ctxUserId: userId,

                    setCtxFeed: setActiveFeed,
                    setCtxFeedType: setActiveFeedType,
                    setCtxOwner: setActiveOwner,
                    setCtxFeedName: setActiveFeedName,
                }}>
                    <Sidebar handleSelectFeed={handleFeedChange} />
                    <div className='relative flex min-h-screen w-full flex-col items-center'>
                        <Header></Header>
                        <div className='h-full w-full bg-base-100'>
                            {children}
                        </div>
                    </div>
                </FeedContext.Provider>
            </main>
        </>
    )
}
export default DefaultLayout;