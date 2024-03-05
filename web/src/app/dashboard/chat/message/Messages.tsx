import {
  FiCheck,
  FiCopy,
  FiCpu,
  FiThumbsDown,
  FiThumbsUp,
  FiUser,
} from "react-icons/fi";
import { FeedbackType } from "../types";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { DanswerDocument } from "@/lib/search/interfaces";
import { SearchSummary, ShowHideDocsButton } from "./SearchSummary";
import { SourceIcon } from "@/components/SourceIcon";
import { ThreeDots } from "react-loader-spinner";
import { SkippedSearch } from "./SkippedSearch";
import { SelectedDocuments } from "../modifiers/SelectedDocuments";
import { ChatbotIcon, MeIcon } from "@/components/icons/icons";
export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
}> = ({ children, onClick }) => {
  return (
    <div
      className="hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const AIMessage = ({
  messageId,
  content,
  query,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
}: {
  messageId: number | null;
  content: string | JSX.Element;
  query?: string;
  citedDocuments?: [string, DanswerDocument][] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  return (
    <div className={"py-5 px-5 flex w-full "}>
      <div className="mx-auto w-full  3xl:w-searchbar relative">
        <div className="flex  ">
          <div className="flex h-fit">
            {/* <div className="flex p-1 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <FiCpu size={16} className="my-auto mx-auto" />
              </div>
            </div> */}
          <ChatbotIcon size={40} className="object-fit mr-6"></ChatbotIcon>
            {query === undefined &&
              hasDocs &&
              handleShowRetrieved !== undefined &&
              isCurrentlyShowingRetrieved !== undefined && (
                <div className="flex w-message-xs 2xl:w-message-sm 3xl:w-message-default absolute ml-8">
                  <div className="ml-auto">
                    <ShowHideDocsButton
                      messageId={messageId}
                      isCurrentlyShowingRetrieved={isCurrentlyShowingRetrieved}
                      handleShowRetrieved={handleShowRetrieved}
                    />
                  </div>
                </div>
              )}
          </div>

          <div className="w-full bg-white rounded-2xl shadow-2xl py-2 px-6 ">
            {query !== undefined &&
              handleShowRetrieved !== undefined &&
              isCurrentlyShowingRetrieved !== undefined && (
                <div className="my-1">
                  <SearchSummary
                    query={query}
                    hasDocs={hasDocs || false}
                    messageId={messageId}
                    isCurrentlyShowingRetrieved={isCurrentlyShowingRetrieved}
                    handleShowRetrieved={handleShowRetrieved}
                    handleSearchQueryEdit={handleSearchQueryEdit}
                  />
                </div>
              )}
            {handleForceSearch &&
              content &&
              query === undefined &&
              !hasDocs && (
                <div className="my-1">
                  <SkippedSearch handleForceSearch={handleForceSearch} />
                </div>
              )}

            {content ? (
              <>
                {typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  content
                )}
              </>
            ) : isComplete ? null : (
              <div className="text-sm my-auto">
                <ThreeDots
                  height="30"
                  width="50"
                  color="#3b82f6"
                  ariaLabel="grid-loading"
                  radius="12.5"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              </div>
            )}
            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments
                    .filter(([_, document]) => document.semantic_identifier)
                    .map(([citationKey, document], ind) => {
                      const display = (
                        <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
                          <div className="mr-1 my-auto">
                            <SourceIcon
                              sourceType={document.source_type}
                              iconSize={16}
                            />
                          </div>
                          [{citationKey}] {document!.semantic_identifier}
                        </div>
                      );
                      if (document.link) {
                        return (
                          <a
                            key={document.document_id}
                            href={document.link}
                            target="_blank"
                            className="cursor-pointer hover:bg-hover"
                          >
                            {display}
                          </a>
                        );
                      } else {
                        return (
                          <div
                            key={document.document_id}
                            className="cursor-default"
                          >
                            {display}
                          </div>
                        );
                      }
                    })}
                </div>
              </div>
            )}
          </div>
          {/* {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable
                onClick={() => {
                  navigator.clipboard.writeText(content.toString());
                  setCopyClicked(true);
                  setTimeout(() => setCopyClicked(false), 3000);
                }}
              >
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={() => handleFeedback("like")}>
                <FiThumbsUp />
              </Hoverable>
              <Hoverable>
                <FiThumbsDown onClick={() => handleFeedback("dislike")} />
              </Hoverable>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export const HumanMessage = ({
  content,
}: {
  content: string | JSX.Element;
}) => {
  return (
    <div className="py-5 px-5 flex w-full">
      <div className="w-full ">
        <div className="flex w-full ">
          {/* <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={16} className="my-auto mx-auto" />
              </div>
            </div>

          
          </div> */}
          <MeIcon size={40} className="object-cover mr-6"></MeIcon>

          <div className=" mt-1 w-full flex flex-wrap">
            <div className="w-full break-words whitespace-nowrap 
                      border-solid 
                      border-[0.9px] 
                      border-slate-200 
                      text-blue-950
                      rounded-2xl
                      py-2
                      px-6">
              {typeof content === "string" ? (
                <ReactMarkdown
                  className="prose max-w-full"
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        className="text-blue-500 hover:text-blue-700"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                content
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
