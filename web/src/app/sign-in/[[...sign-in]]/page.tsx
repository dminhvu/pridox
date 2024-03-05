import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";

const META_TITLE = "Sign In | Pridox";

export const metadata: Metadata = {
  title: META_TITLE,
};

export default function Page() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-t from-indigo-300 to-slate-900">
      <SignIn />;
    </div>
  );
}
