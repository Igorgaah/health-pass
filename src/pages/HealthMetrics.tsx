import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Activity, Heart, Droplet, Weight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

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

const HealthMetrics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [bloodPressure, setBloodPressure] = useState<BloodPressureRecord[]>([]);
  const [weight, setWeight] = useState<WeightRecord[]>([]);
  const [glucose, setGlucose] = useState<GlucoseRecord[]>([]);
  
  const [bpDialogOpen, setBpDialogOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [glucoseDialogOpen, setGlucoseDialogOpen] = useState(false);

  useEffect(() => {
    const storedBp = localStorage.getItem("healthpass_blood_pressure");
    const storedWeight = localStorage.getItem("healthpass_weight");
    const storedGlucose = localStorage.getItem("healthpass_glucose");

    if (storedBp) setBloodPressure(JSON.parse(storedBp));
    if (storedWeight) setWeight(JSON.parse(storedWeight));
    if (storedGlucose) setGlucose(JSON.parse(storedGlucose));
  }, []);

  const handleAddBloodPressure = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRecord: BloodPressureRecord = {
      id: Date.now().toString(),
      systolic: Number(formData.get("systolic")),
      diastolic: Number(formData.get("diastolic")),
      date: formData.get("date") as string,
    };
    
    const updated = [...bloodPressure, newRecord].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setBloodPressure(updated);
    localStorage.setItem("healthpass_blood_pressure", JSON.stringify(updated));
    setBpDialogOpen(false);
    toast({ title: "Pressão arterial registrada com sucesso!" });
  };

  const handleAddWeight = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRecord: WeightRecord = {
      id: Date.now().toString(),
      weight: Number(formData.get("weight")),
      date: formData.get("date") as string,
    };
    
    const updated = [...weight, newRecord].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setWeight(updated);
    localStorage.setItem("healthpass_weight", JSON.stringify(updated));
    setWeightDialogOpen(false);
    toast({ title: "Peso registrado com sucesso!" });
  };

  const handleAddGlucose = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRecord: GlucoseRecord = {
      id: Date.now().toString(),
      glucose: Number(formData.get("glucose")),
      date: formData.get("date") as string,
    };
    
    const updated = [...glucose, newRecord].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setGlucose(updated);
    localStorage.setItem("healthpass_glucose", JSON.stringify(updated));
    setGlucoseDialogOpen(false);
    toast({ title: "Glicemia registrada com sucesso!" });
  };

  const formatChartData = (data: any[], type: string) => {
    return data.map(item => ({
      ...item,
      dateFormatted: format(new Date(item.date), "dd/MM", { locale: ptBR }),
    }));
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-destructive" />
                  Pressão Arterial
                </CardTitle>
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
              </CardHeader>
              <CardContent>
                {bloodPressure.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData(bloodPressure, "bp")}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateFormatted" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="systolic" stroke="hsl(var(--destructive))" name="Sistólica" strokeWidth={2} />
                      <Line type="monotone" dataKey="diastolic" stroke="hsl(var(--primary))" name="Diastólica" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Weight className="h-5 w-5 text-primary" />
                  Peso Corporal
                </CardTitle>
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
              </CardHeader>
              <CardContent>
                {weight.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData(weight, "weight")}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateFormatted" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" name="Peso (kg)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-info" />
                  Glicemia
                </CardTitle>
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
              </CardHeader>
              <CardContent>
                {glucose.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData(glucose, "glucose")}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateFormatted" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="glucose" stroke="hsl(var(--info))" name="Glicemia (mg/dL)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
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
