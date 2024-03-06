"use client";

import { Button, Text } from "@tremor/react";
import { Modal } from "./Modal";
import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";
import { checkModelNameIsValid } from "@/app/admin/models/embedding/embeddingModels";

export function WelcomeModal({
  embeddingModelName,
}: {
  embeddingModelName: undefined | null | string;
}) {
  const validModelSelected = checkModelNameIsValid(embeddingModelName);

  return (
    <Modal className="max-w-4xl">
      <div className="text-base">
        <h2 className="mb-4 flex border-b border-border pb-2 text-xl font-bold">
          Welcome to Pridox
        </h2>
        <div>
          <p>
            Your second brain is just a few steps away. We&apos;ll guide you
            through the process of setting up Pridox, so you can start searching
            all your organization&apos;s data in one place.
          </p>
        </div>
        <div className="mb-2 mt-8 flex">
          {validModelSelected && (
            <FiCheckCircle className="my-auto mr-2 text-success" />
          )}
          <Text className="font-bold">Step 1: Choose Your Embedding Model</Text>
        </div>
        {!validModelSelected && (
          <>
            To get started, the first step is to choose your{" "}
            <i>embedding model</i>. This machine learning model helps power
            Pridox&apos;s search. Different models have different strengths,
            but don&apos;t worry we&apos;ll guide you through the process of
            choosing the right one for your organization.
          </>
        )}
        <div className="mt-3 flex">
          <Link href="/admin/models/embedding">
            <Button size="xs">
              {validModelSelected
                ? "Change your Embedding Model"
                : "Choose your Embedding Model"}
            </Button>
          </Link>
        </div>
        <Text className="mb-2 mt-8 font-bold">
          Step 2: Add Your First Connector
        </Text>
        Next, we need to to configure some <i>connectors</i>. Connectors are the
        way that Pridox gets data from your organization&apos;s various data
        sources. Once setup, we&apos;ll automatically sync data from your apps
        and docs into Pridox, so you can search all through all of them in one
        place.
        <div className="mt-3 flex">
          <Link href="/admin/add-connector">
            <Button size="xs" disabled={!validModelSelected}>
              Setup your first connector!
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
