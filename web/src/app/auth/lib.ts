export async function requestEmailVerification(email: string) {
  return await fetch("/api/auth/request-verify-token", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify({
      email: email,
    }),
  });
}
