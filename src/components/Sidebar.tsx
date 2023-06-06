import { useContext, useState } from "react";
import { api } from "~/utils/api";
import UserDisplay from "~/components/UserDisplay";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faPlus, } from "@fortawesome/free-solid-svg-icons";
import { FeedContext } from "./Layouts";
import Link from "next/link";
import React from "react";
import { createPortal } from "react-dom";
import CreateSpaceModal from "./Space/CreateSpaceModal";

interface SidebarProps {
  handleSelectFeed: (
    id: string,
    type: string,
    name: string,
    ownerId: string
  ) => void;
}

const Sidebar = (sidebarProps: SidebarProps) => {
  const props = useMemo(() => ({ ...sidebarProps }), [sidebarProps]);

  const feedOnClick = (feedId: string, name: string, ownerId: string) => {
    props.handleSelectFeed(feedId, "feed", name, ownerId);
  };

  const spaceListElement = useMemo(() => {
    return <SpaceList />;
  }, []);

  const [spaceListToggle, setSpaceListToggle] = useState(true);
  return (
    <SidebarWrapper>
      <div>
        <UserDisplay />
      </div>
      <div className="collapse collapse-arrow rounded-lg p-2 font-light bg-base-200">
        <input type="checkbox"
          checked={spaceListToggle}
          onChange={() => setSpaceListToggle(!spaceListToggle)}
        />
        <div className="collapse-title text-xl">
          <span>Your Spaces</span>
        </div>
        <div className="collapse-content">
        {spaceListElement}
        </div>
      </div>
      <div className=" rounded-lg p-2 font-light">
        <div className="px-3 py-2 text-xl">Feeds</div>
        <ul className="flex flex-col gap-2 py-2 text-lg">
          <li className="w-full">
            <Link
              href="/feed"
              onClick={() => feedOnClick("global", "Global", "global")}
              className="w-full btn-ghost btn justify-start font-normal normal-case"
            >
              Global
            </Link>
          </li>
        </ul>
      </div>
    </SidebarWrapper>
  );
};
export default Sidebar;


// TODO: Move this to a custom hook or refactor
const useSidebarToggle = () => {
  const [isToggled, setIsToggled] = useState(false);
  const [sidebarStyle, setSidebarStyle] = useState(
    ["-translate-x-full"].join(" ")
  );

  const handleOnClick = () => {
    setIsToggled(!isToggled);

    if (isToggled) {
      setSidebarStyle("transform-none drop-shadow-xl");
    } else {
      setSidebarStyle("-translate-x-full");
    }
  };

  return { sidebarStyle, handleOnClick };
};


type SidebarWrapperProps = {
  children: React.ReactNode;
};

// Container
const SidebarWrapper = (props: SidebarWrapperProps) => {
  const { sidebarStyle, handleOnClick } = useSidebarToggle();

  return (
    <aside className={`fixed left-0 flex h-full w-full max-w-xs md:h-auto ${sidebarStyle} transform flex-col
    gap-4 bg-base-100  p-4 py-8 md:drop-shadow-none  transition-all md:static md:transform-none `}>
      {props.children}
      <div
        onClick={handleOnClick}
        className="absolute z-10 right-0 top-0 mt-4 flex aspect-square  transform translate-x-full bg-base-100 scale-x-110 flex-col items-center justify-center rounded-r-lg pl-3  p-2 md:hidden text-2xl"
      >
        <FontAwesomeIcon icon={faBars} />
      </div>
    </aside>
  )
};

const FeedList = () => {
  const { ctxUserId } = useContext(FeedContext);

  const { data, isLoading: postsLoading } =
    api.feeds.getFeedsByUserId.useQuery({
      ownerId: ctxUserId,
    });
  
}

const SpaceList = () => {
  const { ctxUserId } = useContext(FeedContext);

  const { data, isLoading: postsLoading } =
    api.spaces.getSpacesByUserId.useQuery({
      ownerId: ctxUserId,
    });

  const createSpaceModal: React.RefObject<HTMLDialogElement> = React.useRef(null);

  if (postsLoading)
    return (
      <div className="flex w-full px-2 items-center grow">
        <span className="loading loading-dots text-accent"></span>
      </div>
    );
  if (!data) return <div>Something went wrong</div>;

  return (

    <>
      <ul className="flex flex-col gap-1 text-lg">
        {data.map((space) => {
          return (
            <li className="w-full"
              key={space.id}
            >
              <Link
                href={`/space/${space.id}`}
                className="w-full btn btn-ghost justify-start font-normal normal-case">
                {space.name}
              </Link>
            </li>
          );
        })}
        {createPortal(
          <CreateSpaceModal ref={createSpaceModal} />,
          document.body
        )}
        <button onClick={() => createSpaceModal.current?.show()} className="btn btn-ghost opacity-30 hover:opacity-100 w-full flex justify-start gap-1">
          <FontAwesomeIcon icon={faPlus} />
          <span className="text-xs">Create new Space</span>
        </button>
      </ul>
    </>
  );
};
