import { SignUp, SignedIn } from "@clerk/nextjs";
import { useRouter } from "next/router";

const Redirect = () => {
    void useRouter().push("/handle-sign-in");

    return <></>;
}

const SignUpPage = () => <main className="grid lg:grid-cols-2 min-h-screen items-center justify-center">
    <section>
        <SignUp />
        <SignedIn>
            <Redirect />
        </SignedIn>
    </section>
</main>;

export default SignUpPage;
