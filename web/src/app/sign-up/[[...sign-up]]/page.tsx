import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";

const META_TITLE = "Sign Up | Pridox";

export const metadata: Metadata = {
  title: META_TITLE,
};

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <SignUp />;
    </div>
  );
}
