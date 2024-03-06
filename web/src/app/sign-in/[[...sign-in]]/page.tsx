import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";

const META_TITLE = "Sign In | Pridox";

export const metadata: Metadata = {
  title: META_TITLE,
};

export default function Page() {
  return (
    <div
      className="flex items-center justify-center w-full h-full bg-gray-50"
    >
      <SignIn />;
    </div>
  );
}
