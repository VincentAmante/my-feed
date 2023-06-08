import DefaultLayout from "~/components/Layouts"
import type { NextPageWithLayout } from "../_app"
import type { GetStaticProps } from "next"
import { api } from "~/utils/api"
import { generateSSGHelper } from "~/server/helpers/ssgHelper"
import { useRouter } from "next/router"
import Image from "next/image"
import { LoadingSkeleton, ErrorSkeleton } from "~/components/SkeletonViews/FeedSkeletons"
import type { Feed, Space } from "@prisma/client"

const UserPage: NextPageWithLayout = () => {
  const username = useRouter().query.username;
  let usernameString = '';

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

  return <>
    <UserHeader username={usernameString} profileImageUrl={data?.profileImageUrl || ""} />
    <UserFeeds userId={data?.id || ""} />
    <UserSpace userId={data?.id || ""} />
  </>
}
UserPage.getLayout = (page: React.ReactNode) => <DefaultLayout>{page}</DefaultLayout>


type UserPageProps = {
  username: string,
  profileImageUrl: string,
}
const UserHeader = (props: UserPageProps) => {
  const { username, profileImageUrl } = props;

  return <>
        <div className="flex text-xl w-full items-center justify-center py-6 pb-4 bg-base-100">
      {profileImageUrl
        &&
        <Image src={profileImageUrl} alt="profile picture" width={50} height={50} className="rounded-full mr-2 w-12" />}
      <span>
        @{username}
      </span>
    </div>
  </>
}

type UserFeedsProps = {
  userId: string,
}
const UserFeeds = (props: UserFeedsProps) => {
  const { userId } = props;
  const { data, isLoading, isError } = api.feeds.getProfileFeeds.useQuery({
    userId: userId
  })

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
        return <div key={feed.id}>
          {feed.name}
        </div>
      })}
    </>
  }  
}

type UserSpaceProps = {
  userId: string,
}

const UserSpace = (props: UserSpaceProps) => {
  const { userId } = props;
  const { data, isLoading, isError } = api.spaces.getProfileSpaces.useQuery({
    userId: userId
  })

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
        return <div key={space.id} >
          {space.name}
        </div>
      })}
    </>
  }  
}

export default UserPage