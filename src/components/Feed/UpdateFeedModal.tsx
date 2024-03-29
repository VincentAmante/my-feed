import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UpdateIconWidget from "../UpdateIcon";
import {
  faShield,
  faLock,
  faEye,
  faPlus,
  faPenToSquare,
  faTrash,
  faExclamationTriangle,
  faMinus,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import type { ForwardedRef } from "react";
import React from "react";
import { FeedContext } from "../Layouts";
import { LoadingSkeleton, ErrorSkeleton } from "../SkeletonViews/FeedSkeletons";
import Image from "next/image";

type visibilityType = "public" | "private" | "obscure" | "protected";

type UpdateSpaceModal = {
  feedId: string;
};
const UpdateFeedModal = React.forwardRef(function CreateFeedModal(
  props: UpdateSpaceModal,
  ref: ForwardedRef<HTMLDialogElement>
) {
  const { userId } = useAuth();
  const { setCtxFeedName, addToast } = React.useContext(FeedContext);
  const ctx = api.useContext();

  const { data: feedData, isLoading: feedLoading } =
    api.feeds.getFeedById.useQuery({
      feedId: props.feedId,
    });

  const [name, setName] = useState(feedData?.name || "");
  const [visibility, setVisibility] = useState<visibilityType>(
    (feedData?.visibility as visibilityType) || "public"
  );

  useMemo(() => {
    setName(feedData?.name || "");
    setVisibility((feedData?.visibility as visibilityType) || "public");
  }, [feedData]);

  const [isLoading, setIsLoading] = useState(false);

  const { mutate: updateFeed } = api.feeds.updateFeed.useMutation({
    onSuccess: () => {
      void ctx.feeds.getUserFeeds.invalidate();
      void ctx.feeds.getProfileFeeds.invalidate({
        userId: userId as string,
      });
    },
  });

  function updateSpaceHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) return;
    setIsLoading(true);
    void updateFeed({
      feedId: props.feedId,
      name,
      visibility,
    });
    setIsLoading(false);
    setCtxFeedName(name);
    addToast("Feed updated successfully", "success");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    (window as any).update_space_ref.close();
  }

  const [deleteToggled, setDeleteToggled] = useState(false);
  function toggleDelete(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    event.preventDefault();
    setDeleteToggled(!deleteToggled);
    addToast("Feed deleted", "info");
  }

  const [tab, setTab] = useState<"details" | "feedSelect">("details");

  return (
    <dialog
      id="update_space_ref"
      ref={ref}
      className="modal absolute flex flex-col items-center justify-center"
    >
      <div className="tabs w-full max-w-lg">
        <div
          className={`tab-lifted tab rounded-r-none ${
            tab === "details" ? "tab-active" : "bg-base-200 bg-opacity-50"
          }`}
          onClick={() => setTab("details")}
        >
          Update Details
        </div>
        <div
          className={`tab-lifted tab rounded-l-none ${
            tab === "feedSelect" ? "tab-active" : "bg-base-200 bg-opacity-50"
          }`}
          onClick={() => setTab("feedSelect")}
        >
          Manage Feed
        </div>
      </div>
      <div className="modal-box rounded-t-none">
        {tab === "details" && (
          <>
            <form
              method="dialog"
              onSubmit={updateSpaceHandler}
              className="flex flex-col items-center gap-2"
            >
              <label className="text-2xl font-bold">Update a Feed</label>
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  max={24}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  name="name"
                  placeholder="My Space"
                  className="input-bordered input w-full max-w-xs"
                />
              </div>
              <SelectVisibility
                selected={visibility}
                setSelected={setVisibility}
              />
              <button className="btn-primary btn">
                {isLoading ? (
                  <span className="loading loading-dots"></span>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPenToSquare} />
                    <span>Update Feed</span>
                  </>
                )}
              </button>
              <div className="divider-error divider font-bold text-error">
                Danger Zone
              </div>
              {deleteToggled ? (
                <DeleteFeed feedId={props.feedId} toggleDelete={toggleDelete} />
              ) : (
                <button className="btn-error btn" onClick={toggleDelete}>
                  <FontAwesomeIcon icon={faTrash} />
                  <span>Delete Space</span>
                </button>
              )}
            </form>
          </>
        )}
        {tab === "feedSelect" && <FeedSpaceManager feedId={props.feedId} />}
      </div>
      <form method="dialog" className="modal-backdrop absolute h-full w-full">
        <button onClick={() => setDeleteToggled(false)}>close</button>
      </form>
    </dialog>
  );
});

