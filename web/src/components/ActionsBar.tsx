"use client";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { usePathname } from "next/navigation";

const toolItems = [
  {
    imgSrc:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/065916d60e50d925458e067542c2e7d44d2a133676652cc4abf30ca4ccd88c24?apiKey=16ade88c6ea04069b345a88d63d1f2a2&",
    altText: "Share Chatbot Icon",
  },
  {
    imgSrc:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/e8c90c9a452ca627b819ce33a74a3ceaa50998aa12d6bf06864261a8822f1adb?apiKey=16ade88c6ea04069b345a88d63d1f2a2&",
    altText: "Notifications Icon",
  },
  {
    imgSrc:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/d507777a8c104f12dab79e77b14f72b0c61d9c05ba53afedbcd38607db232122?apiKey=16ade88c6ea04069b345a88d63d1f2a2&",
    altText: "Search Icon",
  },
];
const pageTitles = {
  "/dashboard/chat": "Chat",
  "/dashboard/search": "Search",
  "/dashboard/data-sources": "Data Sources",
  "/dashboard/admin/add-connector": "Add Connector",
} as Record<string, string>;
export function ActionsBar() {
  const path = usePathname();
  return (
    <div className="absolute top-6 z-10 flex w-full">
      <p className=" p-4 text-2xl font-bold">{pageTitles[path]}</p>
      <header className=" ml-auto mr-6 flex h-fit w-fit items-center justify-end gap-4 whitespace-nowrap rounded-[32px] bg-white p-3 text-sm leading-5 text-violet-600 shadow-lg">
        <div className="flex flex-1 flex-col justify-center self-stretch rounded-[60px] bg-violet-600 bg-opacity-10 px-4 py-2.5">
          <section className="flex justify-between gap-2.5">
            <Image
              src={toolItems[0].imgSrc}
              alt={toolItems[0].altText}
              width={20}
              height={20}
              className="aspect-square w-5"
            />
            <h2 className="grow">Share Chatbot</h2>
          </section>
        </div>
        {toolItems.slice(1).map((item) => (
          <Image
            key={item.imgSrc}
            src={item.imgSrc}
            alt={item.altText}
            width={22}
            height={22}
            className="my-auto aspect-square w-[22px] self-stretch"
          />
        ))}
        <SignedIn>
          {/* Mount the UserButton component */}
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          {/* Signed out users get sign in button */}
          <SignInButton />
        </SignedOut>
      </header>
    </div>
  );
}
