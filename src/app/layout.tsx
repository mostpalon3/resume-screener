import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "ResumeAI — Intelligent Resume Screening & Candidate Ranking",
  description:
    "Automate your hiring process with AI-powered resume screening. Upload resumes, define job requirements, and instantly rank candidates by match score.",
  keywords: "resume screening, candidate ranking, HR automation, resume parser, job matching, ATS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg-elevated)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-primary)",
            },
          }}
        />
      </body>
    </html>
  );
}
