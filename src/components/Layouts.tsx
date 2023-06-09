import { set } from 'zod';
import Sidebar from './Sidebar';
import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Toast, ToastContainer, type ToastProps} from './Toast';

// Handles shared state between pages
export const FeedContext = createContext({
    ctxFeed: "global",
    ctxFeedType: 'feed',
    ctxOwner: '',
    ctxFeedName: 'Global',
    ctxUserId: '',
    toastList: [] as ToastProps[],
    setCtxFeed: (feed: string) => { console.log(feed) },
    setCtxFeedType: (feedType: string) => { console.log(feedType) },
    setCtxOwner: (owner: string) => { console.log(owner) },
    setCtxFeedName: (feedName: string) => { console.log(feedName) },
    addToast: (message: string, type: "info" | "error" | "success" | "warning") => { console.log(message, type) },
    setToastList: (toastList: ToastProps[]) => { console.log(toastList) },
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

const ToastHandler = () => {
    const { toastList, setToastList } = useContext(FeedContext);

    function handleOnDelete(index: number) {
        setToastList(toastList.filter((_, i) => i !== index))
    }

    if (toastList.length == 0) return <></>
    return (
        <ToastContainer>
            {toastList.map((toast, i) => {
                return (
                    <Toast
                        key={i}
                        message={toast.message}
                        type={toast.type}
                        onDelete={() => handleOnDelete(i)} />
                )
            })}
        </ToastContainer>
    )
}


const DefaultLayout = ({ children }: LayoutProps) => {
    const { ctxFeed, ctxFeedType, ctxOwner, ctxFeedName } = useContext(FeedContext);
    const [activeFeed, setActiveFeed] = useState(ctxFeed);
    const [activeFeedType, setActiveFeedType] = useState(ctxFeedType);
    const [activeOwner, setActiveOwner] = useState(ctxOwner);
    const [activeFeedName, setActiveFeedName] = useState(ctxFeedName);
    const [toastList, setToastList] = useState([] as ToastProps[]);
    const { userId } = useAuth()

    function handleFeedChange(feed: string, feedType: string, feedName: string, ownerId: string,) {
        setActiveFeed(feed);
        setActiveFeedType(feedType);
        setActiveOwner(ownerId);
        setActiveFeedName(feedName);
    }

    function addToast(message: string, type: "success" | "info" | "error" | "warning") {
        setToastList([...toastList, { message: message, type: type, onDelete: () => { console.log('onDelete not implemented') } }])
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
                    toastList: toastList,

                    setCtxFeed: setActiveFeed,
                    setCtxFeedType: setActiveFeedType,
                    setCtxOwner: setActiveOwner,
                    setCtxFeedName: setActiveFeedName,
                    addToast: addToast,
                    setToastList: setToastList,
                }}>
                    <Sidebar handleSelectFeed={handleFeedChange} />

                    <div className='relative flex min-h-screen w-full flex-col items-center'>

                        <div className='h-full w-full bg-base-100'>
                            {children}
                        </div>
                    </div>
                    <ToastHandler />
                </FeedContext.Provider>
            </main>
        </>
    )
}
export default DefaultLayout;