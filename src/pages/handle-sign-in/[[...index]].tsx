import { User } from "@clerk/nextjs/server";
import { useEffect, useState } from "react";
import { api } from '~/utils/api'
import { useAuth, useUser } from "@clerk/nextjs";
import { SignedIn } from "@clerk/nextjs";
import { useRouter } from "next/router";

const PostSignUp = () => {
    const router = useRouter()
    const { userId } = useAuth()
    const { user: clerkUser } = useUser()

    console.log(clerkUser)
    console.log(userId)
    const user = api.users.initUser.useQuery({
        clerkId: userId || "",
        firstName: clerkUser?.firstName || "",
        lastName: clerkUser?.lastName || "",
        username: clerkUser?.username || "",
    })

    useEffect(() => {
        if (user.data && userId !== undefined || userId !== "") {
            console.log("pushing to feed")
            void router.push('/feed')
        }
    }, [user, router, userId])

    return (
        <main className="flex flex-col items-center justify-center w-screen h-screen text-white">
            <h1 className="text-6xl">
                <span className="loading loading-bars loading-lg text-primary"></span>
            </h1>
        </main>
    )
}

export default PostSignUp