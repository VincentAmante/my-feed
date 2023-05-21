import { type AppType } from "next/app";
// page/_app.tsx
// import type { AppProps } from "next/app";
import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default api.withTRPC(MyApp);
