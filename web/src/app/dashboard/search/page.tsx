import { SearchSection } from "@/components/search/SearchSection";
import { Header } from "@/components/Header";
import {
  AuthTypeMetadata,
  getAuthTypeMetadataSS,
  getCurrentUserSS,
} from "@/lib/userSS";
import { redirect } from "next/navigation";
import { HealthCheckBanner } from "@/components/health/healthcheck";
import { ApiKeyModal } from "@/components/openai/ApiKeyModal";
import { fetchSS } from "@/lib/utilsSS";
import { Connector, DocumentSet, Tag, User, ValidSources } from "@/lib/types";
import { cookies } from "next/headers";
import { SearchType } from "@/lib/search/interfaces";
import { Persona } from "@/app/admin/personas/interfaces";
import { WelcomeModal } from "@/components/WelcomeModal";
import { unstable_noStore as noStore } from "next/cache";
import { InstantSSRAutoRefresh } from "@/components/SSRAutoRefresh";
import { personaComparator } from "@/app/admin/personas/lib";
import {
  FullEmbeddingModelResponse,
  checkModelNameIsValid,
} from "@/app/admin/models/embedding/embeddingModels";
import { SwitchModelModal } from "@/components/SwitchModelModal";

export default async function Home() {
  // Disable caching so we always get the up to date connector / document set / persona info
  // importantly, this prevents users from adding a connector, going back to the main page,
  // and then getting hit with a "No Connectors" popup
  noStore();

  const tasks = [
    getAuthTypeMetadataSS(),
    getCurrentUserSS(),
    fetchSS("/manage/connector"),
    fetchSS("/manage/document-set"),
    fetchSS("/persona"),
    fetchSS("/query/valid-tags"),
    fetchSS("/secondary-index/get-embedding-models"),
  ];

  // catch cases where the backend is completely unreachable here
  // without try / catch, will just raise an exception and the page
  // will not render
  let results: (
    | User
    | Response
    | AuthTypeMetadata
    | FullEmbeddingModelResponse
    | null
  )[] = [null, null, null, null, null, null, null];
  try {
    results = await Promise.all(tasks);
  } catch (e) {
    console.log(`Some fetch failed for the main search page - ${e}`);
  }
  const authTypeMetadata = results[0] as AuthTypeMetadata | null;
  const user = results[1] as User | null;
  const connectorsResponse = results[2] as Response | null;
  const documentSetsResponse = results[3] as Response | null;
  const personaResponse = results[4] as Response | null;
  const tagsResponse = results[5] as Response | null;
  const embeddingModelResponse = results[6] as Response | null;

  if (!user) {
    return redirect("/");
  }

  let connectors: Connector<any>[] = [];
  if (connectorsResponse?.ok) {
    connectors = await connectorsResponse.json();
  } else {
    console.log(`Failed to fetch connectors - ${connectorsResponse?.status}`);
  }

  let documentSets: DocumentSet[] = [];
  if (documentSetsResponse?.ok) {
    documentSets = await documentSetsResponse.json();
  } else {
    console.log(
      `Failed to fetch document sets - ${documentSetsResponse?.status}`
    );
  }

  let personas: Persona[] = [];
  if (personaResponse?.ok) {
    personas = await personaResponse.json();
  } else {
    console.log(`Failed to fetch personas - ${personaResponse?.status}`);
  }
  // remove those marked as hidden by an admin
  personas = personas.filter((persona) => persona.is_visible);
  // sort them in priority order
  personas.sort(personaComparator);

  let tags: Tag[] = [];
  if (tagsResponse?.ok) {
    tags = (await tagsResponse.json()).tags;
  } else {
    console.log(`Failed to fetch tags - ${tagsResponse?.status}`);
  }

  const embeddingModelVersionInfo =
    embeddingModelResponse && embeddingModelResponse.ok
      ? ((await embeddingModelResponse.json()) as FullEmbeddingModelResponse)
      : null;
  const currentEmbeddingModelName =
    embeddingModelVersionInfo?.current_model_name;
  const nextEmbeddingModelName =
    embeddingModelVersionInfo?.secondary_model_name;
  console.log(embeddingModelVersionInfo);

  // needs to be done in a non-client side component due to nextjs
  const storedSearchType = cookies().get("searchType")?.value as
    | string
    | undefined;
  let searchTypeDefault: SearchType =
    storedSearchType !== undefined &&
    SearchType.hasOwnProperty(storedSearchType)
      ? (storedSearchType as SearchType)
      : SearchType.SEMANTIC; // default to semantic

  return (
    <>
      {connectors.length === 0 ? (
        <WelcomeModal embeddingModelName={currentEmbeddingModelName} />
      ) : (
        embeddingModelVersionInfo &&
        !checkModelNameIsValid(currentEmbeddingModelName) &&
        !nextEmbeddingModelName && (
          <SwitchModelModal embeddingModelName={currentEmbeddingModelName} />
        )
      )}

      <div className="flex min-h-screen flex-col items-center px-24 pt-10">
        <div className="w-full">
          <SearchSection
            connectors={connectors}
            documentSets={documentSets}
            personas={personas}
            tags={tags}
            defaultSearchType={searchTypeDefault}
          />
        </div>
      </div>
    </>
  );
}
