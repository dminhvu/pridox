import { PopupSpec } from "../admin/connectors/Popup";
import { ChevronsDownIcon, ChevronsUpIcon } from "../icons/icons";

type DocumentFeedbackType = "endorse" | "reject" | "hide" | "unhide";

const giveDocumentFeedback = async (
  documentId: string,
  messageId: number,
  documentRank: number,
  searchFeedback: DocumentFeedbackType
): Promise<string | null> => {
  const response = await fetch("/api/chat/document-search-feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message_id: messageId,
      document_id: documentId,
      document_rank: documentRank,
      click: false,
      search_feedback: searchFeedback,
    }),
    credentials: "include",
  });
  return response.ok
    ? null
    : response.statusText || (await response.json()).message;
};

interface DocumentFeedbackIconProps {
  documentId: string;
  messageId: number;
  documentRank: number;
  setPopup: (popupSpec: PopupSpec | null) => void;
  feedbackType: DocumentFeedbackType;
}

const DocumentFeedback = ({
  documentId,
  messageId,
  documentRank,
  setPopup,
  feedbackType,
}: DocumentFeedbackIconProps) => {
  let icon = null;
  const size = 20;
  if (feedbackType === "endorse") {
    icon = (
      <ChevronsUpIcon
        size={size}
        className="my-auto flex flex-shrink-0 text-blue-400"
      />
    );
  }
  if (feedbackType === "reject") {
    icon = (
      <ChevronsDownIcon
        size={size}
        className="my-auto flex flex-shrink-0 text-blue-400"
      />
    );
  }
  if (!icon) {
    // TODO: support other types of feedback
    return null;
  }

  return (
    <div
      onClick={async () => {
        const errorMsg = await giveDocumentFeedback(
          documentId,
          messageId,
          documentRank,
          feedbackType
        );
        if (!errorMsg) {
          setPopup({
            message: "Thanks for your feedback!",
            type: "success",
          });
        } else {
          setPopup({
            message: `Error giving feedback - ${errorMsg}`,
            type: "error",
          });
        }
      }}
      className="cursor-pointer"
    >
      {icon}
    </div>
  );
};

interface DocumentFeedbackBlockProps {
  documentId: string;
  messageId: number;
  documentRank: number;
  setPopup: (popupSpec: PopupSpec | null) => void;
}

export const DocumentFeedbackBlock = ({
  documentId,
  messageId,
  documentRank,
  setPopup,
}: DocumentFeedbackBlockProps) => {
  return (
    <div className="flex">
      <DocumentFeedback
        documentId={documentId}
        messageId={messageId}
        documentRank={documentRank}
        setPopup={setPopup}
        feedbackType="endorse"
      />
      <div className="ml-2">
        <DocumentFeedback
          documentId={documentId}
          messageId={messageId}
          documentRank={documentRank}
          setPopup={setPopup}
          feedbackType="reject"
        />
      </div>
    </div>
  );
};
