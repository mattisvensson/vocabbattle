"use client";

import type { Action, GameView } from "./game";

const tokenKey = (code: string) => `vokabattle-token-${code.toUpperCase()}`;

export function getToken(code: string) {
  return typeof window === "undefined" ? null : localStorage.getItem(tokenKey(code));
}

export function saveToken(code: string, token: string) {
  localStorage.setItem(tokenKey(code), token);
}

export function loadProfile(): { name: string; avatar: string } | null {
  try {
    return JSON.parse(localStorage.getItem("vokabattle-profile") ?? "null");
  } catch {
    return null;
  }
}

export function saveProfile(name: string, avatar: string) {
  localStorage.setItem("vokabattle-profile", JSON.stringify({ name, avatar }));
}

async function call<T>(url: string, init: RequestInit & { token?: string | null } = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      ...(init.token ? { "x-player-token": init.token } : {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error ?? "Fehler"), { status: res.status });
  return data as T;
}

export function createRoom(name: string, avatar: string) {
  return call<{ code: string; token: string }>("/api/rooms", {
    method: "POST",
    body: JSON.stringify({ name, avatar }),
  });
}

export function joinRoom(code: string, name: string, avatar: string) {
  return call<{ code: string; token: string }>(`/api/rooms/${code}`, {
    method: "POST",
    body: JSON.stringify({ type: "join", name, avatar }),
  });
}

export function fetchView(code: string, token: string) {
  return call<GameView>(`/api/rooms/${code}`, { token });
}

export function sendAction(code: string, token: string, action: Action) {
  return call<GameView>(`/api/rooms/${code}`, { method: "POST", token, body: JSON.stringify(action) });
}
