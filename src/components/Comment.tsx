import { useMemo, useState } from "react";
import type { Comment as TypeComment } from "@prisma/client";
import Image from "next/image";

import { faTrash, faEllipsisVertical, faPen } from "@fortawesome/free-solid-svg-icons";

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
}
export type CommentWithUser = TypeComment & {
    author: Author | undefined;
};


const Comment = (props: CommentWithUser & {
    userId: string;
}) => {

    const { author, content, userId, createdAt, updatedAt } = props;
    const ctx = api.useContext();
    const { mutate: deleteComment } = api.posts.deleteComment.useMutation({
        onSuccess: () => {
            void ctx.spaces.getSpacePostsById.invalidate();
            void ctx.feeds.getInfiniteFeedPostsById.invalidate();
        }
    });
    const [toggleEdit, setToggleEdit] = useState(false);
    const [editedContent, setEditedContent] = useState(content || "");

    const { mutate: editComment } = api.posts.updateComment.useMutation({
        onSuccess: () => {
            void ctx.spaces.getSpacePostsById.invalidate();
            void ctx.feeds.getInfiniteFeedPostsById.invalidate();
        }
    });

    const nameDisplay = useMemo(() => {
        if (!author) return `@unknown`;
        if (userId === author.id) return <span className="italic">You</span>;
        else if (author?.username) return `@${author.username}`;
    }, [author, userId])

    
    const timeStamp = useMemo(() => {
        if (!createdAt) return <></>;
        if (updatedAt) return <>Edited: {dayjs(updatedAt).fromNow()}</>;
        else return <>· {dayjs(createdAt).fromNow()}</>;
    }, [createdAt, updatedAt])

    if (!author) return <></>


    return <>
        <div className="flex justify-between items-center">
            <div className="flex gap-3 w-full">
                <div className="avatar flex items-start">
                    <div className="w-8 rounded-full">
                        <Image
                            alt="Profile Picture"
                            width={64}
                            height={64}
                            className="rounded-full"
                            src={author.profileImageUrl}>
                        </Image>
                    </div>
                </div>
                <div className="flex flex-col items-start w-full">
                    <div className="flex gap-2 items-center">
                        <p className="flex">{nameDisplay}</p>
                        <p className="text-xs italic opacity-50">{timeStamp}</p>
                    </div>
                    {
                        toggleEdit &&
                        <div className="flex flex-col gap-2 w-full">
                                <textarea
                                    className="input input-bordered p-2 h-fit resize-none w-full"
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
                                            void editComment({ commentId: props.id, content: e.currentTarget.value });
                                            setToggleEdit(false);
                                        }
                                    }}
                                />
                            <div className="flex gap-1 w-full justify-end">
                                    <button
                                        onClick={
                                            () => setToggleEdit(false)
                                        }
                                        className="btn btn-outline btn-xs">Cancel</button>
                                    <button
                                        onClick={(e) => {
                                            void editComment({ commentId: props.id, content: e.currentTarget.value });
                                            setToggleEdit(false);
                                        }}
                                        className="btn btn-info btn-xs">
                                        Apply
                                    </button>
                            </div>
                        </div>
                    }
                    {
                        !toggleEdit &&
                        <div className="align-middle py-0 flex items-center text-sm">
                            {content}
                        </div>
                    }
                </div>
            </div>
            <div className="px-0 relative">
                {
                    userId === author.id
                    && (
                        <div className="dropdown dropdown-left lg:dropdown-right dropdown-end ">
                            <label tabIndex={0} className="btn m-1 btn-circle btn-ghost btn-sm">
                                <FontAwesomeIcon icon={faEllipsisVertical}></FontAwesomeIcon>
                            </label>
                            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-neutral rounded-box w-min ">
                                <li className="flex items-center justify-center">
                                    <button
                                        onClick={() => {
                                            void deleteComment({ commentId: props.id });
                                        }}
                                        className="btn btn-ghost text-error btn-sm w-full"
                                    >
                                        <span>Delete</span>
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                        ></FontAwesomeIcon>
                                    </button>
                                    <button
                                        onClick={() => setToggleEdit(true)}
                                        className="btn btn-ghost text-white btn-sm w-full"
                                    >
                                        <span>Edit</span>
                                        <FontAwesomeIcon
                                            icon={faPen}
                                        ></FontAwesomeIcon>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )
                }
            </div>
        </div>
    </>
}

export default Comment;