import type { Dispatch, SetStateAction } from "react";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { extractTextAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

interface DocumentViewProps {
  documentText: string;
  setDocumentText: (text: string) => void;
  isExtracting: boolean;
  setIsExtracting: Dispatch<SetStateAction<boolean>>;
}

export function DocumentView({ documentText, setDocumentText, isExtracting, setIsExtracting }: DocumentViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'txt' || fileExtension === 'md') {
        try {
          const text = await file.text();
          setDocumentText(text);
        } catch (error) {
          console.error("Error reading file:", error);
          toast({
            variant: "destructive",
            title: "Error reading file",
            description: "Could not read the text from the uploaded file.",
          });
        }
      } else {
        setIsExtracting(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          const formData = new FormData();
          formData.append('fileDataUri', dataUrl);
          
          const result = await extractTextAction(null, formData);
          
          if(result.extractedText) {
            setDocumentText(result.extractedText);
          } else if (result.error) {
            toast({
                variant: "destructive",
                title: "Error extracting text",
                description: result.error,
            });
          }
          setIsExtracting(false);
        };
        reader.onerror = () => {
          toast({
            variant: "destructive",
            title: "Error reading file",
            description: "There was an issue reading the uploaded file.",
          });
          setIsExtracting(false);
        };
        reader.readAsDataURL(file);
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
            Paste or upload a .txt, .md, .pdf, .png, .jpeg, or .doc file.
          </CardDescription>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.md,.pdf,.png,.jpeg,.jpg,.doc"
          disabled={isExtracting}
        />
        <Button variant="outline" onClick={handleUploadClick} disabled={isExtracting}>
          {isExtracting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {isExtracting ? 'Processing...' : 'Upload Document'}
        </Button>
      </CardHeader>
      <CardContent className="flex-grow">
        <Textarea
          placeholder="Paste your document text here or upload a file..."
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          className="h-full min-h-[400px] lg:min-h-0 resize-none font-code text-sm"
          aria-label="Document text"
          disabled={isExtracting}
        />
      </CardContent>
    </Card>
  );
}
