import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Onboardy - Intelligent Onboarding for Engineering Teams",
  description: "Transform any codebase into an intelligent, multi-modal learning experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
