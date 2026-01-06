import type { Dispatch, SetStateAction } from "react";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { extractTextAction, updateDocumentAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

interface DocumentViewProps {
  documentText: string;
  setDocumentText: (text: string) => void;
  isExtracting: boolean;
  setIsExtracting: Dispatch<SetStateAction<boolean>>;
  chatId?: string;
  isDocMutable: boolean;
}

export function DocumentView({ 
  documentText, 
  setDocumentText, 
  isExtracting, 
  setIsExtracting,
  chatId,
  isDocMutable
}: DocumentViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleTextChange = async (newText: string) => {
    setDocumentText(newText);
    if (chatId && !isDocMutable) {
      await updateDocumentAction(chatId, newText);
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsExtracting(true);
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      let newText = '';

      if (fileExtension === 'txt' || fileExtension === 'md') {
        try {
          newText = await file.text();
        } catch (error) {
          console.error("Error reading file:", error);
          toast({
            variant: "destructive",
            title: "Error reading file",
            description: "Could not read the text from the uploaded file.",
          });
          setIsExtracting(false);
          return;
        }
      } else {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          const formData = new FormData();
          formData.append('fileDataUri', dataUrl);
          
          const result = await extractTextAction(null, formData);
          
          if(result.extractedText) {
            handleTextChange(result.extractedText);
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
        return; // Return early as reader is async
      }

      handleTextChange(newText);
      setIsExtracting(false);
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
        {isDocMutable && (
          <>
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
          </>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <Textarea
          placeholder="Paste your document text here or upload a file to get started..."
          value={documentText}
          onChange={(e) => isDocMutable && handleTextChange(e.target.value)}
          className="h-full min-h-[400px] lg:min-h-0 resize-none font-code text-sm"
          aria-label="Document text"
          disabled={isExtracting || !isDocMutable}
        />
      </CardContent>
    </Card>
  );
}
