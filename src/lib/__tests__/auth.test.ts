// @vitest-environment node
import { test, expect, vi, afterEach } from "vitest";
import { SignJWT } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieGet = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: mockCookieGet }),
}));

import { getSession } from "@/lib/auth";

const TEST_SECRET = new TextEncoder().encode("development-secret-key");

async function signToken(payload: object, expiresIn = "7d") {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(TEST_SECRET);
}

afterEach(() => {
  vi.clearAllMocks();
});

test("getSession returns null when no cookie is present", async () => {
  mockCookieGet.mockReturnValue(undefined);
  expect(await getSession()).toBeNull();
});

test("getSession returns session payload for a valid token", async () => {
  const token = await signToken({ userId: "user-123", email: "test@example.com", expiresAt: new Date() });
  mockCookieGet.mockReturnValue({ value: token });

  const session = await getSession();
  expect(session?.userId).toBe("user-123");
  expect(session?.email).toBe("test@example.com");
});

test("getSession returns null for an expired token", async () => {
  const token = await signToken({ userId: "user-123", email: "test@example.com" }, "-1s");
  mockCookieGet.mockReturnValue({ value: token });

  expect(await getSession()).toBeNull();
});

test("getSession returns null for a malformed token", async () => {
  mockCookieGet.mockReturnValue({ value: "not.a.valid.token" });
  expect(await getSession()).toBeNull();
});

test("getSession returns null for a token signed with the wrong secret", async () => {
  const wrongSecret = new TextEncoder().encode("wrong-secret");
  const token = await new SignJWT({ userId: "user-123", email: "test@example.com" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(wrongSecret);
  mockCookieGet.mockReturnValue({ value: token });

  expect(await getSession()).toBeNull();
});
