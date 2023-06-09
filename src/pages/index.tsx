
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
// import { UserButton } from "@clerk/clerk-react";
import {
  SignedIn,
} from "@clerk/nextjs";
import { useRouter } from "next/router";

const Redirect = () => {
  void useRouter().push("/handle-sign-in");

  return <></>;
}
const Home: NextPage = () => {

  return (
    <>
      <Head>
        <title>Kiurate</title>
        <meta name="description" content="Your space, your content, your experience." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col gap-4 min-h-screen items-center justify-center">
        <section className="px-4 flex flex-col items-center text-center gap-2 border-b-primary border-b-2 py-4">
          <h1 className="text-6xl font-semibold">
            Welcome to Kiurate
          </h1>
          <h2 className="text-2xl max-w-sm">
            Your space, your content, your experience.
          </h2>
        </section>
        <section className="flex flex-col items-center">
          <div className="flex flex-col gap-4 items-center">
            <Link className="btn btn-primary flex flex-col items-center p-8 text-2xl" href={'/sign-up'}>
              Sign Up
            </Link>
            <Link className="" href={'/sign-in'}>
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