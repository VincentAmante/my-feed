import { useMemo, useState } from "react";
import type { Comment as TypeComment } from "@prisma/client";
import Image from "next/image";

import {
  faTrash,
  faEllipsisVertical,
  faPen,
} from "@fortawesome/free-solid-svg-icons";

import { api } from "~/utils/api";

// For relative time
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
dayjs.extend(relativeTime);

type Author = {
  id: string;
  username: string | null;
  profileImageUrl: string;
  firstName: string | null;
  lastName: string | null;
};
export type CommentWithUser = TypeComment & {
  author: Author | undefined;
};

const Comment = (
  props: CommentWithUser & {
    userId: string;
  }
) => {
  const { author, content, userId, createdAt, updatedAt } = props;
  const ctx = api.useContext();
  const { mutate: deleteComment } = api.posts.deleteComment.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacePostsById.invalidate();
      void ctx.feeds.getInfiniteFeedPostsById.invalidate();
    },
  });
  const [toggleEdit, setToggleEdit] = useState(false);
  const [editedContent, setEditedContent] = useState(content || "");

  const { mutate: editComment } = api.posts.updateComment.useMutation({
    onSuccess: () => {
      void ctx.spaces.getSpacePostsById.invalidate();
      void ctx.feeds.getInfiniteFeedPostsById.invalidate();
    },
  });

  const nameDisplay = useMemo(() => {
    if (!author) return `@unknown`;
    if (userId === author.id) return <span className="italic">You</span>;
    else if (author?.username) return `@${author.username}`;
  }, [author, userId]);

  const timeStamp = useMemo(() => {
    // const lastWeek: Date = new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000);
    // const isAWeekAgo = dayjs(createdAt).isAfter(lastWeek)
    if (!createdAt) return <></>;
    if (updatedAt.getTime() !== createdAt.getTime())
      return <>Edited: {dayjs(updatedAt).fromNow()}</>;
    else return <>· {dayjs(createdAt).fromNow()}</>;
  }, [createdAt, updatedAt]);

  if (!author) return <></>;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex w-full gap-3">
          <div className="avatar flex items-start">
            <div className="w-8 rounded-full">
              <Image
                alt="Profile Picture"
                width={64}
                height={64}
                className="rounded-full"
                src={author.profileImageUrl}
              ></Image>
            </div>
          </div>
          <div className="flex w-full flex-col items-start">
            <div className="flex items-center gap-2">
              <p className="flex">{nameDisplay}</p>
              <p className="text-xs italic opacity-50">{timeStamp}</p>
            </div>
            {toggleEdit && (
              <div className="flex w-full flex-col gap-2">
                <textarea
                  className="input-bordered input h-fit w-full resize-none p-2"
                  defaultValue={content || ""}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setToggleEdit(false);
                    if (e.key === "Enter") {
                      if (editedContent === content) {
                        setToggleEdit(false);
                        return;
                      }
                      void editComment({
                        commentId: props.id,
                        content: e.currentTarget.value,
                      });
                      setToggleEdit(false);
                    }
                  }}
                />
                <div className="flex w-full justify-end gap-1">
                  <button
                    onClick={() => setToggleEdit(false)}
                    className="btn-outline btn-xs btn"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={(e) => {
                      void editComment({
                        commentId: props.id,
                        content: e.currentTarget.value,
                      });
                      setToggleEdit(false);
                    }}
                    className="btn-info btn-xs btn"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
            {!toggleEdit && (
              <div className="flex items-center py-0 align-middle text-sm">
                {content}
              </div>
            )}
          </div>
        </div>
        <div className="relative px-0">
          {userId === author.id && (
            <div className="dropdown-end dropdown-left dropdown lg:dropdown-right ">
              <label
                tabIndex={0}
                className="btn-ghost btn-sm btn-circle btn m-1"
              >
                <FontAwesomeIcon icon={faEllipsisVertical}></FontAwesomeIcon>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu rounded-box w-min bg-neutral p-2 shadow "
              >
                <li className="flex items-center justify-center">
                  <button
                    onClick={() => {
                      void deleteComment({ commentId: props.id });
                    }}
                    className="btn-ghost btn-sm btn w-full text-error"
                  >
                    <span>Delete</span>
                    <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
                  </button>
                  <button
                    onClick={() => setToggleEdit(true)}
                    className="btn-ghost btn-sm btn w-full text-white"
                  >
                    <span>Edit</span>
                    <FontAwesomeIcon icon={faPen}></FontAwesomeIcon>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Comment;
