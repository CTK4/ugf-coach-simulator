import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UGF Coach Sim",
  description: "Mobile-first head coach + front office simulator (UGF).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-md min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
