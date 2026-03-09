import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Youth Convocation Registration | The Apostolic Church",
  description:
    "Secure your participation for the upcoming Youth Convocation by The Apostolic Church.",
  icons: {
    icon: "/taclogo.jpeg",
    apple: "/taclogo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="bg-gradient-mesh" />
        {children}
      </body>
    </html>
  );
}
