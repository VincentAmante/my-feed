import { useMemo, useState } from "react";
import type { Comment as TypeComment } from "@prisma/client";
import Image from "next/image";

import { faTrash } from "@fortawesome/free-solid-svg-icons";

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
    const { author, content, userId, createdAt } = props;

    const ctx = api.useContext();

    const { mutate: deleteComment } = api.posts.deleteComment.useMutation({
        onSuccess: () => {
            void ctx.spaces.getSpacePostsById.invalidate();
            void ctx.feeds.getFeedPostsById.invalidate();
        }
    });


    const nameDisplay = useMemo(() => {
        if (!author) return `@unknown`;

        if (userId === author.id) return <span className="italic">You</span>;
        else if (author?.username) return `@${author.username}`;
    }, [author, userId])
    if (!author) return <></>

    return <>
        <div className="flex justify-between items-center">
            <div className="flex gap-2">
                <div className="avatar flex items-center">
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
                <div className="flex flex-col">
                    <div className="flex gap-2 items-center">
                        <p className="flex">{nameDisplay}</p>
                        <p className="text-xs italic opacity-50">{`· ${dayjs(createdAt).fromNow()}`}</p>
                    </div>
                    <div className="align-middle py-0 flex items-center text-sm">
                        {content}
                    </div>
                </div>
            </div>
            <div className="px-0">
                {
                    userId === author.id 
                    && (
                        <button 
                    onClick={() => {
                        void deleteComment({ commentId: props.id });
                    }}
                    className="btn btn-ghost btn-circle text-error btn-sm"
                >
                    
                <FontAwesomeIcon
                    icon={faTrash}
                ></FontAwesomeIcon>
                </button>
                    )
                }
            </div>
        </div>
    </>
}

export default Comment;