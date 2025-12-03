import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";

const Appointments = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [appointments] = useState<Array<{
    id: number;
    doctor: string;
    specialty: string;
    date: string;
    time: string;
    location: string;
    status: string;
  }>>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/10 text-success";
      case "pending":
        return "bg-warning/10 text-warning";
      case "completed":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmada";
      case "pending":
        return "Pendente";
      case "completed":
        return "Realizada";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Minhas Consultas</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/60" />
            <Input
              placeholder="Buscar por médico ou especialidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
            />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* New Appointment Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => navigate("/book-appointment")}
        >
          <Plus className="h-5 w-5 mr-2" />
          Agendar Nova Consulta
        </Button>

        {/* Appointments List */}
        <div className="space-y-4 animate-fade-in">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Nenhuma consulta agendada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Agende sua primeira consulta clicando no botão acima
                </p>
              </CardContent>
            </Card>
          ) : (
            appointments.map((appointment) => (
            <Card 
              key={appointment.id} 
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/appointment/${appointment.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{appointment.doctor}</CardTitle>
                    <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusLabel(appointment.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{appointment.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{appointment.location}</span>
                </div>
                
                {appointment.status !== "completed" && (
                  <div className="flex gap-2 pt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      Reagendar
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Appointments;
