import { User } from "@clerk/nextjs/server";
import { useEffect, useState } from "react";
import { api } from '~/utils/api'
import { useAuth, useUser } from "@clerk/nextjs";
import { SignedIn } from "@clerk/nextjs";
import { useRouter } from "next/router";

const PostSignUp = () => {
    const router = useRouter()

    const { userId } = useAuth()

    const user = api.users.initUser.useQuery({
        clerkId: userId || ""
    })

    useEffect(() => {
        if (user){
            void router.push('/feed')
        }
    }, [user, router])

    return (
        <main className="flex flex-col items-center justify-center w-screen h-screen bg-slate-900">
            <h1 className="text-4xl">Initialising... your account please wait</h1>
        </main>
    )
}

export default PostSignUp