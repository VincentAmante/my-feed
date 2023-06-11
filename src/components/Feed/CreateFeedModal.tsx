import { useAuth } from "@clerk/nextjs";
import { useState, useContext } from "react";
import { api } from "~/utils/api";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShield,
  faLock,
  faEye,
  faPlus,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import type { ForwardedRef } from "react";
import React from "react";
import AddIconWidget from "../CreateIcon";
import { useRef } from "react";
import { FeedContext } from "../Layouts";

type visibilityType = "public" | "private" | "obscure" | "protected";
const CreateFeedModal = React.forwardRef(function CreateFeedModal(
  props,
  ref: ForwardedRef<HTMLDialogElement>
) {
  const { addToast } = useContext(FeedContext);
  const ctx = api.useContext();
  const [isLoading, setIsLoading] = useState(false);

  const submitIconRef = useRef<HTMLButtonElement>(null);
  const submitFormRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [icon, setIcon] = useState<string>("");

  const { mutate: createFeed } = api.feeds.createFeed.useMutation({
    onSuccess: () => {
      addToast("Feed created successfully", "success");
      setIsLoading(false);
      void ctx.feeds.getUserFeeds.invalidate();
    },
  });

  function submitForm(imgSrc: string | null) {
    if (formRef.current) {
      console.log("formRef.current", formRef.current);
      const formData = new FormData(formRef.current);
      const name = formData.get("name") as string;
      // TODO: Improve validation
      if (formData.get("name") === "") {
        return;
      }
      const visibility = formData.get("visibility") as visibilityType;

      setIsLoading(true);
      void createFeed({
        name,
        visibility,
        icon: imgSrc,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      (window as any).create_feed_ref.close();
    }
  }

  function handleSubmit(url: string | null) {
    // Wait for image to upload then run createSpaceHandle
    console.log("url", url);
    if (url) {
      submitForm(url);
    } else {
      submitForm(null);
    }
  }

  function triggerUpload(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    event.preventDefault();
    submitIconRef.current?.click();
  }

  return (
    <dialog id="create_feed_ref" ref={ref} className="modal fixed">
      <div className="modal-box flex flex-col">
        <div className="my-2 flex w-full max-w-xs justify-center gap-2 self-center">
          <AddIconWidget
            onUpload={handleSubmit}
            submitRef={submitIconRef}
            imageUrl={null}
          />
        </div>
        <form
          method="dialog"
          ref={formRef}
          onSubmit={() => handleSubmit(null)}
          className="flex flex-col items-center gap-2"
        >
          <label className="text-2xl font-bold">Create a Feed</label>
          <NameField />
          <SelectVisibility />
          <TriggerButton isLoading={isLoading} triggerUpload={triggerUpload} />
          <button className="hidden" ref={submitFormRef}>
            Create Feed
          </button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
});

export default CreateFeedModal;

// Form Fields

type TriggerButtonProps = {
  isLoading: boolean;
  triggerUpload: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
};
const TriggerButton = (props: TriggerButtonProps) => {
  const { isLoading, triggerUpload } = props;
  return (
    <button onClick={triggerUpload} className="btn-primary btn">
      {isLoading ? (
        <span className="loading  loading-dots text-accent"></span>
      ) : (
        <>
          <FontAwesomeIcon icon={faPlus} />
          <span>Create Feed</span>
        </>
      )}
    </button>
  );
};

const NameField = () => {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">Name</span>
      </label>
      <input
        type="text"
        max={24}
        name="name"
        placeholder="My Feed"
        className="input-bordered input w-full max-w-xs"
      />
    </div>
  );
};

const SelectVisibility = () => {
  const options = ["obscure", "public", "protected", "private"];
  const [selected, setSelected] = useState(options[0]);

  const description = useMemo(() => {
    if (selected === "public") {
      return (
        <>
          <FontAwesomeIcon icon={faEye} className="mr-2" />
          <p className="normal-case">Posts here are visible on search</p>
        </>
      );
    } else if (selected === "obscure") {
      return (
        <>
          <FontAwesomeIcon icon={faEyeSlash} className="mr-2" />
          <p className="normal-case">Public, but invisible to search</p>
        </>
      );
    } else if (selected === "private") {
      return (
        <>
          <FontAwesomeIcon icon={faLock} className="mr-2" />
          <p className="normal-case">Only you can see this Feed</p>
        </>
      );
    } else if (selected === "protected") {
      return (
        <>
          <FontAwesomeIcon icon={faLock} className="mr-2" />
          <p className="normal-case">
            Only you and your friends can see this feed
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
          onChange={(e) => setSelected(e.target.value)}
        >
          <option disabled>Who can see this feed?</option>
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
