import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./styles/layout.scss";
import { AppProviders } from "@/providers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link
        rel="icon"
        type="image/jpg"
        sizes="32x32"
        href="./logo/logo_big.jpg"
      />
      <body className={inter.className} suppressHydrationWarning={true}>
        <AppProviders
          attribute="class"
          defaultTheme="root"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
