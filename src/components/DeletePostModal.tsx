import type { ForwardedRef } from "react";
import { api } from "~/utils/api";
import React from "react";

const DeletePostModal = React.forwardRef(function DeletePostModal(
  props: { id: string },
  ref: ForwardedRef<HTMLDialogElement>
) {
  const ctx = api.useContext();

  const { mutate } = api.posts.deletePost.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacePostsById.invalidate();
      void ctx.feeds.getInfiniteFeedPostsById.invalidate();
    },

    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <dialog ref={ref} className="modal">
      <form method="dialog" className="modal-box flex flex-col  items-center">
        <h3 className="text-2xl font-bold text-error">Delete Post?</h3>
        <p className="pt-4 text-center text-lg">
          You might not be able to recover this again
        </p>
        <div className="modal-action flex gap-4">
          {/* if there is a button in form, it will close the modal */}
          <button
            onClick={() => mutate({ postId: props.id })}
            className="btn-error btn"
          >
            Delete
          </button>
          <button className="btn">Cancel</button>
        </div>
      </form>
    </dialog>
  );
});

export default DeletePostModal;
