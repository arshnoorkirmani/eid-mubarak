import type { Metadata } from "next";
import { Amiri, Cinzel_Decorative, Nunito } from "next/font/google";
import "./globals.css";

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["latin", "arabic"],
  weight: ["400", "700"],
});

const cinzel = Cinzel_Decorative({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Eid Mubarak — Create & Share Personalized Eid Cards",
  description: "A festive Next.js app to generate and share customized Eid greetings.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Eid Mubarak — Create & Share Personalized Eid Cards",
    description: "A festive Next.js app to generate and share customized Eid greetings.",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Eid Mubarak",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${amiri.variable} ${cinzel.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
