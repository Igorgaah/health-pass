import { useState } from "react";
import { FileText, Upload, Download, Search, Filter, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import DocumentUploadDialog from "@/components/DocumentUploadDialog";
import DocumentViewerDialog from "@/components/DocumentViewerDialog";
import { useToast } from "@/hooks/use-toast";

const Records = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const { toast } = useToast();

  const [records, setRecords] = useState({
    exams: [] as Array<{ id: number; name: string; date: string; doctor: string; type: string; fileUrl: string }>,
    prescriptions: [] as Array<{ id: number; name: string; date: string; doctor: string; validity: string; fileUrl: string }>,
    vaccines: [] as Array<{ id: number; name: string; date: string; location: string; next: string; fileUrl: string }>,
  });

  const handleUpload = (file: File, type: string, name: string) => {
    const newDocument = {
      id: Date.now(),
      name,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      doctor: "",
      type: type === "exam" ? "Exame" : type === "prescription" ? "Receita" : "Vacina",
      fileUrl: URL.createObjectURL(file),
    };

    if (type === "exam") {
      setRecords(prev => ({
        ...prev,
        exams: [newDocument, ...prev.exams],
      }));
    } else if (type === "prescription") {
      setRecords(prev => ({
        ...prev,
        prescriptions: [{ ...newDocument, validity: "90 dias" }, ...prev.prescriptions],
      }));
    } else if (type === "vaccine") {
      setRecords(prev => ({
        ...prev,
        vaccines: [{ ...newDocument, location: "Upload do Usuário", next: "-" }, ...prev.vaccines],
      }));
    }
  };

  const handleView = (document: any) => {
    setSelectedDocument(document);
    setViewerDialogOpen(true);
  };

  const handleDownload = (document: any) => {
    toast({
      title: "Download iniciado",
      description: `Baixando ${document.name}...`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Histórico Médico</h1>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/60" />
            <Input
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button variant="secondary" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="exams" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="exams">Exames</TabsTrigger>
            <TabsTrigger value="prescriptions">Receitas</TabsTrigger>
            <TabsTrigger value="vaccines">Vacinas</TabsTrigger>
          </TabsList>

          <TabsContent value="exams" className="space-y-4 animate-fade-in">
            {records.exams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{exam.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{exam.doctor}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{exam.date}</p>
                      <Badge variant="outline">{exam.type}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleView(exam)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(exam)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4 animate-fade-in">
            {records.prescriptions.map((prescription) => (
              <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-secondary/10">
                        <FileText className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{prescription.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{prescription.doctor}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{prescription.date}</p>
                      <Badge variant="outline" className="bg-success/10 text-success">
                        Válida por {prescription.validity}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleView(prescription)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(prescription)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="vaccines" className="space-y-4 animate-fade-in">
            {records.vaccines.map((vaccine) => (
              <Card key={vaccine.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-info/10">
                        <FileText className="h-5 w-5 text-info" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{vaccine.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{vaccine.location}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Aplicada: {vaccine.date}</p>
                      {vaccine.next !== "-" && (
                        <Badge variant="outline" className="bg-warning/10 text-warning">
                          Próxima: {vaccine.next}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleView(vaccine)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(vaccine)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUpload}
      />

      <DocumentViewerDialog
        open={viewerDialogOpen}
        onOpenChange={setViewerDialogOpen}
        document={selectedDocument}
      />

      <BottomNav />
    </div>
  );
};

export default Records;
