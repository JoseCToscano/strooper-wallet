"use client";
import { CreatePasskey } from "~/app/_components/CreatePasskey";

export default function WebPage() {
  const openUrl = (url: string) => {
    window.open(url, "_blank");
  };

  return <CreatePasskey openUrl={openUrl} comesFromBrowser />;
}
