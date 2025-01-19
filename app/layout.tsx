import { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import mongodbConnect from '@/backend/lib/mongodb';
import { ThemeProvider } from '@/context/Theme';
import ChangeTheme from '@/components/ChangeTheme';
import { cookies } from 'next/headers';
import { GlobalProvider } from "./GlobalProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Class Fundraising Management",
  description: "Manage monthly payments for your classroom",
};

// Define the layout structure using an async function to connect to the database and handle cookies
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Connect to MongoDB when the layout is loaded
  await mongodbConnect();

  // Await the cookies() call to get the actual cookies instance
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme');
  const initialTheme = themeCookie?.value || 'light';

  // Render the layout with the appropriate theme
  return (
    <html lang="en" className={initialTheme === 'dark' ? 'dark' : 'light'}>
      <body className={inter.className}>
        <ThemeProvider initialTheme={initialTheme}>
          <GlobalProvider>
            {children}
            <ChangeTheme />
          </GlobalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
