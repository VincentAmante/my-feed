import { SignIn, SignedIn } from "@clerk/nextjs";
import { useRouter } from "next/router";

const Redirect = () => {
  // Redirects users to a handler page
  void useRouter().push("/handle-sign-in");

  return <></>;
};

export default function Page() {
  return (
    <main className="grid min-h-screen items-center justify-center lg:grid-cols-2">
      <section className="flex flex-col items-center gap-2 px-4 text-center">
        <h1 className="max-w-md text-6xl">Welcome back to Kiurate!</h1>
        <h2 className="max-w-sm text-2xl">We missed you ^-^</h2>
      </section>

      {/* Sign in from Clerk */}
      <section>
        <SignIn />
        <SignedIn>
          <Redirect />
        </SignedIn>
      </section>
    </main>
  );
}
