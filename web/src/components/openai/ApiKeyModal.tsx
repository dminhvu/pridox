"use client";

import { useState, useEffect } from "react";
import { ApiKeyForm } from "./ApiKeyForm";
import { Modal } from "../Modal";
import { Text } from "@tremor/react";

export const ApiKeyModal = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/manage/admin/genai-api-key/validate", {
      method: "HEAD",
      credentials: "include",
    }).then((res) => {
      // show popup if either the API key is not set or the API key is invalid
      if (!res.ok && (res.status === 404 || res.status === 400)) {
        setIsOpen(true);
      }
    });
  }, []);

  if (isOpen === false) {
    return null;
  }

  return (
    <Modal
      className="max-w-4xl rounded-xl"
      onOutsideClick={() => setIsOpen(false)}
    >
      <div className="p-5">
        <h2 className="mb-2.5 text-center text-2xl font-bold">
          Set up your OpenAI API key
        </h2>
        <Text className="mb-2.5">
          Welcome to Pridox! To start using the OpenAI API, you need to set up
          your API key. You can sign up for an API key{" "}
          <a
            href="https://platform.openai.com/signup/"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-link underline"
          >
            here
          </a>{" "}
          if you don&apos;t have one.
        </Text>
        <ApiKeyForm
          handleResponse={(response) => {
            if (response.ok) {
              setIsOpen(false);
            }
          }}
        />
      </div>
    </Modal>
  );
};
