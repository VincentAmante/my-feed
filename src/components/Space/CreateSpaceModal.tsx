import { useAuth } from "@clerk/nextjs";
import {useState } from "react";
import { api } from "~/utils/api";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShield, faLock, faEye, faPlus, } from "@fortawesome/free-solid-svg-icons";
import type { ForwardedRef } from "react";
import React from "react";

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

  function createSpaceHandler(e: React.FormEvent<HTMLFormElement>) {
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
      <form method="dialog" onSubmit={createSpaceHandler} className="modal-box flex flex-col items-center gap-2">
        <label className="text-2xl font-bold">Create a Space</label>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input type="text" max={24} name="name" placeholder="My Space" className="input input-bordered w-full max-w-xs" />
        </div>
        <SelectVisibility />
        <button className="btn btn-primary">
          {isLoading ?
            <span className="loading loading-dots text-accent"></span>
            : <>
              <FontAwesomeIcon icon={faPlus} />
              <span>Create Space</span>
            </>}
        </button>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
});

export default CreateSpaceModal

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