export default UpdateFeedModal;

type SelectVisibilityProps = {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<visibilityType>>;
};

const FeedSpaceManager = (props: { feedId: string }) => {
  const { feedId } = props;
  const ctx = api.useContext();

  const { data: spacesFollowed, isLoading: spacesFollowedLoading } =
    api.feeds.getSpacesByFeedId.useQuery({
      feedId,
    });

  const { data: spacesNotFollowed, isLoading: spacesNotFollowedLoading } =
    api.feeds.getUnfollowedSpaces.useQuery({
      feedId,
    });

  const {
    mutate: getFilteredUnfollowedSpaces,
    data: filteredUnfollowed,
    isLoading: filterIsLoading,
  } = api.feeds.getFilteredUnfollowedSpaces.useMutation({
    onSuccess: () => {
      void ctx.feeds.getUnfollowedSpaces.refetch();
    },
  });
  const [search, setSearch] = useState("");
  useEffect(() => {
    void getFilteredUnfollowedSpaces({
      feedId,
      filter: search,
    });
  }, [feedId, getFilteredUnfollowedSpaces, search]);

  useMemo(() => {
    getFilteredUnfollowedSpaces({
      feedId,
      filter: "",
    });
  }, []);

  const { mutate: addFeedToSpace } = api.feeds.addSpaceToFeed.useMutation({
    onSuccess: () => {
      void ctx.feeds.getUnfollowedSpaces.refetch();
      void ctx.feeds.getSpacesByFeedId.refetch();
      getFilteredUnfollowedSpaces({
        feedId,
        filter: search,
      });
      void ctx.feeds.getInfiniteFeedPostsById.refetch();
    },
  });

  const { mutate: removeFeedFromSpace } =
    api.feeds.removeSpaceFromFeed.useMutation({
      onSuccess: () => {
        void ctx.feeds.getSpacesByFeedId.refetch();
        void ctx.feeds.getUnfollowedSpaces.refetch();
        void ctx.feeds.getInfiniteFeedPostsById.refetch();
      },
    });

  const [followedSpaceToggled, setFollowedSpaceToggled] = useState(true);
  const [unfollowedSpaceToggled, setUnfollowedSpaceToggled] = useState(true);

  if (spacesFollowedLoading || spacesNotFollowedLoading)
    return <LoadingSkeleton />;
  if (!spacesFollowed || !spacesNotFollowed) return <ErrorSkeleton />;

  return (
    <>
      <div className="flex flex-col gap-4 px-4">
        <div className="collapse-arrow collapse bg-base-200">
          <input
            type="checkbox"
            checked={followedSpaceToggled}
            onChange={() => setFollowedSpaceToggled(!followedSpaceToggled)}
          />
          <h2 className="collapse-title">Followed Spaces</h2>
          <div className="collapse-content flex flex-col gap-2">
            {spacesFollowed.map((space) => {
              return (
                <button
                  onClick={() => {
                    void removeFeedFromSpace({
                      feedId,
                      spaceId: space.id,
                    });
                  }}
                  key={space.id}
                  className="btn-ghost btn-sm btn flex w-full flex-row items-center justify-between font-light normal-case"
                >
                  <div className="flex items-center gap-2">
                    <FeedIcon icon={space.icon} />
                    <p>{space.name}</p>
                  </div>
                  <FontAwesomeIcon icon={faMinus} />
                </button>
              );
            })}
          </div>
        </div>
        <div className="collapse-arrow  collapse bg-base-200">
          <input
            type="checkbox"
            checked={unfollowedSpaceToggled}
            onChange={() => setUnfollowedSpaceToggled(!unfollowedSpaceToggled)}
          />
          <h2 className="collapse-title">
            <span>Suggested Spaces</span>
          </h2>
          <div className="collapse-content flex flex-col gap-2">
            <input
              type="text"
              className="input-bordered input input-md"
              placeholder="Search Spaces"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filteredUnfollowed &&
              filteredUnfollowed.map((space) => {
                return (
                  <button
                    key={space.id}
                    onClick={() => {
                      void addFeedToSpace({
                        feedId,
                        spaceId: space.id,
                      });
                    }}
                    className="btn-ghost btn-sm btn flex w-full flex-row items-center justify-between font-light normal-case"
                  >
                    <div className="flex items-center gap-2">
                      <FeedIcon icon={space.icon} />
                      <p>{space.name}</p>
                    </div>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                );
              })}
            {filterIsLoading && (
              <div className="flex w-full flex-col items-center justify-center gap-2">
                <div className="loading-secondary loading flex items-center"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

type FeedIconProps = {
  icon: string | null;
};

const FeedIcon = (props: FeedIconProps) => {
  const { icon } = props;

  return (
    <>
      {icon && (
        <div className="avatar rounded-full">
          <div className="w-6 lg:w-6">
            <Image
              className="rounded-lg"
              src={icon}
              alt="Avatar"
              width={100}
              height={100}
            />
          </div>
        </div>
      )}
      {!icon && (
        <div className="placeholder avatar aspect-square rounded-full">
          <div className="w-6 lg:w-6">
            {
              <FontAwesomeIcon
                icon={faHashtag}
                className="text-xl text-base-content opacity-20"
              />
            }
          </div>
        </div>
      )}
    </>
  );
};

const SelectVisibility = (props: SelectVisibilityProps) => {
  const { selected, setSelected } = props;
  const options = ["public", "obscure", "protected", "private"];

  const description = useMemo(() => {
    if (selected === "public") {
      return (
        <>
          <FontAwesomeIcon icon={faEye} className="mr-2" />
          <p className="normal-case">Posts here are visible on global</p>
        </>
      );
    } else if (selected === "obscure") {
      return (
        <>
          <FontAwesomeIcon icon={faShield} className="mr-2" />
          <p className="normal-case">Public, but invisible to global</p>
        </>
      );
    } else if (selected === "private") {
      return (
        <>
          <FontAwesomeIcon icon={faLock} className="mr-2" />
          <p className="normal-case">Only you can see this space</p>
        </>
      );
    } else if (selected === "protected") {
      return (
        <>
          <FontAwesomeIcon icon={faLock} className="mr-2" />
          <p className="normal-case">
            Only you and your friends can see this space (Unimplemented)
          </p>
        </>
      );
    }
  }, [selected]);

  return (
    <>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Visiblity</span>
        </label>
        <select
          className="select-bordered select w-full max-w-xs capitalize"
          value={selected}
          name="visibility"
          onChange={(e) => setSelected(e.target.value as visibilityType)}
        >
          <option disabled>Who can see your space?</option>
          {options.map((option) => {
            return (
              <option className="capitalize" value={option} key={option}>
                {option}
              </option>
            );
          })}
        </select>
        <label className="label">
          <span className="text-md label-text flex items-center gap-1 capitalize">
            {description}
          </span>
        </label>
      </div>
    </>
  );
};

type DeleteFeedProps = {
  feedId: string;
  toggleDelete: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
};
const DeleteFeed = (props: DeleteFeedProps) => {
  const { feedId, toggleDelete } = props;
  const ctx = api.useContext();

  const { mutate: deleteFeed } = api.feeds.deleteFeed.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacesByUserId.invalidate();
    },
  });

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-6xl text-error"
        />
        <p className="max-w-sm text-center text-error">
          Delete Feed? It won&apos;t delete any posts within
        </p>
        <div className="flex gap-6 py-2">
          <button
            className="btn-error btn"
            onClick={() => {
              void deleteFeed({ feedId });
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </button>
          <button className="btn-outline btn" onClick={toggleDelete}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};
