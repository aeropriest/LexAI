import type { Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface DocumentViewProps {
  documentText: string;
  setDocumentText: (text: string) => void;
}

export function DocumentView({ documentText, setDocumentText }: DocumentViewProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Document</CardTitle>
        <CardDescription>
          Paste the content of your legal document below to start analyzing.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Textarea
          placeholder="Paste your document text here..."
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          className="h-full min-h-[400px] lg:min-h-0 resize-none font-code text-sm"
          aria-label="Document text"
        />
      </CardContent>
    </Card>
  );
}
