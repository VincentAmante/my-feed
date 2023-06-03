import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
// import { UserButton } from "@clerk/clerk-react";
import {
  SignedOut, SignUp, SignedIn,
  AuthenticateWithRedirectCallback,
} from "@clerk/nextjs";

import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { Suspense } from "react";

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
      <main className="grid lg:grid-cols-2 min-h-screen items-center justify-center">
        <section className="px-4 flex flex-col items-center text-center gap-2">
          <h1 className="text-6xl max-w-md">
            Welcome to Kiurate
          </h1>
          <h2 className="text-2xl max-w-sm">
            Your space, your content, your experience.
          </h2>
        </section>
        <section>
          <Link className="btn btn-primary" href={'/sign-in'}>
            Sign In
          </Link>
          <Link className="btn btn-primary" href={'/sign-up'}>
            Sign Up
          </Link>
          <SignedIn>
            <Redirect />
          </SignedIn>
        </section>
      </main>
    </>
  );
};

export default Home;
