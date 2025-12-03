import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, Activity, Heart, Droplet, Weight, Target, AlertCircle, Download, FileText, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

interface BloodPressureRecord {
  id: string;
  systolic: number;
  diastolic: number;
  date: string;
}

interface WeightRecord {
  id: string;
  weight: number;
  date: string;
}

interface GlucoseRecord {
  id: string;
  glucose: number;
  date: string;
}

interface BloodPressureGoal {
  systolicMin: number;
  systolicMax: number;
  diastolicMin: number;
  diastolicMax: number;
}

interface WeightGoal {
  min: number;
  max: number;
}

interface GlucoseGoal {
  min: number;
  max: number;
}

interface AIInsights {
  summary: string;
  trends: {
    bloodPressure: string;
    weight: string;
    glucose: string;
  };
  recommendations: string[];
  alerts: string[];
}

const HealthMetrics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const bpChartRef = useRef<HTMLDivElement>(null);
  const weightChartRef = useRef<HTMLDivElement>(null);
  const glucoseChartRef = useRef<HTMLDivElement>(null);
  
  const [bloodPressure, setBloodPressure] = useState<BloodPressureRecord[]>([]);
  const [weight, setWeight] = useState<WeightRecord[]>([]);
  const [glucose, setGlucose] = useState<GlucoseRecord[]>([]);
  
  const [bpDialogOpen, setBpDialogOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [glucoseDialogOpen, setGlucoseDialogOpen] = useState(false);
  
  const [bpGoalDialogOpen, setBpGoalDialogOpen] = useState(false);
  const [weightGoalDialogOpen, setWeightGoalDialogOpen] = useState(false);
  const [glucoseGoalDialogOpen, setGlucoseGoalDialogOpen] = useState(false);
  
  const [bpGoal, setBpGoal] = useState<BloodPressureGoal | null>(null);
  const [weightGoal, setWeightGoal] = useState<WeightGoal | null>(null);
  const [glucoseGoal, setGlucoseGoal] = useState<GlucoseGoal | null>(null);
  
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const storedBp = localStorage.getItem("healthpass_blood_pressure");
    const storedWeight = localStorage.getItem("healthpass_weight");
    const storedGlucose = localStorage.getItem("healthpass_glucose");
    const storedBpGoal = localStorage.getItem("healthpass_bp_goal");
    const storedWeightGoal = localStorage.getItem("healthpass_weight_goal");
    const storedGlucoseGoal = localStorage.getItem("healthpass_glucose_goal");

    if (storedBp) setBloodPressure(JSON.parse(storedBp));
    if (storedWeight) setWeight(JSON.parse(storedWeight));
    if (storedGlucose) setGlucose(JSON.parse(storedGlucose));
    if (storedBpGoal) setBpGoal(JSON.parse(storedBpGoal));
    if (storedWeightGoal) setWeightGoal(JSON.parse(storedWeightGoal));
    if (storedGlucoseGoal) setGlucoseGoal(JSON.parse(storedGlucoseGoal));
  }, []);

  const checkBpGoal = (systolic: number, diastolic: number) => {
    if (!bpGoal) return null;
    const systolicOk = systolic >= bpGoal.systolicMin && systolic <= bpGoal.systolicMax;
    const diastolicOk = diastolic >= bpGoal.diastolicMin && diastolic <= bpGoal.diastolicMax;
    return systolicOk && diastolicOk;
  };

  const checkWeightGoal = (value: number) => {
    if (!weightGoal) return null;
    return value >= weightGoal.min && value <= weightGoal.max;
  };

  const checkGlucoseGoal = (value: number) => {
    if (!glucoseGoal) return null;
    return value >= glucoseGoal.min && value <= glucoseGoal.max;
  };

  const handleAddBloodPressure = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const systolic = Number(formData.get("systolic"));
    const diastolic = Number(formData.get("diastolic"));
    const newRecord: BloodPressureRecord = {
      id: Date.now().toString(),
      systolic,
      diastolic,
      date: formData.get("date") as string,
    };
    
    const updated = [...bloodPressure, newRecord].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setBloodPressure(updated);
    localStorage.setItem("healthpass_blood_pressure", JSON.stringify(updated));
    setBpDialogOpen(false);
    
    const isInRange = checkBpGoal(systolic, diastolic);
    if (isInRange === false) {
      toast({ 
        title: "⚠️ Pressão fora da meta!", 
        description: "Seu valor está fora da faixa ideal definida.",
        variant: "destructive"
      });
    } else {
      toast({ title: "Pressão arterial registrada com sucesso!" });
    }
  };

  const handleAddWeight = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const weightValue = Number(formData.get("weight"));
    const newRecord: WeightRecord = {
      id: Date.now().toString(),
      weight: weightValue,
      date: formData.get("date") as string,
    };
    
    const updated = [...weight, newRecord].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setWeight(updated);
    localStorage.setItem("healthpass_weight", JSON.stringify(updated));
    setWeightDialogOpen(false);
    
    const isInRange = checkWeightGoal(weightValue);
    if (isInRange === false) {
      toast({ 
        title: "⚠️ Peso fora da meta!", 
        description: "Seu valor está fora da faixa ideal definida.",
        variant: "destructive"
      });
    } else {
      toast({ title: "Peso registrado com sucesso!" });
    }
  };

  const handleAddGlucose = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const glucoseValue = Number(formData.get("glucose"));
    const newRecord: GlucoseRecord = {
      id: Date.now().toString(),
      glucose: glucoseValue,
      date: formData.get("date") as string,
    };
    
    const updated = [...glucose, newRecord].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setGlucose(updated);
    localStorage.setItem("healthpass_glucose", JSON.stringify(updated));
    setGlucoseDialogOpen(false);
    
    const isInRange = checkGlucoseGoal(glucoseValue);
    if (isInRange === false) {
      toast({ 
        title: "⚠️ Glicemia fora da meta!", 
        description: "Seu valor está fora da faixa ideal definida.",
        variant: "destructive"
      });
    } else {
      toast({ title: "Glicemia registrada com sucesso!" });
    }
  };

  const handleSetBpGoal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const goal: BloodPressureGoal = {
      systolicMin: Number(formData.get("systolicMin")),
      systolicMax: Number(formData.get("systolicMax")),
      diastolicMin: Number(formData.get("diastolicMin")),
      diastolicMax: Number(formData.get("diastolicMax")),
    };
    setBpGoal(goal);
    localStorage.setItem("healthpass_bp_goal", JSON.stringify(goal));
    setBpGoalDialogOpen(false);
    toast({ title: "Meta de pressão arterial definida!" });
  };

  const handleSetWeightGoal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const goal: WeightGoal = {
      min: Number(formData.get("min")),
      max: Number(formData.get("max")),
    };
    setWeightGoal(goal);
    localStorage.setItem("healthpass_weight_goal", JSON.stringify(goal));
    setWeightGoalDialogOpen(false);
    toast({ title: "Meta de peso definida!" });
  };

  const handleSetGlucoseGoal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const goal: GlucoseGoal = {
      min: Number(formData.get("min")),
      max: Number(formData.get("max")),
    };
    setGlucoseGoal(goal);
    localStorage.setItem("healthpass_glucose_goal", JSON.stringify(goal));
    setGlucoseGoalDialogOpen(false);
    toast({ title: "Meta de glicemia definida!" });
  };

  const formatChartData = (data: any[], type: string) => {
    return data.map(item => ({
      ...item,
      dateFormatted: format(new Date(item.date), "dd/MM", { locale: ptBR }),
    }));
  };

  const calculateStats = (data: number[]) => {
    if (data.length === 0) return { avg: 0, min: 0, max: 0 };
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const min = Math.min(...data);
    const max = Math.max(...data);
    return { avg: avg.toFixed(1), min, max };
  };

  const exportToCSV = (type: 'bp' | 'weight' | 'glucose') => {
    let csvContent = "";
    let filename = "";

    if (type === 'bp' && bloodPressure.length > 0) {
      csvContent = "Data,Sistólica (mmHg),Diastólica (mmHg)\n";
      bloodPressure.forEach(record => {
        csvContent += `${format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR })},${record.systolic},${record.diastolic}\n`;
      });
      filename = "pressao_arterial.csv";
    } else if (type === 'weight' && weight.length > 0) {
      csvContent = "Data,Peso (kg)\n";
      weight.forEach(record => {
        csvContent += `${format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR })},${record.weight}\n`;
      });
      filename = "peso.csv";
    } else if (type === 'glucose' && glucose.length > 0) {
      csvContent = "Data,Glicemia (mg/dL)\n";
      glucose.forEach(record => {
        csvContent += `${format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR })},${record.glucose}\n`;
      });
      filename = "glicemia.csv";
    }

    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "CSV exportado com sucesso!" });
    } else {
      toast({ title: "Nenhum dado para exportar", variant: "destructive" });
    }
  };

  const exportToPDF = async (type: 'bp' | 'weight' | 'glucose') => {
    const pdf = new jsPDF();
    let yPosition = 20;

    // Título
    pdf.setFontSize(18);
    pdf.text("Health Pass - Relatório de Sinais Vitais", 105, yPosition, { align: "center" });
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 105, yPosition, { align: "center" });
    yPosition += 15;

    if (type === 'bp' && bloodPressure.length > 0) {
      pdf.setFontSize(14);
      pdf.text("Pressão Arterial", 14, yPosition);
      yPosition += 10;

      // Estatísticas
      const systolicData = bloodPressure.map(r => r.systolic);
      const diastolicData = bloodPressure.map(r => r.diastolic);
      const systolicStats = calculateStats(systolicData);
      const diastolicStats = calculateStats(diastolicData);

      pdf.setFontSize(10);
      pdf.text(`Sistólica - Média: ${systolicStats.avg} | Mín: ${systolicStats.min} | Máx: ${systolicStats.max} mmHg`, 14, yPosition);
      yPosition += 6;
      pdf.text(`Diastólica - Média: ${diastolicStats.avg} | Mín: ${diastolicStats.min} | Máx: ${diastolicStats.max} mmHg`, 14, yPosition);
      yPosition += 10;

      if (bpGoal) {
        pdf.text(`Meta: Sistólica ${bpGoal.systolicMin}-${bpGoal.systolicMax} | Diastólica ${bpGoal.diastolicMin}-${bpGoal.diastolicMax} mmHg`, 14, yPosition);
        yPosition += 10;
      }

      // Tabela
      const tableData = bloodPressure.map(record => [
        format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR }),
        record.systolic.toString(),
        record.diastolic.toString()
      ]);

      autoTable(pdf, {
        head: [['Data', 'Sistólica (mmHg)', 'Diastólica (mmHg)']],
        body: tableData,
        startY: yPosition,
        theme: 'grid'
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 10;

      // Gráfico
      if (bpChartRef.current) {
        const canvas = await html2canvas(bpChartRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (yPosition + imgHeight > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
      }

      pdf.save("pressao_arterial_relatorio.pdf");

    } else if (type === 'weight' && weight.length > 0) {
      pdf.setFontSize(14);
      pdf.text("Peso Corporal", 14, yPosition);
      yPosition += 10;

      // Estatísticas
      const weightData = weight.map(r => r.weight);
      const stats = calculateStats(weightData);

      pdf.setFontSize(10);
      pdf.text(`Média: ${stats.avg} kg | Mínimo: ${stats.min} kg | Máximo: ${stats.max} kg`, 14, yPosition);
      yPosition += 10;

      if (weightGoal) {
        pdf.text(`Meta: ${weightGoal.min}-${weightGoal.max} kg`, 14, yPosition);
        yPosition += 10;
      }

      // Tabela
      const tableData = weight.map(record => [
        format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR }),
        record.weight.toString()
      ]);

      autoTable(pdf, {
        head: [['Data', 'Peso (kg)']],
        body: tableData,
        startY: yPosition,
        theme: 'grid'
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 10;

      // Gráfico
      if (weightChartRef.current) {
        const canvas = await html2canvas(weightChartRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (yPosition + imgHeight > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
      }

      pdf.save("peso_relatorio.pdf");

    } else if (type === 'glucose' && glucose.length > 0) {
      pdf.setFontSize(14);
      pdf.text("Glicemia", 14, yPosition);
      yPosition += 10;

      // Estatísticas
      const glucoseData = glucose.map(r => r.glucose);
      const stats = calculateStats(glucoseData);

      pdf.setFontSize(10);
      pdf.text(`Média: ${stats.avg} mg/dL | Mínimo: ${stats.min} mg/dL | Máximo: ${stats.max} mg/dL`, 14, yPosition);
      yPosition += 10;

      if (glucoseGoal) {
        pdf.text(`Meta: ${glucoseGoal.min}-${glucoseGoal.max} mg/dL`, 14, yPosition);
        yPosition += 10;
      }

      // Tabela
      const tableData = glucose.map(record => [
        format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR }),
        record.glucose.toString()
      ]);

      autoTable(pdf, {
        head: [['Data', 'Glicemia (mg/dL)']],
        body: tableData,
        startY: yPosition,
        theme: 'grid'
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 10;

      // Gráfico
      if (glucoseChartRef.current) {
        const canvas = await html2canvas(glucoseChartRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (yPosition + imgHeight > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
      }

      pdf.save("glicemia_relatorio.pdf");
    } else {
      toast({ title: "Nenhum dado para exportar", variant: "destructive" });
      return;
    }

    toast({ title: "PDF exportado com sucesso!" });
  };

  const analyzeWithAI = async () => {
    if (bloodPressure.length === 0 && weight.length === 0 && glucose.length === 0) {
      toast({ 
        title: "Nenhum dado disponível", 
        description: "Adicione registros de sinais vitais para análise.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bloodPressureData: bloodPressure.map(bp => ({
            date: bp.date,
            systolic: bp.systolic,
            diastolic: bp.diastolic
          })),
          weightData: weight.map(w => ({
            date: w.date,
            value: w.weight
          })),
          glucoseData: glucose.map(g => ({
            date: g.date,
            value: g.glucose
          })),
          goals: {
            bloodPressure: bpGoal || { systolic: 120, diastolic: 80 },
            weight: weightGoal?.max || 70,
            glucose: glucoseGoal?.max || 100
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao analisar dados');
      }

      const data = await response.json();
      setAiInsights(data.insights);
      toast({ title: "✨ Análise concluída com sucesso!" });
    } catch (error) {
      console.error('Error analyzing health data:', error);
      toast({ 
        title: "Erro na análise", 
        description: error instanceof Error ? error.message : "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-primary to-secondary p-4 text-primary-foreground sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Sinais Vitais</h1>
            <p className="text-sm text-primary-foreground/80">Acompanhamento de saúde</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* AI Insights Card */}
        <Card className="mb-4 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Análise com IA
              </CardTitle>
              <Button 
                onClick={analyzeWithAI}
                disabled={isAnalyzing}
                size="sm"
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analisar Dados
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {aiInsights && (
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">📊 Resumo Geral</h3>
                <p className="text-sm text-muted-foreground">{aiInsights.summary}</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                    <Heart className="h-4 w-4 text-destructive" />
                    Pressão Arterial
                  </h3>
                  <p className="text-xs text-muted-foreground">{aiInsights.trends.bloodPressure}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                    <Weight className="h-4 w-4 text-primary" />
                    Peso
                  </h3>
                  <p className="text-xs text-muted-foreground">{aiInsights.trends.weight}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                    <Droplet className="h-4 w-4 text-blue-500" />
                    Glicemia
                  </h3>
                  <p className="text-xs text-muted-foreground">{aiInsights.trends.glucose}</p>
                </div>
              </div>

              {aiInsights.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">💡 Recomendações</h3>
                  <ul className="space-y-1">
                    {aiInsights.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiInsights.alerts.length > 0 && (
                <div className="bg-destructive/10 p-3 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Alertas Importantes
                  </h3>
                  <ul className="space-y-1">
                    {aiInsights.alerts.map((alert, idx) => (
                      <li key={idx} className="text-xs text-destructive/90 flex gap-2">
                        <span>⚠️</span>
                        {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        <Tabs defaultValue="blood-pressure" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="blood-pressure">
              <Heart className="h-4 w-4 mr-2" />
              Pressão
            </TabsTrigger>
            <TabsTrigger value="weight">
              <Weight className="h-4 w-4 mr-2" />
              Peso
            </TabsTrigger>
            <TabsTrigger value="glucose">
              <Droplet className="h-4 w-4 mr-2" />
              Glicemia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blood-pressure" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-destructive" />
                  Pressão Arterial
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  {bloodPressure.length > 0 && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => exportToCSV('bp')}>
                        <FileText className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportToPDF('bp')}>
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </>
                  )}
                  <Dialog open={bpGoalDialogOpen} onOpenChange={setBpGoalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Target className="h-4 w-4 mr-1" />
                        Meta
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Definir Meta de Pressão Arterial</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSetBpGoal} className="space-y-4">
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold">Sistólica (mmHg)</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="systolicMin" className="text-xs text-muted-foreground">Mínimo</Label>
                              <Input 
                                id="systolicMin" 
                                name="systolicMin" 
                                type="number" 
                                required 
                                placeholder="90"
                                defaultValue={bpGoal?.systolicMin}
                              />
                            </div>
                            <div>
                              <Label htmlFor="systolicMax" className="text-xs text-muted-foreground">Máximo</Label>
                              <Input 
                                id="systolicMax" 
                                name="systolicMax" 
                                type="number" 
                                required 
                                placeholder="120"
                                defaultValue={bpGoal?.systolicMax}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold">Diastólica (mmHg)</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="diastolicMin" className="text-xs text-muted-foreground">Mínimo</Label>
                              <Input 
                                id="diastolicMin" 
                                name="diastolicMin" 
                                type="number" 
                                required 
                                placeholder="60"
                                defaultValue={bpGoal?.diastolicMin}
                              />
                            </div>
                            <div>
                              <Label htmlFor="diastolicMax" className="text-xs text-muted-foreground">Máximo</Label>
                              <Input 
                                id="diastolicMax" 
                                name="diastolicMax" 
                                type="number" 
                                required 
                                placeholder="80"
                                defaultValue={bpGoal?.diastolicMax}
                              />
                            </div>
                          </div>
                        </div>
                        <Button type="submit" className="w-full">Salvar Meta</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={bpDialogOpen} onOpenChange={setBpDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registrar Pressão Arterial</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddBloodPressure} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="systolic">Sistólica (mmHg)</Label>
                            <Input id="systolic" name="systolic" type="number" required placeholder="120" />
                          </div>
                          <div>
                            <Label htmlFor="diastolic">Diastólica (mmHg)</Label>
                            <Input id="diastolic" name="diastolic" type="number" required placeholder="80" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="date">Data</Label>
                          <Input id="date" name="date" type="date" required defaultValue={format(new Date(), "yyyy-MM-dd")} />
                        </div>
                        <Button type="submit" className="w-full">Salvar</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {bpGoal && (
                  <div className="mb-4 p-3 bg-muted rounded-lg flex items-start gap-2">
                    <Target className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Meta definida</p>
                      <p className="text-xs text-muted-foreground">
                        Sistólica: {bpGoal.systolicMin}-{bpGoal.systolicMax} mmHg | 
                        Diastólica: {bpGoal.diastolicMin}-{bpGoal.diastolicMax} mmHg
                      </p>
                    </div>
                    {bloodPressure.length > 0 && (() => {
                      const latest = bloodPressure[bloodPressure.length - 1];
                      const isInRange = checkBpGoal(latest.systolic, latest.diastolic);
                      return isInRange !== null && (
                        <Badge variant={isInRange ? "default" : "destructive"}>
                          {isInRange ? "✓ Na meta" : "⚠ Fora da meta"}
                        </Badge>
                      );
                    })()}
                  </div>
                )}
                {bloodPressure.length > 0 ? (
                  <div ref={bpChartRef}>
                    <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData(bloodPressure, "bp")}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateFormatted" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {bpGoal && (
                        <>
                          <ReferenceLine y={bpGoal.systolicMax} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label="Meta Sist. Máx" />
                          <ReferenceLine y={bpGoal.systolicMin} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label="Meta Sist. Mín" />
                          <ReferenceLine y={bpGoal.diastolicMax} stroke="hsl(var(--primary))" strokeDasharray="3 3" label="Meta Diast. Máx" />
                          <ReferenceLine y={bpGoal.diastolicMin} stroke="hsl(var(--primary))" strokeDasharray="3 3" label="Meta Diast. Mín" />
                        </>
                      )}
                      <Line type="monotone" dataKey="systolic" stroke="hsl(var(--destructive))" name="Sistólica" strokeWidth={2} />
                      <Line type="monotone" dataKey="diastolic" stroke="hsl(var(--primary))" name="Diastólica" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum registro ainda</p>
                    <p className="text-sm">Adicione sua primeira medição</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weight" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Weight className="h-5 w-5 text-primary" />
                  Peso Corporal
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  {weight.length > 0 && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => exportToCSV('weight')}>
                        <FileText className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportToPDF('weight')}>
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </>
                  )}
                  <Dialog open={weightGoalDialogOpen} onOpenChange={setWeightGoalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Target className="h-4 w-4 mr-1" />
                        Meta
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Definir Meta de Peso</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSetWeightGoal} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="weightMin">Peso Mínimo (kg)</Label>
                            <Input 
                              id="weightMin" 
                              name="min" 
                              type="number" 
                              step="0.1" 
                              required 
                              placeholder="65.0"
                              defaultValue={weightGoal?.min}
                            />
                          </div>
                          <div>
                            <Label htmlFor="weightMax">Peso Máximo (kg)</Label>
                            <Input 
                              id="weightMax" 
                              name="max" 
                              type="number" 
                              step="0.1" 
                              required 
                              placeholder="75.0"
                              defaultValue={weightGoal?.max}
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full">Salvar Meta</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={weightDialogOpen} onOpenChange={setWeightDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registrar Peso</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddWeight} className="space-y-4">
                        <div>
                          <Label htmlFor="weight">Peso (kg)</Label>
                          <Input id="weight" name="weight" type="number" step="0.1" required placeholder="70.5" />
                        </div>
                        <div>
                          <Label htmlFor="weight-date">Data</Label>
                          <Input id="weight-date" name="date" type="date" required defaultValue={format(new Date(), "yyyy-MM-dd")} />
                        </div>
                        <Button type="submit" className="w-full">Salvar</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {weightGoal && (
                  <div className="mb-4 p-3 bg-muted rounded-lg flex items-start gap-2">
                    <Target className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Meta definida</p>
                      <p className="text-xs text-muted-foreground">
                        Peso ideal: {weightGoal.min}-{weightGoal.max} kg
                      </p>
                    </div>
                    {weight.length > 0 && (() => {
                      const latest = weight[weight.length - 1];
                      const isInRange = checkWeightGoal(latest.weight);
                      return isInRange !== null && (
                        <Badge variant={isInRange ? "default" : "destructive"}>
                          {isInRange ? "✓ Na meta" : "⚠ Fora da meta"}
                        </Badge>
                      );
                    })()}
                  </div>
                )}
                {weight.length > 0 ? (
                  <div ref={weightChartRef}>
                    <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData(weight, "weight")}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateFormatted" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {weightGoal && (
                        <>
                          <ReferenceLine y={weightGoal.max} stroke="hsl(var(--primary))" strokeDasharray="3 3" label="Peso Máximo" />
                          <ReferenceLine y={weightGoal.min} stroke="hsl(var(--primary))" strokeDasharray="3 3" label="Peso Mínimo" />
                        </>
                      )}
                      <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" name="Peso (kg)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum registro ainda</p>
                    <p className="text-sm">Adicione sua primeira medição</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="glucose" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-info" />
                  Glicemia
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  {glucose.length > 0 && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => exportToCSV('glucose')}>
                        <FileText className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportToPDF('glucose')}>
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </>
                  )}
                  <Dialog open={glucoseGoalDialogOpen} onOpenChange={setGlucoseGoalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Target className="h-4 w-4 mr-1" />
                        Meta
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Definir Meta de Glicemia</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSetGlucoseGoal} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="glucoseMin">Glicemia Mínima (mg/dL)</Label>
                            <Input 
                              id="glucoseMin" 
                              name="min" 
                              type="number" 
                              required 
                              placeholder="70"
                              defaultValue={glucoseGoal?.min}
                            />
                          </div>
                          <div>
                            <Label htmlFor="glucoseMax">Glicemia Máxima (mg/dL)</Label>
                            <Input 
                              id="glucoseMax" 
                              name="max" 
                              type="number" 
                              required 
                              placeholder="100"
                              defaultValue={glucoseGoal?.max}
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full">Salvar Meta</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={glucoseDialogOpen} onOpenChange={setGlucoseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registrar Glicemia</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddGlucose} className="space-y-4">
                        <div>
                          <Label htmlFor="glucose">Glicemia (mg/dL)</Label>
                          <Input id="glucose" name="glucose" type="number" required placeholder="100" />
                        </div>
                        <div>
                          <Label htmlFor="glucose-date">Data</Label>
                          <Input id="glucose-date" name="date" type="date" required defaultValue={format(new Date(), "yyyy-MM-dd")} />
                        </div>
                        <Button type="submit" className="w-full">Salvar</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {glucoseGoal && (
                  <div className="mb-4 p-3 bg-muted rounded-lg flex items-start gap-2">
                    <Target className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Meta definida</p>
                      <p className="text-xs text-muted-foreground">
                        Glicemia ideal: {glucoseGoal.min}-{glucoseGoal.max} mg/dL
                      </p>
                    </div>
                    {glucose.length > 0 && (() => {
                      const latest = glucose[glucose.length - 1];
                      const isInRange = checkGlucoseGoal(latest.glucose);
                      return isInRange !== null && (
                        <Badge variant={isInRange ? "default" : "destructive"}>
                          {isInRange ? "✓ Na meta" : "⚠ Fora da meta"}
                        </Badge>
                      );
                    })()}
                  </div>
                )}
                {glucose.length > 0 ? (
                  <div ref={glucoseChartRef}>
                    <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData(glucose, "glucose")}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateFormatted" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {glucoseGoal && (
                        <>
                          <ReferenceLine y={glucoseGoal.max} stroke="hsl(var(--info))" strokeDasharray="3 3" label="Glicemia Máxima" />
                          <ReferenceLine y={glucoseGoal.min} stroke="hsl(var(--info))" strokeDasharray="3 3" label="Glicemia Mínima" />
                        </>
                      )}
                      <Line type="monotone" dataKey="glucose" stroke="hsl(var(--info))" name="Glicemia (mg/dL)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum registro ainda</p>
                    <p className="text-sm">Adicione sua primeira medição</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default HealthMetrics;
