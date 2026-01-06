import type { Dispatch, SetStateAction } from "react";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface DocumentViewProps {
  documentText: string;
  setDocumentText: (text: string) => void;
}

export function DocumentView({ documentText, setDocumentText }: DocumentViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        setDocumentText(text);
      } catch (error) {
        console.error("Error reading file:", error);
        // Optionally, show an error to the user
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Document</CardTitle>
          <CardDescription>
            Paste the content of your legal document below or upload a file.
          </CardDescription>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.md"
        />
        <Button variant="outline" onClick={handleUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </CardHeader>
      <CardContent className="flex-grow">
        <Textarea
          placeholder="Paste your document text here or upload a file..."
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          className="h-full min-h-[400px] lg:min-h-0 resize-none font-code text-sm"
          aria-label="Document text"
        />
      </CardContent>
    </Card>
  );
}
