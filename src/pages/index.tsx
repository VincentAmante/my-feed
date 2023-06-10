import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
// import { UserButton } from "@clerk/clerk-react";
import LogoAnimated from "~/components/Logo/Animated";
import { SignedIn } from "@clerk/nextjs";
import { useRouter } from "next/router";

const Redirect = () => {
  void useRouter().push("/handle-sign-in");

  return <></>;
};
const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Kiurate</title>
        <meta
          name="description"
          content="Your space, your content, your experience."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <section className="flex flex-col items-center gap-2 border-b-2 border-b-primary px-4 py-4 text-center">
          <LogoAnimated />
          <h1 className="text-6xl font-semibold">Welcome to Kiurate</h1>
          <h2 className="max-w-sm text-2xl">
            Your space, your content, your experience.
          </h2>
        </section>
        <section className="flex flex-col items-center">
          <div className="flex flex-col items-center gap-4">
            <Link
              className="btn-primary btn flex flex-col items-center p-8 text-2xl"
              href={"/sign-up"}
            >
              Sign Up
            </Link>
            <Link className="" href={"/sign-in"}>
              Sign In
            </Link>
          </div>
          <SignedIn>
            <Redirect />
          </SignedIn>
        </section>
      </main>
    </>
  );
};

export default Home;
