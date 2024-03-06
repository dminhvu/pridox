import {
  AddDocumentsIcon,
  AddSourceIcon,
  AppsIcon,
  FolderIcon,
  PlusIcon,
  UploadFileIcon,
  WebsiteIcon,
} from "@/components/icons/icons";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetchValidFilterInfo } from "@/lib/search/utilsSS";
import { Explorer } from "@/app/admin/documents/explorer/Explorer";
import { DataTable } from "@/components/DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Title, Text } from "@tremor/react";
import { SourceIcon } from "@/components/SourceIcon";
import { SourceCategory, SourceMetadata } from "@/lib/search/interfaces";
import { listSourceMetadata } from "@/lib/sources";
import { Button } from "@/components/ui/button";

function SourceTile({ sourceMetadata }: { sourceMetadata: SourceMetadata }) {
  return (
    <Link
      className={`flex 
        cursor-pointer
        flex-col 
        items-center 
        justify-center 
        rounded-lg 
        bg-hover-light 
        px-3
        py-2
        shadow-md
        hover:bg-hover
      `}
      href={sourceMetadata.adminUrl}
    >
      <SourceIcon sourceType={sourceMetadata.internalName} iconSize={24} />
    </Link>
  );
}
export default async function DataSource() {
  const { connectors, documentSets } = await fetchValidFilterInfo();
  const sources = listSourceMetadata();

  const importedKnowledgeSources = sources.filter(
    (source) => source.category === SourceCategory.ImportedKnowledge
  );
  const appConnectionSources = sources
    .filter((source) => source.category === SourceCategory.AppConnection)
    .slice(0, 8);

  return (
    <div className="mt-28 flex flex-col px-4">
      <div className="flex items-center gap-4">
        <p className="text-xl font-medium">Choose Project</p>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="New Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 flex gap-4">
        <Dialog>
          <DialogTrigger className="flex grow flex-col items-center rounded-xl bg-slate-50 py-6">
            <UploadFileIcon size={54} />
            <p className="mt-3 text-lg font-semibold">
              Drag and drop files, or Browse
            </p>
            <p className="text-sm text-gray-400">
              Support document, image, and audio files
            </p>
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col items-center">
              <FolderIcon size={70} />
              <p className="mt-6 text-2xl font-bold">Add new data source</p>
              <p>Not what you need? Request new source</p>

              <Tabs
                defaultValue="website"
                className="mt-3 flex w-full flex-col gap-3"
              >
                <TabsList className=" flex gap-0 bg-transparent">
                  <TabsTrigger
                    className="flex w-40 items-center gap-2 rounded-xl bg-white px-4 py-3 data-[state=inactive]:bg-transparent data-[state=inactive]:opacity-25 data-[state=active]:shadow-2xl "
                    value="website"
                  >
                    <WebsiteIcon size={44} />
                    <p className=" text-xl font-medium ">Website</p>
                  </TabsTrigger>

                  <TabsTrigger
                    className="flex w-40 items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-2xl data-[state=inactive]:bg-transparent data-[state=inactive]:opacity-25 data-[state=active]:shadow-2xl"
                    value="apps"
                  >
                    <AppsIcon size={44} />
                    <p className=" text-xl font-medium ">Apps</p>
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="website"
                  className="flex w-full flex-col gap-3 data-[state=inactive]:hidden"
                >
                  <p className="text-lg font-medium text-black ">
                    URL to crawl
                  </p>
                  <Input placeholder="https://pridox.ai/blog" />

                  <Button className="w-full bg-violet-600 text-xl font-bold hover:bg-violet-700">
                    Start
                  </Button>
                </TabsContent>
                <TabsContent
                  value="apps"
                  className="flex w-full flex-col gap-3 data-[state=inactive]:hidden"
                >
                  <p className="text-lg font-medium text-black ">
                    Sync data from other apps
                  </p>

                  <div className="flex w-full flex-wrap gap-4">
                    {appConnectionSources.map((source) => {
                      return (
                        <SourceTile
                          key={source.internalName}
                          sourceMetadata={source}
                        />
                      );
                    })}
                    <Button className=" bg-hover-light text-violet-600 hover:text-white">
                      <PlusIcon size={24} />
                      <p className="ml-2">Need another?</p>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger className="flex grow flex-col items-center rounded-xl bg-slate-50 py-6">
            <AddSourceIcon size={54} />
            <p className="mt-3 text-lg font-semibold">Add new sources</p>
            <p className="text-sm text-gray-400">
              Crawl from links, or connect to apps.
            </p>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      <p className="mt-3 text-xl font-medium">Your data</p>
      <DataTable />
    </div>
  );
}
