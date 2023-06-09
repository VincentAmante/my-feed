import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { dark } from '@clerk/themes';
import { useEffect, useState } from "react";

import "~/styles/globals.css";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp: AppType = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);
  return <ClerkProvider
    appearance={{
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      baseTheme: dark,
    }}
    {...pageProps}>
    {getLayout(<Component {...pageProps} />)}
  </ClerkProvider>;
};

export default api.withTRPC(MyApp);