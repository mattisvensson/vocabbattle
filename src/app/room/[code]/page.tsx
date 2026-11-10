"use client";

import { useParams } from "next/navigation";
import { Suspense } from "react";
import { Room } from "@/components/Room";

function RoomFromParams() {
  const { code } = useParams<{ code: string }>();
  return <Room code={code.toUpperCase()} />;
}

export default function RoomPage() {
  return (
    <Suspense fallback={<main className="flex flex-1 items-center justify-center text-6xl">🦙</main>}>
      <RoomFromParams />
    </Suspense>
  );
}
