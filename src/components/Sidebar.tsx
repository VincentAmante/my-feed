import { useAuth } from "@clerk/nextjs";
import { useContext, useState } from "react";
import { api } from "~/utils/api";
import SwitchTheme from "~/components/SwitchTheme";
import UserDisplay from "~/components/UserDisplay";
import Feed from "~/pages/feed";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faShield, faLock, faEye } from "@fortawesome/free-solid-svg-icons";
import { FeedContext } from "./Layouts";
import Link from "next/link";
import type { ForwardedRef } from "react";
import React from "react";
import { createPortal } from "react-dom";
import { set } from "zod";


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
    const spaceOnClick = (spaceId: string, name: string, ownerId: string) => {
      props.handleSelectFeed(spaceId, "space", name, ownerId);
    };
    return <SpaceList onClick={spaceOnClick} />;
  }, [props]);

  return (
    <SidebarWrapper>
      <div>
        <UserDisplay />
      </div>
      <div className=" rounded-lg p-2 font-light">
        <div className="px-3 py-2 text-xl">Your Spaces</div>
        {spaceListElement}
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


type SpaceListProp = {
  onClick: (spaceId: string, name: string, ownerId: string) => void;
};
const SpaceList = ({ onClick }: SpaceListProp) => {
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
      <ul className="flex flex-col gap-2 py-2 text-lg">
        {data.map((space) => {
          return (
            <li className="w-full"
              key={space.id}
              onClick={() =>
                onClick(space.id, space.name || "Space", space.ownerId || "")
              }
            >
              <Link
                href="/feed"
                className="w-full btn justify-start font-normal normal-case">
                {space.name}
              </Link>
            </li>
          );
        })}
        {createPortal(
          <CreateSpaceModal ref={createSpaceModal} />,
          document.body
        )}
        <button onClick={() => createSpaceModal.current?.show()} className="btn btn-ghost btn-sm w-full">
          Create a Space
        </button>
      </ul>
    </>
  );
};

type visibilityType = "public" | "private" | "obscure" | "protected";
const CreateSpaceModal = React.forwardRef(function CreateSpaceModal(props, ref: ForwardedRef<HTMLDialogElement>) {
  const { userId } = useAuth();

  const ctx = api.useContext();

  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: createSpace } = api.spaces.createSpace.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacesByUserId.invalidate({ ownerId: userId || "" });
    }
  })
    ;

  function createSpaceHandler (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const visibility = formData.get("visibility") as visibilityType;

    setIsLoading(true);

    void createSpace({
      name, visibility
    }).then((res) => {
      console.log(res);
      setIsLoading(false);
    }).catch((err) => {
      console.log(err);
      setIsLoading(false);
    });

    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    (window as any).create_space_ref.close();
  }

  useMemo(() => {
    console.log('created')
  }, [])

  return (
    <dialog id="create_space_ref" ref={ref} className="modal absolute">
      <form method="dialog" onSubmit={createSpaceHandler}  className="modal-box flex flex-col items-center">
        <label className="text-2xl font-bold">Create a Space</label>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input type="text" name="name" placeholder="My Space" className="input input-bordered w-full max-w-xs" />
        </div>
        <SelectVisibility />
        <button>
          {isLoading ? <span className="loading loading-dots text-accent"></span> : 'Create'}
        </button>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
});

const SelectVisibility = () => {
  const options = ['public', 'obscure', 'protected', 'private'];
  

  const [selected, setSelected] = useState(options[0]);

  const description = useMemo(() => {
    if (selected === 'public') {
      return <>
        <FontAwesomeIcon icon={faEye} className="mr-2" />
        <p className="normal-case">Posts here are visible on global</p>
      </>
    } else if (selected === 'obscure') {
      return <>
        <FontAwesomeIcon icon={faShield} className="mr-2" />
        <p className="normal-case">Public, but  invisible to global</p> 
      </>
    } else if (selected === 'private') {
      return <>
        <FontAwesomeIcon icon={faLock} className="mr-2" />
        <p className="normal-case">Only you can see this space</p>
      </>
    } else if (selected === 'protected') {
      return <>
        <FontAwesomeIcon icon={faLock} className="mr-2" />
        <p className="normal-case">Only you and your followers can see this space (Unimplemented)</p>
      </> 
    }
  }, [selected])

  return <>
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">Visiblity</span>
      </label>
      <select
        className="select select-bordered w-full max-w-xs capitalize"
        value={selected}
        name="visibility"
        onChange={(e) => setSelected(e.target.value)}
      >  
        <option disabled>Who can see your space?</option>
        {options.map((option) => {
          return <option className="capitalize" value={option} key={option}>{option}</option>
        }
        )}
      </select>
      <label className="label">
        <span className="label-text capitalize flex gap-1 items-center text-md">
          {description}
        </span>
      </label>
    </div>
  </>
}