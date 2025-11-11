import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Activity, Heart, Droplet, Weight, Target, AlertCircle } from "lucide-react";
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

const HealthMetrics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
                <div className="flex gap-2">
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
                <div className="flex gap-2">
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
                <div className="flex gap-2">
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
