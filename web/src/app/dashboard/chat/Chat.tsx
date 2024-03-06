"use client";

import { useEffect, useRef, useState } from "react";
import { FiStopCircle } from "react-icons/fi";
import { AIMessage, HumanMessage } from "./message/Messages";
import { AnswerPiecePacket, PridoxDocument } from "@/lib/search/interfaces";
import {
  BackendChatSession,
  BackendMessage,
  DocumentsResponse,
  Message,
  RetrievalType,
  StreamingError,
} from "./interfaces";
import { useRouter } from "next/navigation";
import { FeedbackType } from "./types";
import {
  createChatSession,
  getCitedDocumentsFromMessage,
  getHumanAndAIMessageFromMessageNumber,
  getLastSuccessfulMessageId,
  handleAutoScroll,
  handleChatFeedback,
  nameChatSession,
  processRawChatHistory,
  sendMessage,
} from "./lib";
import { ThreeDots } from "react-loader-spinner";
import { FeedbackModal } from "./modal/FeedbackModal";
import { DocumentSidebar } from "./documentSidebar/DocumentSidebar";
import { Persona } from "@/app/admin/personas/interfaces";
import { useFilters } from "@/lib/hooks";
import { DocumentSet, Tag, ValidSources } from "@/lib/types";
import { buildFilters } from "@/lib/search/utils";
import { usePopup } from "@/components/admin/connectors/Popup";
import { ResizableSection } from "@/components/resizable/ResizableSection";
import { PridoxInitializingLoader } from "@/components/PridoxInitializingLoader";
import { ChatIntro } from "./ChatIntro";
import { HEADER_PADDING } from "@/lib/constants";
import { computeAvailableFilters } from "@/lib/filters";
import { useDocumentSelection } from "./useDocumentSelection";

const MAX_INPUT_HEIGHT = 200;

