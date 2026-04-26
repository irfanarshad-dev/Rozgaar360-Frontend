import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import SplashScreen from "./components/SplashScreen";
import TokenExpiryChecker from "./components/TokenExpiryChecker";
import LanguageInitializer from "./components/LanguageInitializer";
import AutoTranslateHardcodedText from "./components/AutoTranslateHardcodedText";
import { I18nProvider } from "@/lib/i18nProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Rozgaar360 | Home",
  description: "Find skilled workers or offer your services on Pakistan's leading job platform",
  icons: {
    icon: "/assests/Logo/Rozgaar360-logo.png",
    shortcut: "/assests/Logo/Rozgaar360-logo.png",
    apple: "/assests/Logo/Rozgaar360-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`} suppressHydrationWarning>
        <SplashScreen />
        <I18nProvider>
          <LanguageInitializer />
          <AutoTranslateHardcodedText />
          <TokenExpiryChecker />
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
