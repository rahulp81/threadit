import { OrganizationSwitcher, SignedIn, SignOutButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { dark } from '@clerk/themes'

function TopBar() {
    return (
        <nav className='topbar'>
            <Link href={'/'} className='flex items-center gap-4' >
                <Image src={'/assets/logo.svg'} width={28} height={28} alt='logo' />
                <p className='text-heading3-bold  text-light-1 max-xs:hidden'>ThreadIt</p>
            </Link>

            <div className='flex items-center gap-1'>
                <div className='block md:hidden'>
                    <SignedIn>
                        <SignOutButton>
                            <div className='flex cursor-pointer'>
                                <Image
                                    src={'/assets/logout.svg'}
                                    alt='logout'
                                    height={24}
                                    width={24}
                                />
                            </div>
                        </SignOutButton>
                    </SignedIn>
                </div>
            </div>

        </nav>
    )
}

export default TopBar
