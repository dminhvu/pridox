"use client";

import { Persona } from "@/app/admin/personas/interfaces";
import { computeAvailableFilters } from "@/lib/filters";
import { useFilters, useObjectState } from "@/lib/hooks";
import { CancellationToken, cancellable } from "@/lib/search/cancellable";
import {
  FlowType,
  PridoxDocument,
  Quote,
  SearchDefaultOverrides,
  SearchRequestOverrides,
  SearchResponse,
  SearchType,
  ValidQuestionResponse,
} from "@/lib/search/interfaces";
import { searchRequestStreamed } from "@/lib/search/streamingQa";
import { questionValidationStreamed } from "@/lib/search/streamingQuestionValidation";
import { Connector, DocumentSet, Tag } from "@/lib/types";
import { useRef, useState } from "react";
import { PersonaSelector } from "./PersonaSelector";
import { SearchBar } from "./SearchBar";
import { SearchHelper } from "./SearchHelper";
import { SearchResultsDisplay } from "./SearchResultsDisplay";

const SEARCH_DEFAULT_OVERRIDES_START: SearchDefaultOverrides = {
  forceDisplayQA: false,
  offset: 0,
};

const VALID_QUESTION_RESPONSE_DEFAULT: ValidQuestionResponse = {
  reasoning: null,
  answerable: null,
  error: null,
};

interface SearchSectionProps {
  connectors: Connector<any>[];
  documentSets: DocumentSet[];
  personas: Persona[];
  tags: Tag[];
  defaultSearchType: SearchType;
}

