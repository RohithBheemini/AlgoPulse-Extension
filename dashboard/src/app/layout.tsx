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
      <body className="bg-[#0d1117] text-[#c9d1d9] flex flex-col min-h-screen selection:bg-[#4285F4]/30 selection:text-[#f0f6fc]">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-[#30363d] bg-[#161b22] py-6 text-xs text-[#8b949e]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
                  <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
                  <span className="w-2 h-2 rounded-full bg-[#FBBC05]" />
                  <span className="w-2 h-2 rounded-full bg-[#34A853]" />
                </div>
                <p>© {new Date().getFullYear()} AlgoPulse — AI Code Review & Skill Intelligence Platform.</p>
              </div>
              <div className="flex items-center gap-4 text-[#8b949e]">
                <span className="hover:text-[#c9d1d9] transition">Powered by Google Gemini</span>
                <span>•</span>
                <span className="hover:text-[#c9d1d9] transition">Supabase PostgreSQL & Next.js</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
