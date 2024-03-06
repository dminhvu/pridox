"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface Item {
  name: string;
  icon: JSX.Element;
  link: string;
}

interface Collection {
  name: string | JSX.Element;
  items: Item[];
}

export function AdminSidebar({ collections }: { collections: Collection[] }) {
  const pathname = usePathname();

  return (
    <nav className="mb-10 flex h-fit flex-col gap-4">
      {collections.map((collection, collectionInd) => (
        <div key={collectionInd}>
          <h2 className="pb-2 text-sm font-bold text-black">
            {collection.name}
          </h2>
          <div className="flex flex-col gap-2">
            {collection.items.map((item) => (
              <Link
                title={item.name}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-4 py-2 font-medium tracking-tight duration-200",
                  pathname === item.link
                    ? "bg-primary-600 text-primary-50 hover:bg-primary-700 hover:text-primary-50"
                    : "bg-transparent text-gray-500 hover:bg-primary-50 hover:text-primary-500"
                )}
                key={item.link}
                href={item.link}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
