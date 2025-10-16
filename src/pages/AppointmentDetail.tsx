import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, Phone, Mail, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const AppointmentDetail = () => {
  const navigate = useNavigate();

  // Dados fictícios da consulta
  const appointment = {
    id: 1,
    doctor: "Dr. João Silva",
    specialty: "Cardiologia",
    date: "15 Out 2024",
    time: "14:00",
    location: "Hospital São Lucas",
    address: "Rua das Flores, 123 - Centro",
    phone: "(11) 3456-7890",
    email: "contato@saolucas.com.br",
    status: "confirmed",
    notes: "Levar exames anteriores e lista de medicamentos em uso",
    preparation: "Jejum de 8 horas antes da consulta",
  };

  const handleCancel = () => {
    toast.error("Consulta cancelada", {
      description: "Um email de confirmação foi enviado",
    });
    navigate("/appointments");
  };

  const handleReschedule = () => {
    navigate("/book-appointment");
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Detalhes da Consulta</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Status Badge */}
        <div className="flex justify-center animate-scale-in">
          <Badge className="bg-success text-success-foreground text-lg py-2 px-4">
            ✓ Consulta Confirmada
          </Badge>
        </div>

        {/* Doctor Info */}
        <Card className="animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                JS
              </div>
              <div>
                <h2 className="text-xl font-bold">{appointment.doctor}</h2>
                <p className="text-muted-foreground">{appointment.specialty}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card className="animate-slide-up">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="font-medium">{appointment.date}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Horário</p>
                <p className="font-medium">{appointment.time}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Local</p>
                <p className="font-medium">{appointment.location}</p>
                <p className="text-sm text-muted-foreground mt-1">{appointment.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold mb-3">Contato</h3>
            
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <a href={`tel:${appointment.phone}`} className="text-primary hover:underline">
                {appointment.phone}
              </a>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <a href={`mailto:${appointment.email}`} className="text-primary hover:underline">
                {appointment.email}
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="animate-slide-up border-warning" style={{ animationDelay: "0.2s" }}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Preparação Necessária</h3>
                <p className="text-sm text-muted-foreground">{appointment.preparation}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-info mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Observações</h3>
                <p className="text-sm text-muted-foreground">{appointment.notes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleReschedule}
          >
            Reagendar Consulta
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            className="w-full"
            onClick={handleCancel}
          >
            Cancelar Consulta
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full"
          >
            Adicionar ao Calendário
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;
