"use client";
import { HEADER_PADDING } from "@/lib/constants";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineChatBubbleOvalLeftEllipsis,
  HiOutlineFolder,
  HiOutlineMagnifyingGlass,
  HiOutlineSquares2X2,
  HiOutlineUserGroup,
} from "react-icons/hi2";

interface SidebarProps {
  user: User | null;
}

export const Sidebar = ({ user }: SidebarProps) => {
  const pathname = usePathname();

  function NavItem({
    icon,
    label,
    href,
  }: {
    icon: JSX.Element;
    label: string;
    href: string;
  }) {
    return (
      <Link
        href={href}
        title={label}
        className={[
          "flex w-full items-center gap-3 duration-200",
          "rounded-lg px-4 py-2.5",
          pathname === href
            ? "bg-primary-600 text-primary-50 hover:bg-primary-700"
            : "bg-transparent text-gray-500 hover:bg-primary-50 hover:text-primary-500",
        ].join(" ")}
      >
        {icon}
        <p>{label}</p>
      </Link>
    );
  }

  function SidebarNavigation() {
    const NavItems = [
      {
        icon: <HiOutlineChatBubbleOvalLeftEllipsis className="h-6 w-6" />,
        label: "Chat",
        href: "/dashboard/chat",
      },
      {
        icon: <HiOutlineMagnifyingGlass className="h-6 w-6" />,
        label: "Search",
        href: "/dashboard/search",
      },
      {
        icon: <HiOutlineFolder className="h-6 w-6" />,
        label: "Data Sources",
        href: "/dashboard/data-sources",
      },
      // {
      //   icon: <HiOutlineSquares2X2 className="h-6 w-6" />,
      //   label: "Project Settings",
      //   href: "#",
      // },
      // {
      //   icon: <HiOutlineUserGroup className="h-6 w-6" />,
      //   label: "Team",
      //   href: "#",
      // },
    ];

    return (
      <nav className="flex w-full max-w-xs flex-col items-start gap-2 whitespace-nowrap pb-3 text-base leading-4 tracking-wider">
        {NavItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
          />
        ))}
      </nav>
    );
  }

  return (
    <div className="z-10 h-screen p-3">
      <div
        className={cn(
          "z-30 flex h-full w-fit flex-col items-center rounded-2xl bg-white px-3 shadow-2xl transition-transform",
          HEADER_PADDING
        )}
        id="chat-sidebar"
      >
        <header className="flex gap-3 whitespace-nowrap p-8 text-3xl font-bold leading-8 text-slate-600">
          <Image
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/e46069773e18c9d71378d6b95f990d9d28be86b865323574e640b87a18bf5f18?apiKey=16ade88c6ea04069b345a88d63d1f2a2&"
            alt="Logo"
            width={44}
            height={32}
            priority
          />
          <div className="grow">pridox</div>
        </header>
        <SidebarNavigation />
        {/* <article className="mt-auto flex max-w-[231px] flex-col rounded-2xl bg-[linear-gradient(15deg,#7C3AED_26.3%,#6C1AF7_86.4%)] px-4 pb-7 text-center text-sm text-white">
          <Image
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/2b521c267852a5456030e01d1e5a74bc209f56c697e8d2c2070bf54408b21eae?apiKey=16ade88c6ea04069b345a88d63d1f2a2&"
            alt="Promotional Graphic"
            width={64}
            height={33}
            loading="lazy"
            className=" -mt-10 self-center"
          />
          <h2 className="mt-4 whitespace-nowrap text-base font-bold leading-4">
            Go unlimited with PRO
          </h2>
          <p className="mt-4 font-medium leading-6">
            Get your AI Project to another level and start doing more with
            Pridox PRO!
          </p>
          <button className="mt-6 justify-center whitespace-nowrap rounded-[40.5px] bg-white bg-opacity-10 px-2.5 py-2 font-semibold leading-[114%]">
            Get started with PRO
          </button>
        </article> */}
        <section className="my-4 flex max-w-[231px] items-center justify-between gap-5 whitespace-nowrap rounded-[60px] bg-white p-3.5 text-center text-sm font-bold leading-3 text-blue-950 shadow-2xl">
          <div className="flex items-center gap-2">
            <Image
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/698e29a4d41dd341c103c0497626fe0bf3347bb6b2e98c9b5929e9f6f3613e1d?apiKey=16ade88c6ea04069b345a88d63d1f2a2&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/698e29a4d41dd341c103c0497626fe0bf3347bb6b2e98c9b5929e9f6f3613e1d?apiKey=16ade88c6ea04069b345a88d63d1f2a2&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/698e29a4d41dd341c103c0497626fe0bf3347bb6b2e98c9b5929e9f6f3613e1d?apiKey=16ade88c6ea04069b345a88d63d1f2a2&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/698e29a4d41dd341c103c0497626fe0bf3347bb6b2e98c9b5929e9f6f3613e1d?apiKey=16ade88c6ea04069b345a88d63d1f2a2&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/698e29a4d41dd341c103c0497626fe0bf3347bb6b2e98c9b5929e9f6f3613e1d?apiKey=16ade88c6ea04069b345a88d63d1f2a2&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/698e29a4d41dd341c103c0497626fe0bf3347bb6b2e98c9b5929e9f6f3613e1d?apiKey=16ade88c6ea04069b345a88d63d1f2a2&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/698e29a4d41dd341c103c0497626fe0bf3347bb6b2e98c9b5929e9f6f3613e1d?apiKey=16ade88c6ea04069b345a88d63d1f2a2&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/698e29a4d41dd341c103c0497626fe0bf3347bb6b2e98c9b5929e9f6f3613e1d?apiKey=16ade88c6ea04069b345a88d63d1f2a2&"
              alt="Profile"
              width={31}
              height={31}
              loading="lazy"
            />
            <div className="flex grow">{user?.email?.split("@")[0]}</div>
          </div>
          <Image
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/525be62805c4c771f70a5f1651287f81be6291d4f7605de92560b07461b8a510?apiKey=16ade88c6ea04069b345a88d63d1f2a2&"
            alt="Settings"
            width={30}
            height={30}
            loading="lazy"
          />
        </section>
      </div>
    </div>
  );
};
