import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const BookAppointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [specialties] = useState<string[]>([]);

  const [doctors] = useState<Record<string, Array<{ id: number; name: string; location: string; rating: number }>>>({});

  const availableTimes = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30",
  ];

  const handleConfirm = () => {
    toast.success("Consulta agendada com sucesso!", {
      description: `${selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : ""} às ${selectedTime}`,
    });
    navigate("/appointments");
  };

  const canProceedToStep2 = selectedSpecialty && selectedDoctor;
  const canProceedToStep3 = selectedDate && selectedTime;

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Agendar Consulta</h1>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  s <= step ? "bg-primary-foreground" : "bg-primary-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Step 1: Select Specialty and Doctor */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Selecione a Especialidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar especialidade..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties
                      .filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedSpecialty && (
              <Card className="animate-slide-up">
                <CardHeader>
                  <CardTitle>Escolha o Médico</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(doctors[selectedSpecialty] || []).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum médico disponível para esta especialidade
                    </div>
                  ) : (
                    (doctors[selectedSpecialty] || []).map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => setSelectedDoctor(doctor.name)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedDoctor === doctor.name
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{doctor.name}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{doctor.location}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">⭐ {doctor.rating}</div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            <Button
              size="lg"
              className="w-full"
              disabled={!canProceedToStep2}
              onClick={() => setStep(2)}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Step 2: Select Date and Time */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Escolha a Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-lg border pointer-events-auto"
                  locale={ptBR}
                />
              </CardContent>
            </Card>

            {selectedDate && (
              <Card className="animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horários Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-lg border-2 font-medium transition-all ${
                          selectedTime === time
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              size="lg"
              className="w-full"
              disabled={!canProceedToStep3}
              onClick={() => setStep(3)}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Step 3: Review and Confirm */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Confirme seus Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <p className="font-medium">{selectedSpecialty}</p>
                </div>
                <div className="space-y-2">
                  <Label>Médico</Label>
                  <p className="font-medium">{selectedDoctor}</p>
                </div>
                <div className="space-y-2">
                  <Label>Data e Hora</Label>
                  <p className="font-medium">
                    {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {selectedTime}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Observações (Opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background resize-none"
                  placeholder="Adicione informações que possam ajudar o médico..."
                />
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button size="lg" className="w-full" onClick={handleConfirm}>
                Confirmar Agendamento
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setStep(2)}
              >
                Voltar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
