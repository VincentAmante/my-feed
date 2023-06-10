import { use, useContext, useState, useEffect } from "react";
import { api } from "~/utils/api";
import UserDisplay from "~/components/UserDisplay";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FeedContext } from "./Layouts";
import Link from "next/link";
import React from "react";
import { createPortal } from "react-dom";
import CreateSpaceModal from "./Space/CreateSpaceModal";
import CreateFeedModal from "./Feed/CreateFeedModal";

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
  const [feedListToggle, setFeedListToggle] = useState(true);

  const createFeedModal: React.RefObject<HTMLDialogElement> =
    React.useRef(null);

  return (
    <SidebarWrapper>
      <div>
        <UserDisplay />
      </div>
      <div className="collapse-arrow collapse rounded-lg bg-base-200 p-2 font-light">
        <input
          type="checkbox"
          checked={spaceListToggle}
          onChange={() => setSpaceListToggle(!spaceListToggle)}
        />
        <div className="collapse-title text-xl">
          <span>Your Spaces</span>
        </div>
        <div className="collapse-content">{spaceListElement}</div>
      </div>
      <div className="collapse-arrow collapse rounded-lg bg-base-200 p-2 font-light">
        <input
          type="checkbox"
          checked={feedListToggle}
          onChange={() => setFeedListToggle(!feedListToggle)}
        />
        <div className="collapse-title">
          <div className="px-3 py-2 text-xl">Feeds</div>
        </div>
        <ul className="collapse-content flex flex-col gap-2 text-lg">
          <li className="w-full">
            <Link
              href="/"
              onClick={() => feedOnClick("global", "Global", "global")}
              className="btn-ghost btn w-full justify-start font-normal normal-case"
            >
              Global
            </Link>
          </li>
          <FeedList handleSelectFeed={feedOnClick} />
          {createPortal(
            <CreateFeedModal ref={createFeedModal} />,
            document.body
          )}
          <li className="w-full">
            <button
              onClick={() => createFeedModal.current?.show()}
              className="btn-ghost btn flex w-full justify-start gap-1 opacity-30 hover:opacity-100"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span className="text-xs">Create new Feed</span>
            </button>
          </li>
        </ul>
      </div>
    </SidebarWrapper>
  );
};
export default Sidebar;

// TODO: Move this to a custom hook or refactor
// const useSidebarToggle = () => {
//   const [isToggled, setIsToggled] = useState(false);
//   const [sidebarStyle, setSidebarStyle] = useState(
//     ["-translate-x-full"].join(" ")
//   );

//   const handleOnClick = () => {
//     setIsToggled(!isToggled);
//     console.log(isToggled);

//     if (isToggled) {
//       setSidebarStyle("transform-none translate-x-none drop-shadow-xl z-100");
//     } else {
//       setSidebarStyle("-translate-x-full");
//     }
//   };

//   return { sidebarStyle, handleOnClick };
// };

type SidebarWrapperProps = {
  children: React.ReactNode;
};

// Container
const SidebarWrapper = (props: SidebarWrapperProps) => {
  // const { sidebarStyle, handleOnClick } = useSidebarToggle();
  const [isToggled, setIsToggled] = useState(false);
  const [sidebarStyle, setSidebarStyle] = useState(
    ["-translate-x-full"].join(" ")
  );

  useEffect(() => {
    if (isToggled) {
      setSidebarStyle("transform-none translate-x-none drop-shadow-xl z-100");
    } else {
      setSidebarStyle("-translate-x-full");
    }
  }, [isToggled]);

  return (
    <>
      <aside
        className={`${sidebarStyle} fixed left-0 z-[200] flex h-full w-full max-w-xs transform flex-col gap-4
    overflow-y-auto bg-base-100 p-4 py-8 transition-all md:static md:transform-none md:drop-shadow-none `}
      >
        <div className="flex flex-col gap-4">{props.children}</div>
        {createPortal(
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsToggled(!isToggled);
            }}
            className="z-100 fixed left-0 top-0 mt-4 flex aspect-square scale-x-110 flex-col items-center justify-center rounded-r-lg border-2 border-base-200 bg-base-100 p-2 pl-3 text-2xl text-primary md:hidden"
          >
            <FontAwesomeIcon icon={faBars} />
          </div>,
          document.body
        )}
      </aside>
      {isToggled && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsToggled(!isToggled);
          }}
          className="fixed z-[100] h-screen w-screen overflow-scroll overscroll-none overscroll-y-none bg-black bg-opacity-30 lg:hidden lg:overflow-auto"
        >
          <div className="pointer-events-none h-full w-full"></div>
        </div>
      )}
    </>
  );
};

type FeedListProps = {
  handleSelectFeed: (id: string, name: string, ownerId: string) => void;
};

const FeedList = (props: FeedListProps) => {
  const { data, isLoading: postsLoading } = api.feeds.getUserFeeds.useQuery();
  const { handleSelectFeed } = props;

  if (postsLoading)
    return (
      <div className="flex w-full grow items-center px-2">
        <span className="loading loading-dots text-accent"></span>
      </div>
    );
  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      {data.map((feed) => {
        return (
          <li className="w-full" key={feed.id}>
            <Link
              href={`/`}
              onClick={() => handleSelectFeed(feed.id, feed.name, feed.ownerId)}
              className="btn-ghost btn w-full justify-start font-normal normal-case"
            >
              {feed.name}
            </Link>
          </li>
        );
      })}
    </>
  );
};

const SpaceList = () => {
  const { ctxUserId } = useContext(FeedContext);

  const { data, isLoading: postsLoading } =
    api.spaces.getSpacesByUserId.useQuery({
      ownerId: ctxUserId,
    });

  const createSpaceModal: React.RefObject<HTMLDialogElement> =
    React.useRef(null);

  if (postsLoading)
    return (
      <div className="flex w-full grow items-center px-2">
        <span className="loading loading-dots text-accent"></span>
      </div>
    );
  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      <ul className="flex flex-col gap-1 text-lg">
        {data.map((space) => {
          return (
            <li className="w-full" key={space.id}>
              <Link
                href={`/space/${space.id}`}
                className="btn-ghost btn w-full justify-start font-normal normal-case"
              >
                {space.name}
              </Link>
            </li>
          );
        })}
        {createPortal(
          <CreateSpaceModal ref={createSpaceModal} />,
          document.body
        )}
        <button
          onClick={() => createSpaceModal.current?.show()}
          className="btn-ghost btn flex w-full justify-start gap-1 opacity-30 hover:opacity-100"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span className="text-xs">Create new Space</span>
        </button>
      </ul>
    </>
  );
};
