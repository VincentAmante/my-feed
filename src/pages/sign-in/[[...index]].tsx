import { SignIn, SignedIn } from "@clerk/nextjs";
import { useRouter } from "next/router";
import LogoAnimated from "~/components/Logo/Animated";

const Redirect = () => {
  // Redirects users to a handler page
  void useRouter().push("/handle-sign-in");

  return <></>;
};

export default function Page() {
  return (
    <main className="grid min-h-screen items-center justify-center lg:grid-cols-2">
      <section className="flex flex-col items-center gap-6  px-12 py-4 text-center">
        <div className="max-w-xs">
          <LogoAnimated />
        </div>
        <h1 className="text-6xl font-semibold uppercase text-secondary">
          Kiurate
        </h1>
        <h2 className="flex max-w-xs flex-col text-2xl">
          <span> Welcome back! </span>
          <span>We missed you!</span>
        </h2>
      </section>

      {/* Sign in from Clerk */}
      <section className="flex flex-col items-center justify-center px-4 lg:items-start lg:justify-start lg:px-0">
        <SignIn redirectUrl={`/handle-sign-in`} />
        <SignedIn>
          <Redirect />
        </SignedIn>
      </section>
    </main>
  );
}
