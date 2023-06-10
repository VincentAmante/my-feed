import { useEffect } from "react";
import { api } from "~/utils/api";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";

const PostSignUp = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const { user: clerkUser } = useUser();

  const user = api.users.initUser.useQuery({
    clerkId: userId || "",
    firstName: clerkUser?.firstName || "",
    lastName: clerkUser?.lastName || "",
    username: clerkUser?.username || "",
  });

  useEffect(() => {
    if ((user.data && userId !== undefined) || userId !== "") {
      void router.push("/feed");
    }
  }, [user, router, userId]);

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center text-white">
      <h1 className="text-6xl">
        <span className="loading loading-bars loading-lg text-primary"></span>
      </h1>
    </main>
  );
};

export default PostSignUp;
