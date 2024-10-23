import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { TRPCReactProvider } from "~/trpc/react";
import ToasterProvider from "~/providers/toaster-provider";

export const metadata: Metadata = {
  title: "Strooper Wallet",
  description: "Non-custodial web3 wallet for Stellar",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <head title={metadata.title ?? "Strooper Wallet"}>
        <Analytics id="UA-169430462-1" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
      </head>
      <body>
        <TRPCReactProvider>
          <ToasterProvider />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
