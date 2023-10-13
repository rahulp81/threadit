import '../globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from "@clerk/nextjs";
import TopBar from '../components/shared/TopBar';
import BottomBar from '../components/shared/BottomBar';
import LeftSideBar from '../components/shared/LeftSideBar';
import RightSideBar from '../components/shared/RightSideBar';

import '../globals.css'
import { dark } from '@clerk/themes';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ThreadIt',
  description: 'A threads and Reddit Amalgation',
  icons : '/assets/logo.svg'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <TopBar />

          <main className='flex flex-row'>
            <LeftSideBar />
            <section className='main-container'>
              <div className='w-full max-w-4xl'>
                {children}
              </div>
            </section>
            {/* @ts-ignore */}
            <RightSideBar />
          </main>

          <BottomBar />
        </body>
      </html>
    </ClerkProvider>
  )
}
