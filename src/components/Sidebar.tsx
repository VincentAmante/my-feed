import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useState } from "react";
// import SwitchTheme from "~/components/SwitchTheme";

interface Props {
  handleSelectFeed?: (feed: string) => void;
}

const defaultProps = {
  handleSelectFeed: (feed: string) => {
    return feed;
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

  const feedOnClick = (feedId: string) => {
    props.handleSelectFeed(feedId);
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
            <li
              onClick={() => feedOnClick("646b7816ff0ae2653aad9f27")}
              className="btn-ghost btn justify-start font-normal normal-case"
            >
              Announcements
            </li>
          </ul>
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
export default Sidebar;
