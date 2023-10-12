"use client"
import { sidebarLinks } from '@/constants/sharedLinks'
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

function BottomBar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <section className='bottombar'>
      <div className='bottombar_container'>
        {
          sidebarLinks.map((link) => {
            const isActive = (pathname.includes(link.route) && (link.route.length > 1) || pathname == link.route)

            return (
              <Link href={link.route} key={link.label}
                className={`bottombar_link ${isActive && 'bg-primary-500'}`}>
                <Image src={link.imgURL} alt={link.label} width={24} height={24} />
                <p className="text-light-1 text-subtle-medium max-sm:hidden">
                  {link.label.split(/\s+/)[0]}
                </p>
              </Link>
            )
          })
        }
      </div>
    </section>
  )
}

export default BottomBar
