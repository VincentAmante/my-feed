import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import SwitchTheme from "~/components/SwitchTheme";

interface Props {
  handleSelectFeed?: (feedOrSpace: string, type: string) => void;
}

const defaultProps = {
  handleSelectFeed: (feedOrSpace: string, type: string) => {
    return {
      id: feedOrSpace,
      type,
    };
  },
};

const Sidebar = (sidebarProps: Props) => {
 

  const props = { ...defaultProps, ...sidebarProps };

  const [isToggled, setIsToggled] = useState(false);
  const [sidebarStyle, setSidebarStyle] = useState(
    ["-translate-x-full"].join(" ")
  );

  const handleOnClick = () => {
    console.log(isToggled);
    setIsToggled(!isToggled);

    if (isToggled) {
      setSidebarStyle("transform-none");
    } else {
      setSidebarStyle("-translate-x-full");
    }
  };

  const spaceOnClick = (spaceId: string) => {
    props.handleSelectFeed(spaceId, "space");
  }

  const feedOnClick = (feedId: string) => {
    props.handleSelectFeed(feedId, "feed");
  };
  return (
    <>
      <aside
        className={`fixed left-0 flex h-full w-full max-w-xs md:h-auto ${sidebarStyle} transform flex-col
        gap-4 bg-slate-900 bg-opacity-80 p-4 py-8 backdrop-blur-sm transition-all md:static md:transform-none`}
      >
        <div>
          <div>
            <SignedIn>
              {/* Mount the UserButton component */}
              <UserButton />
            </SignedIn>
            <SignedOut>
              {/* Signed out users get sign in button */}
              <SignInButton />
            </SignedOut>
          </div>
        </div>
        
        <div className=" rounded-lg bg-slate-900 bg-opacity-40 p-2 font-light">
          <ul className="flex flex-col gap-2 py-2 text-lg">
            <li className="btn-ghost btn justify-start font-normal normal-case">
              Personal
            </li>
          </ul>
        </div>
        <div className=" rounded-lg bg-slate-900 bg-opacity-40 p-2 font-light">
          <div className="px-3 py-2 text-xl">Feeds</div>
          <ul className="flex flex-col gap-2 py-2 text-lg">
            <li
              onClick={() => feedOnClick("global")}
              className="btn-ghost btn justify-start font-normal normal-case"
            >
              Global
            </li>
          </ul>
        </div>
        <div className=" rounded-lg bg-slate-900 bg-opacity-40 p-2 font-light">
          <div className="px-3 py-2 text-xl">Spaces</div>
          <SpaceList onClick={spaceOnClick} />
        </div>
        <div
          onClick={handleOnClick}
          className="absolute right-0 top-0 mt-2 flex aspect-square translate-x-full transform flex-col items-center justify-center rounded-r-lg bg-slate-900 bg-opacity-80 p-2 md:hidden"
        >
          Show
        </div>
      </aside>
    </>
  );
};

type SpaceListProp = {
  onClick: (spaceId: string) => void;
}
const SpaceList = ({ onClick }: SpaceListProp) => {
  const { userId } = useAuth();

  const { data, isLoading: postsLoading } =
    api.spaces.getSpacesByUserId.useQuery({
      ownerId: userId || "",
    });

  if (postsLoading)
    return (
      <div className="flex grow">
        <div>..Loading</div>
      </div>
    );
  if (!data) return <div>Something went wrong</div>;

  if (data) {
    console.log(data);
  }
  return <ul className="flex flex-col gap-2 py-2 text-lg">
    {data.map((space) => {
      return <li
        className="btn-ghost btn justify-start font-normal normal-case"
        key={space.id}
        onClick={() => onClick(space.id)}>{space.name}</li>;
    })}
  </ul>;
};

export default Sidebar;