export const Chat = ({
  existingChatSessionId,
  existingChatSessionPersonaId,
  availableSources,
  availableDocumentSets,
  availablePersonas,
  availableTags,
  defaultSelectedPersonaId,
  documentSidebarInitialWidth,
  shouldhideBeforeScroll,
}: {
  existingChatSessionId: number | null;
  existingChatSessionPersonaId: number | undefined;
  availableSources: ValidSources[];
  availableDocumentSets: DocumentSet[];
  availablePersonas: Persona[];
  availableTags: Tag[];
  defaultSelectedPersonaId?: number; // what persona to default to
  documentSidebarInitialWidth?: number;
  shouldhideBeforeScroll?: boolean;
}) => {
  const router = useRouter();
  const { popup, setPopup } = usePopup();

  // fetch messages for the chat session
  const [isFetchingChatMessages, setIsFetchingChatMessages] = useState(
    existingChatSessionId !== null
  );

  // needed so closures (e.g. onSubmit) can access the current value
  const urlChatSessionId = useRef<number | null>();
  // this is triggered every time the user switches which chat
  // session they are using
  useEffect(() => {
    urlChatSessionId.current = existingChatSessionId;

    textareaRef.current?.focus();

    // only clear things if we're going from one chat session to another
    if (chatSessionId !== null && existingChatSessionId !== chatSessionId) {
      // de-select documents
      clearSelectedDocuments();
      // reset all filters
      filterManager.setSelectedDocumentSets([]);
      filterManager.setSelectedSources([]);
      filterManager.setSelectedTags([]);
      filterManager.setTimeRange(null);
      if (isStreaming) {
        setIsCancelled(true);
      }
    }

    setChatSessionId(existingChatSessionId);

    async function initialSessionFetch() {
      if (existingChatSessionId === null) {
        setIsFetchingChatMessages(false);
        if (defaultSelectedPersonaId !== undefined) {
          setSelectedPersona(
            availablePersonas.find(
              (persona) => persona.id === defaultSelectedPersonaId
            )
          );
        } else {
          setSelectedPersona(undefined);
        }
        setMessageHistory([]);
        return;
      }

      setIsFetchingChatMessages(true);
      const response = await fetch(
        `/api/chat/get-chat-session/${existingChatSessionId}`,
        {
          credentials: "include",
        }
      );
      const chatSession = (await response.json()) as BackendChatSession;
      setSelectedPersona(
        availablePersonas.find(
          (persona) => persona.id === chatSession.persona_id
        )
      );
      const newMessageHistory = processRawChatHistory(chatSession.messages);
      setMessageHistory(newMessageHistory);

      const latestMessageId =
        newMessageHistory[newMessageHistory.length - 1]?.messageId;
      setSelectedMessageForDocDisplay(
        latestMessageId !== undefined ? latestMessageId : null
      );

      setIsFetchingChatMessages(false);
    }

    initialSessionFetch();
  }, [existingChatSessionId]);

  const [chatSessionId, setChatSessionId] = useState<number | null>(
    existingChatSessionId
  );
  const [message, setMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // for document display
  // NOTE: -1 is a special designation that means the latest AI message
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] =
    useState<number | null>(null);
  const { aiMessage } = selectedMessageForDocDisplay
    ? getHumanAndAIMessageFromMessageNumber(
        messageHistory,
        selectedMessageForDocDisplay
      )
    : { aiMessage: null };

  const [selectedPersona, setSelectedPersona] = useState<Persona | undefined>(
    existingChatSessionPersonaId !== undefined
      ? availablePersonas.find(
          (persona) => persona.id === existingChatSessionPersonaId
        )
      : defaultSelectedPersonaId !== undefined
        ? availablePersonas.find(
            (persona) => persona.id === defaultSelectedPersonaId
          )
        : undefined
  );
  const livePersona = selectedPersona || availablePersonas[0];

  useEffect(() => {
    if (messageHistory.length === 0) {
      setSelectedPersona(
        availablePersonas.find(
          (persona) => persona.id === defaultSelectedPersonaId
        )
      );
    }
  }, [defaultSelectedPersonaId]);

  const [
    selectedDocuments,
    toggleDocumentSelection,
    clearSelectedDocuments,
    selectedDocumentTokens,
  ] = useDocumentSelection();
  // just choose a conservative default, this will be updated in the
  // background on initial load / on persona change
  const [maxTokens, setMaxTokens] = useState<number>(4096);
  // fetch # of allowed document tokens for the selected Persona
  useEffect(() => {
    async function fetchMaxTokens() {
      const response = await fetch(
        `/api/chat/max-selected-document-tokens?persona_id=${livePersona.id}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const maxTokens = (await response.json()).max_tokens as number;
        setMaxTokens(maxTokens);
      }
    }

    fetchMaxTokens();
  }, [livePersona]);

  const filterManager = useFilters();
  const [finalAvailableSources, finalAvailableDocumentSets] =
    computeAvailableFilters({
      selectedPersona,
      availableSources,
      availableDocumentSets,
    });

  // state for cancelling streaming
  const [isCancelled, setIsCancelled] = useState(false);
  const isCancelledRef = useRef(isCancelled);
  useEffect(() => {
    isCancelledRef.current = isCancelled;
  }, [isCancelled]);

  const [currentFeedback, setCurrentFeedback] = useState<
    [FeedbackType, number] | null
  >(null);

  // auto scroll as message comes out
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isStreaming || !message) {
      handleAutoScroll(endDivRef, scrollableDivRef);
    }
  });

  // scroll to bottom initially
  const [hasPerformedInitialScroll, setHasPerformedInitialScroll] = useState(
    shouldhideBeforeScroll !== true
  );
  useEffect(() => {
    endDivRef.current?.scrollIntoView();
    setHasPerformedInitialScroll(true);
  }, [isFetchingChatMessages]);

  // handle re-sizing of the text area
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "0px";
      textarea.style.height = `${Math.min(
        textarea.scrollHeight,
        MAX_INPUT_HEIGHT
      )}px`;
    }
  }, [message]);

  // used for resizing of the document sidebar
  const masterFlexboxRef = useRef<HTMLDivElement>(null);
  const [maxDocumentSidebarWidth, setMaxDocumentSidebarWidth] = useState<
    number | null
  >(null);
  const adjustDocumentSidebarWidth = () => {
    if (masterFlexboxRef.current && document.documentElement.clientWidth) {
      // numbers below are based on the actual width the center section for different
      // screen sizes. `1700` corresponds to the custom "3xl" tailwind breakpoint
      // NOTE: some buffer is needed to account for scroll bars
      if (document.documentElement.clientWidth > 1700) {
        setMaxDocumentSidebarWidth(masterFlexboxRef.current.clientWidth - 950);
      } else if (document.documentElement.clientWidth > 1420) {
        setMaxDocumentSidebarWidth(masterFlexboxRef.current.clientWidth - 760);
      } else {
        setMaxDocumentSidebarWidth(masterFlexboxRef.current.clientWidth - 660);
      }
    }
  };
  useEffect(() => {
    adjustDocumentSidebarWidth(); // Adjust the width on initial render
    window.addEventListener("resize", adjustDocumentSidebarWidth); // Add resize event listener

    return () => {
      window.removeEventListener("resize", adjustDocumentSidebarWidth); // Cleanup the event listener
    };
  }, []);

  if (!documentSidebarInitialWidth && maxDocumentSidebarWidth) {
    documentSidebarInitialWidth = Math.min(700, maxDocumentSidebarWidth);
  }

  const onSubmit = async ({
    messageIdToResend,
    queryOverride,
    forceSearch,
  }: {
    messageIdToResend?: number;
    queryOverride?: string;
    forceSearch?: boolean;
  } = {}) => {
    let currChatSessionId: number;
    let isNewSession = chatSessionId === null;
    if (isNewSession) {
      currChatSessionId = await createChatSession(livePersona?.id || 0);
    } else {
      currChatSessionId = chatSessionId as number;
    }
    setChatSessionId(currChatSessionId);

    const messageToResend = messageHistory.find(
      (message) => message.messageId === messageIdToResend
    );
    const messageToResendIndex = messageToResend
      ? messageHistory.indexOf(messageToResend)
      : null;
    if (!messageToResend && messageIdToResend !== undefined) {
      setPopup({
        message:
          "Failed to re-send message - please refresh the page and try again.",
        type: "error",
      });
      return;
    }

    const currMessage = messageToResend ? messageToResend.message : message;
    const currMessageHistory =
      messageToResendIndex !== null
        ? messageHistory.slice(0, messageToResendIndex)
        : messageHistory;
    setMessageHistory([
      ...currMessageHistory,
      {
        messageId: 0,
        message: currMessage,
        type: "user",
      },
    ]);
    setMessage("");

    setIsStreaming(true);
    let answer = "";
    let query: string | null = null;
    let retrievalType: RetrievalType =
      selectedDocuments.length > 0
        ? RetrievalType.SelectedDocs
        : RetrievalType.None;
    let documents: PridoxDocument[] = selectedDocuments;
    let error: string | null = null;
    let finalMessage: BackendMessage | null = null;
    try {
      const lastSuccessfulMessageId =
        getLastSuccessfulMessageId(currMessageHistory);
      for await (const packetBunch of sendMessage({
        message: currMessage,
        parentMessageId: lastSuccessfulMessageId,
        chatSessionId: currChatSessionId,
        promptId: selectedPersona?.prompts[0]?.id || 0,
        filters: buildFilters(
          filterManager.selectedSources,
          filterManager.selectedDocumentSets,
          filterManager.timeRange,
          filterManager.selectedTags
        ),
        selectedDocumentIds: selectedDocuments
          .filter(
            (document) =>
              document.db_doc_id !== undefined && document.db_doc_id !== null
          )
          .map((document) => document.db_doc_id as number),
        queryOverride,
        forceSearch,
      })) {
        for (const packet of packetBunch) {
          if (Object.hasOwn(packet, "answer_piece")) {
            answer += (packet as AnswerPiecePacket).answer_piece;
          } else if (Object.hasOwn(packet, "top_documents")) {
            documents = (packet as DocumentsResponse).top_documents;
            query = (packet as DocumentsResponse).rephrased_query;
            retrievalType = RetrievalType.Search;
            if (documents && documents.length > 0) {
              // point to the latest message (we don't know the messageId yet, which is why
              // we have to use -1)
              setSelectedMessageForDocDisplay(-1);
            }
          } else if (Object.hasOwn(packet, "error")) {
            error = (packet as StreamingError).error;
          } else if (Object.hasOwn(packet, "message_id")) {
            finalMessage = packet as BackendMessage;
          }
        }
        setMessageHistory([
          ...currMessageHistory,
          {
            messageId: finalMessage?.parent_message || null,
            message: currMessage,
            type: "user",
          },
          {
            messageId: finalMessage?.message_id || null,
            message: error || answer,
            type: error ? "error" : "assistant",
            retrievalType,
            query: finalMessage?.rephrased_query || query,
            documents: finalMessage?.context_docs?.top_documents || documents,
            citations: finalMessage?.citations || {},
          },
        ]);
        if (isCancelledRef.current) {
          setIsCancelled(false);
          break;
        }
      }
    } catch (e: any) {
      const errorMsg = e.message;
      setMessageHistory([
        ...currMessageHistory,
        {
          messageId: null,
          message: currMessage,
          type: "user",
        },
        {
          messageId: null,
          message: errorMsg,
          type: "error",
        },
      ]);
    }
    setIsStreaming(false);
    if (isNewSession) {
      if (finalMessage) {
        setSelectedMessageForDocDisplay(finalMessage.message_id);
      }
      await nameChatSession(currChatSessionId, currMessage);

      // NOTE: don't switch pages if the user has navigated away from the chat
      if (
        currChatSessionId === urlChatSessionId.current ||
        urlChatSessionId.current === null
      ) {
        router.push(`/dashboard/chat?chatId=${currChatSessionId}`, {
          scroll: false,
        });
      }
    }
    if (
      finalMessage?.context_docs &&
      finalMessage.context_docs.top_documents.length > 0 &&
      retrievalType === RetrievalType.Search
    ) {
      setSelectedMessageForDocDisplay(finalMessage.message_id);
    }
  };

  const onFeedback = async (
    messageId: number,
    feedbackType: FeedbackType,
    feedbackDetails: string
  ) => {
    if (chatSessionId === null) {
      return;
    }

    const response = await handleChatFeedback(
      messageId,
      feedbackType,
      feedbackDetails
    );

    if (response.ok) {
      setPopup({
        message: "Thanks for your feedback!",
        type: "success",
      });
    } else {
      const responseJson = await response.json();
      const errorMsg = responseJson.detail || responseJson.message;
      setPopup({
        message: `Failed to submit feedback - ${errorMsg}`,
        type: "error",
      });
    }
  };

  return (
    <div className="flex w-full  overflow-x-hidden" ref={masterFlexboxRef}>
      {popup}
      {currentFeedback && (
        <FeedbackModal
          feedbackType={currentFeedback[0]}
          onClose={() => setCurrentFeedback(null)}
          onSubmit={(feedbackDetails) => {
            onFeedback(currentFeedback[1], currentFeedback[0], feedbackDetails);
            setCurrentFeedback(null);
          }}
        />
      )}

      {documentSidebarInitialWidth !== undefined ? (
        <>
          <div className="h-screen w-full pb-[140px] pt-[100px] sm:relative">
            <div
              className={`h-full w-full ${HEADER_PADDING} relative flex flex-col overflow-y-auto overflow-x-hidden`}
              ref={scrollableDivRef}
            >
              {/* {livePersona && (
                <div className="sticky top-0 left-80 z-10 w-full bg-background/90">
                  <div className="ml-2 p-1 rounded mt-2 w-fit">
                    <ChatPersonaSelector
                      personas={availablePersonas}
                      selectedPersonaId={livePersona.id}
                      onPersonaChange={(persona) => {
                        if (persona) {
                          setSelectedPersona(persona);
                          router.push(`/chat?personaId=${persona.id}`);
                        }
                      }}
                    />
                  </div>
                </div>
              )} */}

              {/* <Button className="ml-4 bg-[linear-gradient(15deg,#7C3AED_26.3%,#6C1AF7_86.4%)] ">
                <AddDocumentsIcon size={20} className="mr-2 " />
                Add documents
              </Button> */}
              {messageHistory.length === 0 &&
                !isFetchingChatMessages &&
                !isStreaming && (
                  <ChatIntro
                    availableSources={finalAvailableSources}
                    availablePersonas={availablePersonas}
                    selectedPersona={selectedPersona}
                    handlePersonaSelect={(persona) => {
                      setSelectedPersona(persona);
                      router.push(`/dashboard/chat?personaId=${persona.id}`);
                    }}
                  />
                )}
              <div
                className={
                  "mx-8 mt-4 pt-12 sm:pt-0" +
                  (hasPerformedInitialScroll ? "" : " invisible")
                }
              >
                {messageHistory.map((message, i) => {
                  if (message.type === "user") {
                    return (
                      <div key={i}>
                        <HumanMessage content={message.message} />
                      </div>
                    );
                  } else if (message.type === "assistant") {
                    const isShowingRetrieved =
                      (selectedMessageForDocDisplay !== null &&
                        selectedMessageForDocDisplay === message.messageId) ||
                      (selectedMessageForDocDisplay === -1 &&
                        i === messageHistory.length - 1);
                    const previousMessage =
                      i !== 0 ? messageHistory[i - 1] : null;
                    return (
                      <div key={i}>
                        <AIMessage
                          messageId={message.messageId}
                          content={message.message}
                          query={messageHistory[i]?.query || undefined}
                          citedDocuments={getCitedDocumentsFromMessage(message)}
                          isComplete={
                            i !== messageHistory.length - 1 || !isStreaming
                          }
                          hasDocs={
                            (message.documents &&
                              message.documents.length > 0) === true
                          }
                          handleFeedback={
                            i === messageHistory.length - 1 && isStreaming
                              ? undefined
                              : (feedbackType) =>
                                  setCurrentFeedback([
                                    feedbackType,
                                    message.messageId as number,
                                  ])
                          }
                          handleSearchQueryEdit={
                            i === messageHistory.length - 1 && !isStreaming
                              ? (newQuery) => {
                                  if (!previousMessage) {
                                    setPopup({
                                      type: "error",
                                      message:
                                        "Cannot edit query of first message - please refresh the page and try again.",
                                    });
                                    return;
                                  }

                                  if (previousMessage.messageId === null) {
                                    setPopup({
                                      type: "error",
                                      message:
                                        "Cannot edit query of a pending message - please wait a few seconds and try again.",
                                    });
                                    return;
                                  }
                                  onSubmit({
                                    messageIdToResend:
                                      previousMessage.messageId,
                                    queryOverride: newQuery,
                                  });
                                }
                              : undefined
                          }
                          isCurrentlyShowingRetrieved={isShowingRetrieved}
                          handleShowRetrieved={(messageNumber) => {
                            if (isShowingRetrieved) {
                              setSelectedMessageForDocDisplay(null);
                            } else {
                              if (messageNumber !== null) {
                                setSelectedMessageForDocDisplay(messageNumber);
                              } else {
                                setSelectedMessageForDocDisplay(-1);
                              }
                            }
                          }}
                          handleForceSearch={() => {
                            if (previousMessage && previousMessage.messageId) {
                              onSubmit({
                                messageIdToResend: previousMessage.messageId,
                                forceSearch: true,
                              });
                            } else {
                              setPopup({
                                type: "error",
                                message:
                                  "Failed to force search - please refresh the page and try again.",
                              });
                            }
                          }}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div key={i}>
                        <AIMessage
                          messageId={message.messageId}
                          content={
                            <p className="my-auto text-sm text-red-700">
                              {message.message}
                            </p>
                          }
                        />
                      </div>
                    );
                  }
                })}

                {isStreaming &&
                  messageHistory.length &&
                  messageHistory[messageHistory.length - 1].type === "user" && (
                    <div key={messageHistory.length}>
                      <AIMessage
                        messageId={null}
                        content={
                          <div className="my-auto text-sm">
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
                        }
                      />
                    </div>
                  )}

                {/* Some padding at the bottom so the search bar has space at the bottom to not cover the last message*/}
                <div className={`min-h-[30px] w-full`}></div>

                <div ref={endDivRef} />
              </div>
            </div>

            <div className="absolute bottom-0  w-full bg-transparent ">
              <div className="w-full pb-4 pt-2">
                {/* <div className="flex">
                  <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar mx-auto px-4 pt-1 flex">
                    {selectedDocuments.length > 0 ? (
                      <SelectedDocuments
                        selectedDocuments={selectedDocuments}
                      />
                    ) : (
                      <ChatFilters
                        {...filterManager}
                        existingSources={finalAvailableSources}
                        availableDocumentSets={finalAvailableDocumentSets}
                        availableTags={availableTags}
                      />
                    )}
                  </div>
                </div> */}

                <div className="mx-auto mb-2 flex max-w-screen-lg justify-center py-2">
                  <div className="relative mx-auto flex w-full shrink items-center px-4 2xl:w-searchbar-sm 3xl:w-searchbar">
                    <textarea
                      ref={textareaRef}
                      autoFocus
                      className={`
                      flex
                      h-full
                      w-full
                      max-w-[682px]
                      shrink
                      overflow-hidden 
                      whitespace-nowrap 
                      rounded-full
                      border-[0.9px] 
                      border-solid
                      border-slate-200
                      px-5 
                      py-4
                      text-blue-950 
                      placeholder-gray-400 
                      outline-none
                    ${
                      (textareaRef?.current?.scrollHeight || 0) >
                      MAX_INPUT_HEIGHT
                        ? "overflow-y-auto"
                        : ""
                    } 
                    break-word 
                    resize-none
                    overscroll-contain
                    whitespace-normal
                    `}
                      style={{ scrollbarWidth: "thin" }}
                      role="textarea"
                      aria-multiline
                      placeholder="Ask me anything..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey &&
                          message &&
                          !isStreaming
                        ) {
                          onSubmit();
                          event.preventDefault();
                        }
                      }}
                      suppressContentEditableWarning={true}
                    />
                    <div className="flex w-fit">
                      <div
                        className={"cursor-pointer"}
                        onClick={() => {
                          if (!isStreaming) {
                            if (message) {
                              onSubmit();
                            }
                          } else {
                            setIsCancelled(true);
                          }
                        }}
                      >
                        {isStreaming ? (
                          <FiStopCircle
                            size={18}
                            className={
                              "h-9 w-9 rounded-lg p-2 text-emphasis hover:bg-hover"
                            }
                          />
                        ) : (
                          <button
                            className={
                              "ml-4 h-14 w-44 max-w-[178px] items-center justify-center whitespace-nowrap  rounded-full bg-[linear-gradient(15deg,#7C3AED_26.3%,#6C1AF7_86.4%)] text-sm font-medium leading-4 text-emphasis text-white shadow-xl " +
                              (message ? "bg-blue-200" : "")
                            }
                          >
                            Ask Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ResizableSection
            intialWidth={documentSidebarInitialWidth}
            minWidth={400}
            maxWidth={300 || undefined}
          >
            <DocumentSidebar
              selectedMessage={aiMessage}
              selectedDocuments={selectedDocuments}
              toggleDocumentSelection={toggleDocumentSelection}
              clearSelectedDocuments={clearSelectedDocuments}
              selectedDocumentTokens={selectedDocumentTokens}
              maxTokens={maxTokens}
              isLoading={isFetchingChatMessages}
            />
          </ResizableSection>
        </>
      ) : (
        <div className="mx-auto flex h-full flex-col">
          <div className="my-auto">
            <PridoxInitializingLoader />
          </div>
        </div>
      )}
    </div>
  );
};
