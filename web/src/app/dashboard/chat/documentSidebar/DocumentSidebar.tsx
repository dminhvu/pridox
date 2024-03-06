import { PridoxDocument } from "@/lib/search/interfaces";
import { Text } from "@tremor/react";
import { ChatDocumentDisplay } from "./ChatDocumentDisplay";
import { usePopup } from "@/components/admin/connectors/Popup";
import { FiAlertTriangle, FiFileText } from "react-icons/fi";
import { SelectedDocumentDisplay } from "./SelectedDocumentDisplay";
import { removeDuplicateDocs } from "@/lib/documentUtils";
import { BasicSelectable } from "@/components/BasicClickable";
import { Message, RetrievalType } from "../interfaces";
import { HEADER_PADDING } from "@/lib/constants";
import { HoverPopup } from "@/components/HoverPopup";

function SectionHeader({
  name,
  icon,
}: {
  name: string;
  icon: React.FC<{ className: string }>;
}) {
  return (
    <div className="mb-3.5 mt-2 flex pb-0.5 text-lg font-bold font-medium text-emphasis">
      {icon({ className: "my-auto mr-1" })}
      {name}
    </div>
  );
}

export function DocumentSidebar({
  selectedMessage,
  selectedDocuments,
  toggleDocumentSelection,
  clearSelectedDocuments,
  selectedDocumentTokens,
  maxTokens,
  isLoading,
}: {
  selectedMessage: Message | null;
  selectedDocuments: PridoxDocument[] | null;
  toggleDocumentSelection: (document: PridoxDocument) => void;
  clearSelectedDocuments: () => void;
  selectedDocumentTokens: number;
  maxTokens: number;
  isLoading: boolean;
}) {
  const { popup, setPopup } = usePopup();

  const selectedMessageRetrievalType = selectedMessage?.retrievalType || null;

  const selectedDocumentIds =
    selectedDocuments?.map((document) => document.document_id) || [];

  const currentDocuments = selectedMessage?.documents || null;
  const dedupedDocuments = removeDuplicateDocs(currentDocuments || []);

  // NOTE: do not allow selection if less than 75 tokens are left
  // this is to prevent the case where they are able to select the doc
  // but it basically is unused since it's truncated right at the very
  // start of the document (since title + metadata + misc overhead) takes up
  // space
  const tokenLimitReached = selectedDocumentTokens > maxTokens - 75;
  return (
    <div
      className={`
      mr-4 
      mt-[100px]
      flex
      w-full
      flex-initial
      flex-col rounded-2xl bg-white px-6 py-2
      shadow-2xl
      ${HEADER_PADDING}
      `}
      id="document-sidebar"
    >
      {popup}

      <div className="mt-4 flex h-4/6 flex-col">
        <div className="mb-3 flex border-b border-border px-3">
          <SectionHeader
            name={
              selectedMessageRetrievalType === RetrievalType.SelectedDocs
                ? "Referenced Documents"
                : "Retrieved Documents"
            }
            icon={FiFileText}
          />
        </div>

        {currentDocuments ? (
          <div className="dark-scrollbar flex flex-col overflow-y-auto">
            <div>
              {dedupedDocuments.length > 0 ? (
                dedupedDocuments.map((document, ind) => (
                  <div
                    key={document.document_id}
                    className={
                      ind === dedupedDocuments.length - 1
                        ? "mb-5"
                        : "mb-3 border-b border-border-light"
                    }
                  >
                    <ChatDocumentDisplay
                      document={document}
                      setPopup={setPopup}
                      queryEventId={null}
                      isAIPick={false}
                      isSelected={selectedDocumentIds.includes(
                        document.document_id
                      )}
                      handleSelect={(documentId) => {
                        toggleDocumentSelection(
                          dedupedDocuments.find(
                            (document) => document.document_id === documentId
                          )!
                        );
                      }}
                      tokenLimitReached={tokenLimitReached}
                    />
                  </div>
                ))
              ) : (
                <div className="mx-3">
                  <Text>No documents found for the query.</Text>
                </div>
              )}
            </div>
          </div>
        ) : (
          !isLoading && (
            <div className="ml-4 mr-3">
              <Text>
                When you run ask a question, the retrieved documents will show
                up here!
              </Text>
            </div>
          )
        )}
      </div>

      <div className="mb-4 flex flex-col overflow-y-hidden border-t border-border pt-4 text-sm">
        <div className="flex border-b border-border px-3">
          <div className="flex">
            <SectionHeader name="Selected Documents" icon={FiFileText} />

            {tokenLimitReached && (
              <div className="my-auto ml-2">
                <div className="mb-2">
                  <HoverPopup
                    mainContent={
                      <FiAlertTriangle
                        className="my-auto text-alert"
                        size="16"
                      />
                    }
                    popupContent={
                      <Text className="w-40">
                        Over LLM context length by:{" "}
                        <i>{selectedDocumentTokens - maxTokens} tokens</i>
                        <br />
                        <br />
                        {selectedDocuments && selectedDocuments.length > 0 && (
                          <>
                            Truncating: &quot;
                            <i>
                              {
                                selectedDocuments[selectedDocuments.length - 1]
                                  .semantic_identifier
                              }
                            </i>
                            &quot;
                          </>
                        )}
                      </Text>
                    }
                    direction="left"
                  />
                </div>
              </div>
            )}
          </div>

          {selectedDocuments && selectedDocuments.length > 0 && (
            <div className="my-auto ml-auto" onClick={clearSelectedDocuments}>
              <BasicSelectable selected={false}>De-Select All</BasicSelectable>
            </div>
          )}
        </div>

        {selectedDocuments && selectedDocuments.length > 0 ? (
          <div className="dark-scrollbar flex max-h-full flex-col gap-y-2 overflow-y-auto px-3 py-3">
            {selectedDocuments.map((document) => (
              <SelectedDocumentDisplay
                key={document.document_id}
                document={document}
                handleDeselect={(documentId) => {
                  toggleDocumentSelection(
                    dedupedDocuments.find(
                      (document) => document.document_id === documentId
                    )!
                  );
                }}
              />
            ))}
          </div>
        ) : (
          !isLoading && (
            <Text className="mx-3 py-3">
              Select documents from the retrieved documents section to chat
              specifically with them!
            </Text>
          )
        )}
      </div>
    </div>
  );
}
