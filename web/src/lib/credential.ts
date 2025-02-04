import { CredentialBase } from "./types";

export async function createCredential(credential: CredentialBase<any>) {
  return await fetch(`/api/manage/credential`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credential),
  });
}

export async function adminDeleteCredential<T>(credentialId: number) {
  return await fetch(`/api/manage/admin/credential/${credentialId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
}

export async function deleteCredential<T>(credentialId: number) {
  return await fetch(`/api/manage/credential/${credentialId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
}

export function linkCredential(
  connectorId: number,
  credentialId: number,
  name?: string
) {
  return fetch(
    `/api/manage/connector/${connectorId}/credential/${credentialId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name || null }),
    }
  );
}
