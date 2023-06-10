import DefaultLayout from "~/components/Layouts"
import type { NextPageWithLayout } from "../_app"
import type { GetStaticProps } from "next"
import { api } from "~/utils/api"
import { useState, useMemo, useContext } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import { LoadingSkeleton, ErrorSkeleton } from "~/components/SkeletonViews/FeedSkeletons"
import type { Feed, Space } from "@prisma/client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faMinus, faImage } from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import { FeedContext } from "~/components/Layouts"
import Head from "next/head"


const UserPage: NextPageWithLayout = () => {
  const username = useRouter().query.username;
  let usernameString = '';

  const [feedCount, setFeedCount] = useState<number>(0);
  const [spaceCount, setSpaceCount] = useState<number>(0);

  // Ensures that the username is a string
  if (typeof username === 'string') {
    usernameString = username;
  } else if (typeof username === 'object' && username[0] !== null) {
    if (typeof username[0] === 'string')
      usernameString = username[0];
  }
  usernameString = usernameString.replace('@', '');

  const { data } = api.users.getUserByUsername.useQuery({
    username: usernameString
  })

  const getPlural = (count: number, singular: string, plural: string) => {
    if (count === 1) {
      return `${singular}`
    } else {
      return `${plural}`
    }
  }

  return <>
    <Head>
      <title>{usernameString} | Kiurate</title>
    </Head>
    <div className=" flex text-xl w-full items-center px-8 py-8">
      {data?.profileImageUrl
        &&
        <Image src={data?.profileImageUrl} alt="profile picture" width={100} height={100} className="rounded-full mr-2 w-20" />}
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-primary">
          {usernameString}
        </span>
        <div className="text-sm flex gap-2">
          <span>{feedCount} {getPlural(feedCount, 'Feed', 'Feeds')}</span>
          <span>{spaceCount} {getPlural(spaceCount, 'Space', 'Spaces')}</span>
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-12 py-8 bg-base-200 h-full px-4 rounded-2xl">
      <section id="spaces" className="flex flex-col max-w-4xl gap-4">
        <h1 className="text-4xl font-bold">Feeds</h1>
        <div className="grid lg:grid-cols-3 gap-4">
          <UserFeeds setFeedCount={setFeedCount} userId={data?.id || ""} />
        </div>
      </section>
      <section id="spaces" className="flex flex-col max-w-4xl gap-4">
        <h1 className="text-4xl font-bold">Spaces</h1>
        <div className="grid lg:grid-cols-3 gap-4">
          <UserSpace setSpaceCount={setSpaceCount} userId={data?.id || ""} />
        </div>
      </section>
    </div>
  </>
}
UserPage.getLayout = (page: React.ReactNode) => <DefaultLayout>{page}</DefaultLayout>


type UserFeedsProps = {
  userId: string,
  setFeedCount: (count: number) => void,
}
const UserFeeds = (props: UserFeedsProps) => {
  const { userId, setFeedCount } = props;
  const { data, isLoading, isError } = api.feeds.getProfileFeeds.useQuery({
    userId: userId
  })

  const { setCtxFeed, setCtxFeedName, setCtxFeedType, setCtxOwner } = useContext(FeedContext);

  useMemo(() => {
    if (data) {
      setFeedCount(data.length);
    }
  }, [data, setFeedCount])

  function handleOnClick(feedId: string, feedName: string, feedOwner: string) {
    setCtxFeed(feedId);
    setCtxFeedName(feedName);
    setCtxFeedType('feed');
    setCtxOwner(feedOwner);
  }

  if (isLoading) return <LoadingSkeleton />;
  else if (isError) return <ErrorSkeleton />;
  else if (!data) return <ErrorSkeleton />;

  if (data.length === 0) {
    return <>
      <p>No feeds</p>
    </>
  }
  else {
    return <>
      {data.map((feed: Feed) => {
        // return <UserFeed key={feed.id} feed={feed} />
        return (
          <Link key={feed.id} onClick={() => handleOnClick(feed.id, feed.name, feed.ownerId)} href='/feed' className="w-full max-w-xs flex flex-col items-center gap-4 rounded-md shadow-xl p-4 bg-neutral">
            {feed.icon &&
              <div className="avatar">
                <div className="w-20">
                  <Image src={feed.icon || ""} className="rounded-full object-cover" alt="Space Icon" width={600} height={600} />
                </div>
              </div>
            }
            {
              !feed.icon &&
              <div className="avatar placeholder bg-base-100 rounded-full aspect-square">
                <div className="w-20">
                  {
                    <FontAwesomeIcon icon={faImage} className="text-4xl text-base-content opacity-20" />
                  }
                </div>
              </div>
            }
            <div className="h-full flex flex-col items-start justify-center">
              <h2 className="text-2xl">{feed.name}</h2>
              {/* <button className="btn btn-success btn-sm">Buy Now</button> */}
            </div>
          </Link>
        )
      })}
    </>
  }
}

type UserSpaceProps = {
  userId: string,
  setSpaceCount: (count: number) => void,
}

const UserSpace = (props: UserSpaceProps) => {
  const { userId, setSpaceCount } = props;
  const { data, isLoading, isError } = api.spaces.getProfileSpaces.useQuery({
    userId: userId
  })

  useMemo(() => {
    if (data) {
      setSpaceCount(data.length);
    }
  }, [data, setSpaceCount])

  if (isLoading) return <LoadingSkeleton />;
  else if (isError) return <ErrorSkeleton />;
  else if (!data) return <ErrorSkeleton />;

  if (data.length === 0) {
    return <>
      <p>No spaces</p>
    </>
  }
  else {
    return <>
      {data.map((space: Space) => {
        return (
          <Link href={`/space/${space.id}`} key={space.id} className="w-full max-w-xs flex flex-col items-center gap-4 rounded-md shadow-xl p-4 bg-neutral">
            {space.icon &&
              <div className="avatar">
                <div className="w-20">
                  <Image src={space.icon || ""} className="rounded-full object-cover" alt="Space Icon" width={600} height={600} />
                </div>
              </div>
            }
            {
              !space.icon &&
              <div className="avatar placeholder bg-base-100 rounded-full aspect-square">
                <div className="w-20">
                  {
                    <FontAwesomeIcon icon={faImage} className="text-4xl text-base-content opacity-20" />
                  }
                </div>
              </div>
            }
            <div className="h-full flex flex-col items-start justify-center">
              <h2 className="text-2xl">{space.name}</h2>
              {/* <button className="btn btn-success btn-sm">Buy Now</button> */}
            </div>
          </Link>
        )
      })}
    </>
  }
}

export default UserPage