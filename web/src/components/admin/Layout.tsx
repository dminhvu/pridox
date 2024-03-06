import { AdminSidebar } from "@/components/admin/connectors/AdminSidebar";
import {
  RobotIcon,
  ThumbsUpIcon,
  UsersIcon,
  ZoomInIcon,
} from "@/components/icons/icons";
import { User } from "@/lib/types";
import {
  AuthTypeMetadata,
  getAuthTypeMetadataSS,
  getCurrentUserSS,
} from "@/lib/userSS";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FiCpu, FiPackage, FiSlack } from "react-icons/fi";
import {
  IoArrowBack,
  IoBookmark,
  IoBookmarkOutline,
  IoCloudUpload,
  IoCloudUploadOutline,
  IoCompass,
  IoCompassOutline,
  IoDocumentText,
  IoDocumentTextOutline,
  IoHeart,
  IoSearch,
} from "react-icons/io5";

export async function Layout({ children }: { children: React.ReactNode }) {
  const tasks = [getAuthTypeMetadataSS(), getCurrentUserSS()];

  // catch cases where the backend is completely unreachable here
  // without try / catch, will just raise an exception and the page
  // will not render
  let results: (User | AuthTypeMetadata | null)[] = [null, null];
  try {
    results = await Promise.all(tasks);
  } catch (e) {
    console.log(`Some fetch failed for the main search page - ${e}`);
  }

  const authTypeMetadata = results[0] as AuthTypeMetadata | null;
  const user = results[1] as User | null;

  if (!user) {
    return redirect("/");
  }
  if (user.role !== "admin") {
    return redirect("/");
  }

  return (
    <div className="flex flex-row">
      <div className="mt-10 flex h-full w-full max-w-xs flex-col gap-10 px-8">
        <Link
          title="Back to Dashboard"
          className="flex w-full flex-row items-center gap-2 rounded-lg border border-primary-600 px-4 py-2 font-bold tracking-tight text-primary-600 duration-200 hover:bg-primary-600 hover:text-white"
          href="/dashboard/chat"
        >
          <IoArrowBack size={18} />
          <span>Go to Dashboard</span>
        </Link>
        <AdminSidebar
          collections={[
            {
              name: "Connectors",
              items: [
                {
                  name: "Existing Connectors",
                  icon: <IoDocumentText />,
                  link: "/admin/indexing/status",
                },
                {
                  name: "Add Connector",
                  icon: <IoCloudUpload />,
                  link: "/admin/add-connector",
                },
              ],
            },
            {
              name: "Document Management",
              items: [
                {
                  name: "Document Sets",
                  icon: <IoBookmark />,
                  link: "/admin/documents/sets",
                },
                {
                  name: "Explorer",
                  icon: <IoSearch />,
                  link: "/admin/documents/explorer",
                },
                {
                  name: "Feedback",
                  icon: <IoHeart />,
                  link: "/admin/documents/feedback",
                },
              ],
            },
            {
              name: "Custom Assistants",
              items: [
                {
                  name: "Personas",
                  icon: <RobotIcon size={18} />,
                  link: "/admin/personas",
                },
                {
                  name: "Slack Bots",
                  icon: <FiSlack size={18} />,
                  link: "/admin/bot",
                },
              ],
            },
            {
              name: "Model Configs",
              items: [
                {
                  name: "LLM",
                  icon: <FiCpu size={18} />,
                  link: "/admin/keys/openai",
                },
                {
                  name: "Embedding",
                  icon: <FiPackage size={18} />,
                  link: "/admin/models/embedding",
                },
              ],
            },
            {
              name: "User Management",
              items: [
                {
                  name: "Users",
                  icon: <UsersIcon size={18} />,
                  link: "/admin/users",
                },
              ],
            },
          ]}
        />
      </div>
      <div className="h-full w-full overflow-y-auto px-12 pb-8 pt-8">
        {children}
      </div>
    </div>
  );
}
