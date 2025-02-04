import { Persona, Prompt } from "./interfaces";

interface PersonaCreationRequest {
  name: string;
  description: string;
  system_prompt: string;
  task_prompt: string;
  document_set_ids: number[];
  num_chunks: number | null;
  include_citations: boolean;
  llm_relevance_filter: boolean | null;
  llm_model_version_override: string | null;
}

interface PersonaUpdateRequest {
  id: number;
  existingPromptId: number | undefined;
  name: string;
  description: string;
  system_prompt: string;
  task_prompt: string;
  document_set_ids: number[];
  num_chunks: number | null;
  include_citations: boolean;
  llm_relevance_filter: boolean | null;
  llm_model_version_override: string | null;
}

function promptNameFromPersonaName(personaName: string) {
  return `default-prompt__${personaName}`;
}

function createPrompt({
  personaName,
  systemPrompt,
  taskPrompt,
  includeCitations,
}: {
  personaName: string;
  systemPrompt: string;
  taskPrompt: string;
  includeCitations: boolean;
}) {
  return fetch("/api/prompt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      name: promptNameFromPersonaName(personaName),
      description: `Default prompt for persona ${personaName}`,
      shared: true,
      system_prompt: systemPrompt,
      task_prompt: taskPrompt,
      include_citations: includeCitations,
    }),
  });
}

function updatePrompt({
  promptId,
  personaName,
  systemPrompt,
  taskPrompt,
  includeCitations,
}: {
  promptId: number;
  personaName: string;
  systemPrompt: string;
  taskPrompt: string;
  includeCitations: boolean;
}) {
  return fetch(`/api/prompt/${promptId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      name: promptNameFromPersonaName(personaName),
      description: `Default prompt for persona ${personaName}`,
      shared: true,
      system_prompt: systemPrompt,
      task_prompt: taskPrompt,
      include_citations: includeCitations,
    }),
  });
}

function buildPersonaAPIBody(
  creationRequest: PersonaCreationRequest | PersonaUpdateRequest,
  promptId: number
) {
  const {
    name,
    description,
    document_set_ids,
    num_chunks,
    llm_relevance_filter,
  } = creationRequest;

  return {
    name,
    description,
    shared: true,
    num_chunks,
    llm_relevance_filter,
    llm_filter_extraction: false,
    recency_bias: "base_decay",
    prompt_ids: [promptId],
    document_set_ids,
    llm_model_version_override: creationRequest.llm_model_version_override,
  };
}

export async function createPersona(
  personaCreationRequest: PersonaCreationRequest
): Promise<[Response, Response | null]> {
  // first create prompt
  const createPromptResponse = await createPrompt({
    personaName: personaCreationRequest.name,
    systemPrompt: personaCreationRequest.system_prompt,
    taskPrompt: personaCreationRequest.task_prompt,
    includeCitations: personaCreationRequest.include_citations,
  });
  const promptId = createPromptResponse.ok
    ? (await createPromptResponse.json()).id
    : null;

  const createPersonaResponse =
    promptId !== null
      ? await fetch("/api/admin/persona", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(
            buildPersonaAPIBody(personaCreationRequest, promptId)
          ),
        })
      : null;

  return [createPromptResponse, createPersonaResponse];
}

export async function updatePersona(
  personaUpdateRequest: PersonaUpdateRequest
): Promise<[Response, Response | null]> {
  const { id, existingPromptId } = personaUpdateRequest;

  // first update prompt
  let promptResponse;
  let promptId;
  if (existingPromptId !== undefined) {
    promptResponse = await updatePrompt({
      promptId: existingPromptId,
      personaName: personaUpdateRequest.name,
      systemPrompt: personaUpdateRequest.system_prompt,
      taskPrompt: personaUpdateRequest.task_prompt,
      includeCitations: personaUpdateRequest.include_citations,
    });
    promptId = existingPromptId;
  } else {
    promptResponse = await createPrompt({
      personaName: personaUpdateRequest.name,
      systemPrompt: personaUpdateRequest.system_prompt,
      taskPrompt: personaUpdateRequest.task_prompt,
      includeCitations: personaUpdateRequest.include_citations,
    });
    promptId = promptResponse.ok ? (await promptResponse.json()).id : null;
  }

  const updatePersonaResponse =
    promptResponse.ok && promptId
      ? await fetch(`/api/admin/persona/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(
            buildPersonaAPIBody(personaUpdateRequest, promptId)
          ),
        })
      : null;

  return [promptResponse, updatePersonaResponse];
}

export function deletePersona(personaId: number) {
  return fetch(`/api/admin/persona/${personaId}`, {
    method: "DELETE",
    credentials: "include",
  });
}

export function buildFinalPrompt(
  systemPrompt: string,
  taskPrompt: string,
  retrievalDisabled: boolean
) {
  let queryString = Object.entries({
    system_prompt: systemPrompt,
    task_prompt: taskPrompt,
    retrieval_disabled: retrievalDisabled,
  })
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  return fetch(`/api/persona/utils/prompt-explorer?${queryString}`, {
    credentials: "include",
  });
}

function smallerNumberFirstComparator(a: number, b: number) {
  return a > b ? 1 : -1;
}

export function personaComparator(a: Persona, b: Persona) {
  if (a.display_priority === null && b.display_priority === null) {
    return smallerNumberFirstComparator(a.id, b.id);
  }

  if (a.display_priority !== b.display_priority) {
    if (a.display_priority === null) {
      return 1;
    }
    if (b.display_priority === null) {
      return -1;
    }

    return smallerNumberFirstComparator(a.display_priority, b.display_priority);
  }

  return smallerNumberFirstComparator(a.id, b.id);
}
