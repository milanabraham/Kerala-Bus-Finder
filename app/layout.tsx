import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kerala Bus Finder – Bus Timings & Routes",
    template: "%s | Kerala Bus Finder",
  },
  description:
    "Find Kerala bus timings, routes and schedules for Kottayam, Pala, Kochi, Thodupuzha, Ernakulam, Alappuzha and more.",
  keywords: [
  "Kerala bus finder",
  "Kerala bus timings",
  "Kerala bus time",
  "Kerala bus schedule",
  "Kerala bus routes",
  "Kerala bus services",
  "Kerala bus timetable",
  "bus timings Kerala",
  "bus timetable Kerala",
  "bus schedule Kerala",
  "Kerala bus route finder",
  "Kerala public transport",
  "KSRTC bus timings",
  "KSRTC Kerala bus timings",
  "private bus timings Kerala",

  "Kottayam bus timings",
  "Kottayam bus timetable",
  "Kottayam bus routes",
  "Kottayam bus schedule",
  "Kottayam bus finder",

  "Kottayam to Pala bus",
  "Kottayam to Pala bus timings",
  "Kottayam Pala bus timings",
  "Pala bus timings",

  "Kottayam to Thodupuzha bus",
  "Kottayam to Thodupuzha bus timings",
  "Kottayam Thodupuzha bus timings",
  "Thodupuzha bus timings",
  "Thodupuzha to Kottayam bus",

  "Kottayam to Kochi bus",
  "Kottayam to Kochi bus timings",
  "Kottayam Kochi bus timings",
  "Kochi bus timings",

  "Kottayam to Ernakulam bus",
  "Kottayam to Ernakulam bus timings",
  "Kottayam Ernakulam bus timings",
  "Ernakulam bus timings",

  "Kottayam to Thiruvananthapuram bus",
  "Kottayam to Trivandrum bus",
  "Kottayam to Thiruvananthapuram bus timings",
  "Trivandrum to Kottayam bus",
  "Thiruvananthapuram to Kottayam bus timings",

  "Kottayam to Alappuzha bus",
  "Alappuzha to Ernakulam bus",
  "Alappuzha to Ernakulam bus timings",
  "Ernakulam to Alappuzha bus",
  "Ernakulam to Kottayam bus",
  "Ernakulam to Kottayam bus timings",

  "Thodupuzha to Kottayam bus timings",
  "Kerala travel bus timings",
  "Kerala local bus timings",
  "Kerala route timings",
  "Kerala bus departure times",
  "Kerala bus journey planner",
],
  verification: {
    google: "KYo-M-mMYgOQRKu1dZdDPu7P82xzEAS7x0LOPjsbp70",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}