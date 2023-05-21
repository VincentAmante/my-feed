import { type AppType } from "next/app";
// page/_app.tsx
import { ClerkProvider } from "@clerk/nextjs";
// import type { AppProps } from "next/app";
import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return <ClerkProvider {...pageProps}>
            <Component {...pageProps} />
          </ClerkProvider>;
};

export default api.withTRPC(MyApp);
