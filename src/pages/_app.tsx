import { type AppType } from "next/app";
// page/_app.tsx
// import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/clerk-react";
import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return     <ClerkProvider {...pageProps}>
    <Component {...pageProps} />
    </ClerkProvider>;
};

export default api.withTRPC(MyApp);
