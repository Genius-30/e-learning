import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../context/providers";
import LayoutWrapper from "@/components/LayoutWrapper";

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "E-Learning",
  description: "An e-learning platform",
  icons: "/logo.jpg",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${interFont.variable} antialiased bg-background min-w-[320px] min-h-screen`}
        cz-shortcut-listen="true"
      >
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
