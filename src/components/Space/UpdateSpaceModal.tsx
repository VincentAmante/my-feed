import { useAuth } from "@clerk/nextjs";
import {useState } from "react";
import { api } from "~/utils/api";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShield, faLock, faEye, faPlus, faPenToSquare, faTrash, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import type { ForwardedRef } from "react";
import React from "react";
import { FeedContext } from "../Layouts";

type visibilityType = "public" | "private" | "obscure" | "protected";

type UpdateSpaceModal = {
  spaceId: string;
}
const UpdateSpaceModal = React.forwardRef(function CreateSpaceModal(props: UpdateSpaceModal, ref: ForwardedRef<HTMLDialogElement>) {
  const { userId } = useAuth();

  const { setCtxFeedName } = React.useContext(FeedContext);
  

  const ctx = api.useContext();

  const { data: spaceData, isLoading: spaceLoading } = api.spaces.getSpaceById.useQuery({
    spaceId: props.spaceId
  });

  const [name, setName] = useState(spaceData?.name || "");
  const [visibility, setVisibility] = useState<visibilityType>(spaceData?.visibility as visibilityType || "public");

  useMemo(() => {
    setName(spaceData?.name || "");
    setVisibility(spaceData?.visibility as visibilityType || "public");
  }, [spaceData])


  const [isLoading, setIsLoading] = useState(false);

  const {mutate: updateSpace} = api.spaces.updateSpace.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacesByUserId.invalidate();
    }
  });
  

  function updateSpaceHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) return;
    setIsLoading(true);
    void updateSpace({
        spaceId: props.spaceId,
        name,
        visibility
      }) 
    setIsLoading(false);

    setCtxFeedName(name);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    (window as any).update_space_ref.close();
    }

  const [deleteToggled, setDeleteToggled] = useState(false);
  function toggleDelete(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();
    setDeleteToggled(!deleteToggled);
  }
  
  useMemo(() => {
    console.log('created')
  }, [])

  
  return (
    <dialog id="update_space_ref" ref={ref} className="modal absolute">
      <form method="dialog" onSubmit={updateSpaceHandler} className="modal-box flex flex-col items-center gap-2">
        <label className="text-2xl font-bold">Update a Space</label>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            type="text" max={24}
            value={name}
            onChange={(e) => setName(e.target.value)}
            name="name"
            placeholder="My Space" className="input input-bordered w-full max-w-xs" />
        </div>
        <SelectVisibility selected={visibility} setSelected={setVisibility} />
        <button className="btn btn-primary">
          {isLoading ?
            <span className="loading loading-dots text-accent"></span>
            : <>
              <FontAwesomeIcon icon={faPenToSquare} />
              <span>Update Space</span>
            </>}
        </button>
        <div className="divider divider-error text-error font-bold">Danger Zone</div>
        {
          deleteToggled ? (
            <DeleteSpace spaceId={props.spaceId} toggleDelete={toggleDelete} />) :
            (<button className="btn btn-error" onClick={toggleDelete}>
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete Space</span>
            </button>)
        }
      </form>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setDeleteToggled(false)}>close</button>
      </form>
    </dialog>
  )
});

export default UpdateSpaceModal

type SelectVisibilityProps = {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<visibilityType>>;
}

const SelectVisibility = (props: SelectVisibilityProps) => {

  const { selected, setSelected } = props;
  const options = ['public', 'obscure', 'protected', 'private'];

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
        <p className="normal-case">Only you and your friends can see this space (Unimplemented)</p>
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
        onChange={(e) => setSelected(e.target.value as visibilityType)}
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

type DeleteSpaceProps = {
  spaceId: string;
  toggleDelete: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}
const DeleteSpace = (props: DeleteSpaceProps) => {
  const { spaceId, toggleDelete } = props;
  const ctx = api.useContext();

  const { mutate: deleteSpace } = api.spaces.deleteSpace.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacesByUserId.invalidate();
    }
  });

  return <>
    <div className="flex flex-col items-center justify-center">
      <FontAwesomeIcon icon={faExclamationTriangle} className="text-error text-6xl" />
      <p className="max-w-sm text-center text-error">Are you sure? All your posts in this Space will be lost forever</p>
      <div className="flex gap-6 py-2">
      <button className="btn btn-error" onClick={() => {
        void deleteSpace({ spaceId })
      }
      }>
          <FontAwesomeIcon icon={faTrash} />
          <span>Delete Forever</span>
        </button>
        <button className="btn btn-outline" onClick={toggleDelete}>
        Cancel
      </button>
      </div>
    </div>
  </>
}
