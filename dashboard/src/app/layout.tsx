import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoPulse - AI Code Review & Skill Intelligence Dashboard",
  description: "Track your algorithmic score progression, time/space complexity improvements, and code mastery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© {new Date().getFullYear()} AlgoPulse — AI Code Review & Skill Intelligence Platform.</p>
              <div className="flex items-center gap-4 text-slate-400">
                <span>Powered by Gemini 2.5 Flash</span>
                <span>•</span>
                <span>Supabase PostgreSQL & Next.js</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
