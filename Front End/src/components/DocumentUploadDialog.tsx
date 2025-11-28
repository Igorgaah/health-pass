import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File, type: string, name: string) => void;
}

const DocumentUploadDialog = ({ open, onOpenChange, onUpload }: DocumentUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [documentName, setDocumentName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      if (!documentName) {
        setDocumentName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !documentType || !documentName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos antes de fazer upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    setTimeout(() => {
      onUpload(file, documentType, documentName);
      toast({
        title: "Upload realizado",
        description: "Documento adicionado com sucesso",
      });
      setIsUploading(false);
      setFile(null);
      setDocumentType("");
      setDocumentName("");
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload de Documento</DialogTitle>
          <DialogDescription>
            Faça upload de exames, receitas ou laudos médicos
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Tipo de Documento</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exam">Exame</SelectItem>
                <SelectItem value="prescription">Receita</SelectItem>
                <SelectItem value="vaccine">Cartão de Vacina</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-name">Nome do Documento</Label>
            <Input
              id="document-name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Ex: Hemograma Completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Arquivo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm flex-1 truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleUpload}
            disabled={isUploading || !file || !documentType || !documentName}
          >
            {isUploading ? (
              "Enviando..."
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
