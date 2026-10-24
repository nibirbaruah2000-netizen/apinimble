import { createFileRoute } from "@tanstack/react-router";
import { ApiNimbleApp } from "@/components/apinimble-app";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <ApiNimbleApp />;
}
