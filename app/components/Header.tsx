'use client';

import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          LinkedInV
        </Link>
        
        <div className="flex items-center gap-4">
          <SignedIn>
            <div className="flex items-center gap-4">
              <Link href="/user">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <UserButton
                userProfileProps={{
                  additionalOAuthScopes: {
                    linkedin: ['openid'],
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>
          </SignedIn>
          
          <SignedOut>
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}