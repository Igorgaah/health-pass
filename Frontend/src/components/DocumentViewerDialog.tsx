import { Download, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface DocumentViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    name: string;
    type: string;
    fileUrl?: string;
  } | null;
}

const DocumentViewerDialog = ({ open, onOpenChange, document }: DocumentViewerDialogProps) => {
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Download iniciado",
      description: `Baixando ${document?.name}...`,
    });
  };

  if (!document) return null;

  const isPDF = document.fileUrl?.endsWith('.pdf') || true;
  const isImage = document.fileUrl?.match(/\.(jpg|jpeg|png)$/i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {document.name}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                title="Baixar documento"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto bg-muted/30 rounded-lg">
          {isPDF ? (
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{document.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Documento PDF disponível para visualização
                  </p>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Documento
                  </Button>
                </div>
              </div>
            </div>
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={document.fileUrl}
                alt={document.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Visualização não disponível para este tipo de arquivo
                </p>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Documento
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewerDialog;
