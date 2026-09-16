import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("json-csv-converter");

export default function Page() {
  return (
    <ToolPage slug="json-csv-converter">
      <Client />
    </ToolPage>
  );
}
