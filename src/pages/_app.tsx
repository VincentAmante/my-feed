import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { dark } from "@clerk/themes";
import { useEffect, useState } from "react";
import Head from "next/head";

import "~/styles/globals.css";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp: AppType = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <ClerkProvider
      appearance={{
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        baseTheme: dark,
      }}
      {...pageProps}
    >
      <Head>
        <title>Kiurate</title>
        <meta
          name="description"
          content="Your space, your content, your experience."
        />
        <meta property="og:title" content={`Kiurate`} key="title" />
        <meta property="og:title" content="Kiurate" />
        <meta
          property="og:description"
          content={"Your content, your space, your feeds!"}
        />
        <meta property="og:image" content={"/logo.png"} />
        <meta property="og:url" content={"https://kiurate.vercel.app"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:site_name" content="Kiurate" />
        <meta name="twitter:image:alt" content="Kiurate" />
        <meta name="twitter:title" content="Kiurate" />
        <meta
          name="twitter:description"
          content={"Your content, your space, your feeds!"}
        />
        <meta name="twitter:image" content={"/public/logo.png"} />
        <meta name="twitter:url" content={"https://kiurate.vercel.app"} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {getLayout(<Component {...pageProps} />)}
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
