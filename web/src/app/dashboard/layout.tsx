import { ActionsBar } from "@/components/ActionsBar";
import { InstantSSRAutoRefresh } from "@/components/SSRAutoRefresh";
import { Sidebar } from "@/components/Sidebar";
import { ApiKeyModal } from "@/components/openai/ApiKeyModal";
import { getCurrentUserSS } from "@/lib/userSS";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserSS();
  return (
    <>
      <ApiKeyModal />
      <InstantSSRAutoRefresh />
      <div className="flex">
        <Sidebar user={user} />
        <div className="relative flex flex-auto flex-col">
          <ActionsBar />
          {children}
        </div>
      </div>
    </>
  );
}
