import { SignUp, SignedIn } from "@clerk/nextjs";
import { useRouter } from "next/router";
import LogoAnimated from "~/components/Logo/Animated";

// const Redirect = () => {
//   void useRouter().push("/handle-sign-in");
//   return <></>;
// };

const SignUpPage = () => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-4  lg:grid lg:grid-cols-2 lg:px-28">
    <section className="flex flex-col items-center gap-6 border-b-2 border-primary px-12 py-4 text-center lg:border-b-0 lg:border-r-2">
      <div className="max-w-xs">
        <LogoAnimated />
      </div>
      <h1 className="text-6xl font-semibold uppercase text-secondary">
        Kiurate
      </h1>
      <h2 className="max-w-sm text-2xl">
        Your space, your content, your experience.
      </h2>
    </section>
    <section className="flex flex-col items-center">
      <div className="flex flex-col items-center gap-4">
        <SignUp />
        <SignedIn>{/* <Redirect /> */}</SignedIn>
      </div>
    </section>
  </main>
);

export default SignUpPage;
