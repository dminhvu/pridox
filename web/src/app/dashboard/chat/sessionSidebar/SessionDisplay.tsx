import { useRouter } from "next/navigation";
import { ChatSession } from "../interfaces";
import { useState } from "react";
import { deleteChatSession, renameChatSession } from "../lib";
import { DeleteChatModal } from "../modal/DeleteChatModal";
import { BasicSelectable } from "@/components/BasicClickable";
import Link from "next/link";
import { FiCheck, FiEdit, FiMessageSquare, FiTrash, FiX } from "react-icons/fi";

interface ChatSessionDisplayProps {
  chatSession: ChatSession;
  isSelected: boolean;
}

export function ChatSessionDisplay({
  chatSession,
  isSelected,
}: ChatSessionDisplayProps) {
  const router = useRouter();
  const [isDeletionModalVisible, setIsDeletionModalVisible] = useState(false);
  const [isRenamingChat, setIsRenamingChat] = useState(false);
  const [chatName, setChatName] = useState(chatSession.name);

  const onRename = async () => {
    const response = await renameChatSession(chatSession.id, chatName);
    if (response.ok) {
      setIsRenamingChat(false);
      router.refresh();
    } else {
      alert("Failed to rename chat session");
    }
  };

  return (
    <>
      {isDeletionModalVisible && (
        <DeleteChatModal
          onClose={() => setIsDeletionModalVisible(false)}
          onSubmit={async () => {
            const response = await deleteChatSession(chatSession.id);
            if (response.ok) {
              setIsDeletionModalVisible(false);
              // go back to the main page
              router.push("/chat");
            } else {
              alert("Failed to delete chat session");
            }
          }}
          chatSessionName={chatSession.name}
        />
      )}
      <Link
        className="my-1 flex"
        key={chatSession.id}
        href={`/dashboard/chat?chatId=${chatSession.id}`}
        scroll={false}
      >
        <BasicSelectable fullWidth selected={isSelected}>
          <div className="flex">
            <div className="my-auto mr-2">
              <FiMessageSquare size={16} />
            </div>{" "}
            {isRenamingChat ? (
              <input
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onRename();
                    event.preventDefault();
                  }
                }}
                className="-my-px mr-2 w-full rounded px-1"
              />
            ) : (
              <p className="mr-3 line-clamp-1 text-ellipsis break-all text-emphasis">
                {chatName || `Chat ${chatSession.id}`}
              </p>
            )}
            {isSelected &&
              (isRenamingChat ? (
                <div className="my-auto ml-auto flex">
                  <div
                    onClick={onRename}
                    className={`-m-1 rounded p-1 hover:bg-black/10`}
                  >
                    <FiCheck size={16} />
                  </div>
                  <div
                    onClick={() => {
                      setChatName(chatSession.name);
                      setIsRenamingChat(false);
                    }}
                    className={`-m-1 ml-2 rounded p-1 hover:bg-black/10`}
                  >
                    <FiX size={16} />
                  </div>
                </div>
              ) : (
                <div className="my-auto ml-auto flex">
                  <div
                    onClick={() => setIsRenamingChat(true)}
                    className={`-m-1 rounded p-1 hover:bg-black/10`}
                  >
                    <FiEdit size={16} />
                  </div>
                  <div
                    onClick={() => setIsDeletionModalVisible(true)}
                    className={`-m-1 ml-2 rounded p-1 hover:bg-black/10`}
                  >
                    <FiTrash size={16} />
                  </div>
                </div>
              ))}
          </div>
        </BasicSelectable>
      </Link>
    </>
  );
}
