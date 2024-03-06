import { User } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { FiMessageSquare, FiSearch } from "react-icons/fi";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
interface HeaderProps {
  user: User | null;
}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="border-b border-border bg-background-emphasis">
      <div className="mx-8 flex h-16">
        <Link className="py-4" href="/search">
          <div className="flex">
            <div className="h-[32px] w-[30px]">
              <Image src="/logo.png" alt="Logo" width="1419" height="1520" />
            </div>
            <h1 className="flex text-2xl text-strong font-bold my-auto">
              Pridox
            </h1>
          </div>
        </Link>

        <Link
          href="/search"
          className={"ml-6 h-full flex flex-col hover:bg-hover"}
        >
          <div className="w-24 flex my-auto">
            <div className={"mx-auto flex text-strong px-2"}>
              <FiSearch className="my-auto mr-1" />
              <h1 className="flex text-sm font-bold my-auto">Search</h1>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/chat" className="h-full flex flex-col hover:bg-hover">
          <div className="w-24 flex my-auto">
            <div className="mx-auto flex text-strong px-2">
              <FiMessageSquare className="my-auto mr-1" />
              <h1 className="flex text-sm font-bold my-auto">Chat</h1>
            </div>
          </div>
        </Link>

        <div className="ml-auto h-full flex flex-col">
          <div className="my-auto">
            <SignedIn>
              {/* Mount the UserButton component */}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              {/* Signed out users get sign in button */}
              <SignInButton />
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
};

/* 

*/
