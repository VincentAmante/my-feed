import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="grid lg:grid-cols-2 min-h-screen items-center justify-center">
      <section className="px-4 flex flex-col items-center text-center gap-2">
        <h1 className="text-6xl max-w-md">
          Welcome back to Kiurate!
        </h1>
        <h2 className="text-2xl max-w-sm">
          We missed you ^-^
        </h2>
      </section>
      <section>
        <SignIn />
      </section>
    </main>
  );
}