export const SearchSection = ({
  connectors,
  documentSets,
  personas,
  tags,
  defaultSearchType,
}: SearchSectionProps) => {
  // Search Bar
  const [query, setQuery] = useState<string>("");

  // Search
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(
    null
  );
  const [isFetching, setIsFetching] = useState(false);

  const [validQuestionResponse, setValidQuestionResponse] =
    useObjectState<ValidQuestionResponse>(VALID_QUESTION_RESPONSE_DEFAULT);

  // Search Type
  const [selectedSearchType, setSelectedSearchType] =
    useState<SearchType>(defaultSearchType);

  const [selectedPersona, setSelectedPersona] = useState<number>(
    personas[0]?.id || 0
  );

  // Filters
  const filterManager = useFilters();
  const availableSources = connectors.map((connector) => connector.source);
  const [finalAvailableSources, finalAvailableDocumentSets] =
    computeAvailableFilters({
      selectedPersona: personas.find(
        (persona) => persona.id === selectedPersona
      ),
      availableSources: availableSources,
      availableDocumentSets: documentSets,
    });

  // Overrides for default behavior that only last a single query
  const [defaultOverrides, setDefaultOverrides] =
    useState<SearchDefaultOverrides>(SEARCH_DEFAULT_OVERRIDES_START);

  // Helpers
  const initialSearchResponse: SearchResponse = {
    answer: null,
    quotes: null,
    documents: null,
    suggestedSearchType: null,
    suggestedFlowType: null,
    selectedDocIndices: null,
    error: null,
    messageId: null,
  };
  const updateCurrentAnswer = (answer: string) =>
    setSearchResponse((prevState) => ({
      ...(prevState || initialSearchResponse),
      answer,
    }));
  const updateQuotes = (quotes: Quote[]) =>
    setSearchResponse((prevState) => ({
      ...(prevState || initialSearchResponse),
      quotes,
    }));
  const updateDocs = (documents: PridoxDocument[]) =>
    setSearchResponse((prevState) => ({
      ...(prevState || initialSearchResponse),
      documents,
    }));
  const updateSuggestedSearchType = (suggestedSearchType: SearchType) =>
    setSearchResponse((prevState) => ({
      ...(prevState || initialSearchResponse),
      suggestedSearchType,
    }));
  const updateSuggestedFlowType = (suggestedFlowType: FlowType) =>
    setSearchResponse((prevState) => ({
      ...(prevState || initialSearchResponse),
      suggestedFlowType,
    }));
  const updateSelectedDocIndices = (docIndices: number[]) =>
    setSearchResponse((prevState) => ({
      ...(prevState || initialSearchResponse),
      selectedDocIndices: docIndices,
    }));
  const updateError = (error: FlowType) =>
    setSearchResponse((prevState) => ({
      ...(prevState || initialSearchResponse),
      error,
    }));
  const updateMessageId = (messageId: number) =>
    setSearchResponse((prevState) => ({
      ...(prevState || initialSearchResponse),
      messageId,
    }));

  let lastSearchCancellationToken = useRef<CancellationToken | null>(null);
  const onSearch = async ({
    searchType,
    offset,
  }: SearchRequestOverrides = {}) => {
    // cancel the prior search if it hasn't finished
    if (lastSearchCancellationToken.current) {
      lastSearchCancellationToken.current.cancel();
    }
    lastSearchCancellationToken.current = new CancellationToken();

    setIsFetching(true);
    setSearchResponse(initialSearchResponse);
    setValidQuestionResponse(VALID_QUESTION_RESPONSE_DEFAULT);

    const searchFnArgs = {
      query,
      sources: filterManager.selectedSources,
      documentSets: filterManager.selectedDocumentSets,
      timeRange: filterManager.timeRange,
      tags: filterManager.selectedTags,
      persona: personas.find(
        (persona) => persona.id === selectedPersona
      ) as Persona,
      updateCurrentAnswer: cancellable({
        cancellationToken: lastSearchCancellationToken.current,
        fn: updateCurrentAnswer,
      }),
      updateQuotes: cancellable({
        cancellationToken: lastSearchCancellationToken.current,
        fn: updateQuotes,
      }),
      updateDocs: cancellable({
        cancellationToken: lastSearchCancellationToken.current,
        fn: updateDocs,
      }),
      updateSuggestedSearchType: cancellable({
        cancellationToken: lastSearchCancellationToken.current,
        fn: updateSuggestedSearchType,
      }),
      updateSuggestedFlowType: cancellable({
        cancellationToken: lastSearchCancellationToken.current,
        fn: updateSuggestedFlowType,
      }),
      updateSelectedDocIndices: cancellable({
        cancellationToken: lastSearchCancellationToken.current,
        fn: updateSelectedDocIndices,
      }),
      updateError: cancellable({
        cancellationToken: lastSearchCancellationToken.current,
        fn: updateError,
      }),
      updateMessageId: cancellable({
        cancellationToken: lastSearchCancellationToken.current,
        fn: updateMessageId,
      }),
      selectedSearchType: searchType ?? selectedSearchType,
      offset: offset ?? defaultOverrides.offset,
    };

    const questionValidationArgs = {
      query,
      update: setValidQuestionResponse,
    };

    await Promise.all([
      searchRequestStreamed(searchFnArgs),
      questionValidationStreamed(questionValidationArgs),
    ]);

    setIsFetching(false);
  };

  return (
    <div className="relative mx-auto max-w-[2000px] xl:max-w-[1430px]">
      <div className="absolute left-0 hidden w-52 2xl:block 3xl:w-64">
        {/* {(connectors.length > 0 || documentSets.length > 0) && (
          <SourceSelector
            {...filterManager}
            availableDocumentSets={finalAvailableDocumentSets}
            existingSources={finalAvailableSources}
            availableTags={tags}
          />
        )} */}

        <div className="mt-10 pr-5">
          <SearchHelper
            isFetching={isFetching}
            searchResponse={searchResponse}
            selectedSearchType={selectedSearchType}
            setSelectedSearchType={setSelectedSearchType}
            defaultOverrides={defaultOverrides}
            restartSearch={onSearch}
            forceQADisplay={() =>
              setDefaultOverrides((prevState) => ({
                ...(prevState || SEARCH_DEFAULT_OVERRIDES_START),
                forceDisplayQA: true,
              }))
            }
            setOffset={(offset) => {
              setDefaultOverrides((prevState) => ({
                ...(prevState || SEARCH_DEFAULT_OVERRIDES_START),
                offset,
              }));
            }}
          />
        </div>
      </div>
      <div className="mx-auto w-[720px] 3xl:w-[800px]">
        {personas.length > 0 ? (
          <div className="mb-2 flex w-fit">
            <PersonaSelector
              personas={personas}
              selectedPersonaId={selectedPersona}
              onPersonaChange={(persona) => setSelectedPersona(persona.id)}
            />
          </div>
        ) : (
          <div className="pt-3" />
        )}

        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={async () => {
            setDefaultOverrides(SEARCH_DEFAULT_OVERRIDES_START);
            await onSearch({ offset: 0 });
          }}
        />

        <div className="mt-2">
          <SearchResultsDisplay
            searchResponse={searchResponse}
            validQuestionResponse={validQuestionResponse}
            isFetching={isFetching}
            defaultOverrides={defaultOverrides}
            personaName={
              selectedPersona
                ? personas.find((p) => p.id === selectedPersona)?.name
                : null
            }
          />
        </div>
      </div>
    </div>
  );
};
