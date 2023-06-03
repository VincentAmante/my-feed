import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => <main className="grid lg:grid-cols-2 min-h-screen items-center justify-center">
    <section>
        <SignUp />
    </section>
</main>;

export default SignUpPage;
