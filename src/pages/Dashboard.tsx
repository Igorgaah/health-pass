import { Calendar, FileText, Activity, Bell, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { useState, useEffect } from "react";
import { format, isBefore, addHours, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trophy, Star } from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  description: string;
  type: "medication" | "appointment" | "exam";
  dateTime: Date;
  repeat: "none" | "daily" | "weekly" | "monthly";
  enabled: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userPoints } = useGamification();
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    // Load reminders from localStorage
    const stored = localStorage.getItem("healthpass_reminders");
    if (stored) {
      const parsed = JSON.parse(stored);
      const reminders = parsed.map((r: any) => ({ ...r, dateTime: new Date(r.dateTime) }));
      
      // Filter upcoming reminders (next 24 hours)
      const now = new Date();
      const tomorrow = addHours(now, 24);
      const upcoming = reminders.filter((r: Reminder) => 
        r.enabled && 
        !isPast(r.dateTime) &&
        isBefore(r.dateTime, tomorrow)
      ).slice(0, 3); // Show max 3 reminders
      
      setUpcomingReminders(upcoming);
    }
  }, []);
  
  const stats = [
    { title: "Próxima Consulta", value: "15 Out", icon: Calendar, color: "text-primary" },
    { title: "Exames Pendentes", value: "2", icon: FileText, color: "text-warning" },
    { title: "Vacinas em Dia", value: "12", icon: Activity, color: "text-success" },
    { title: "Lembretes", value: "3", icon: Bell, color: "text-info" },
  ];

  const upcomingAppointments = [
    { doctor: "Dr. João Silva", specialty: "Cardiologia", date: "15 Out", time: "14:00" },
    { doctor: "Dra. Maria Santos", specialty: "Dermatologia", date: "22 Out", time: "10:30" },
  ];

  const alerts = [
    { type: "exam", message: "Resultado do exame de sangue disponível", time: "2h atrás" },
    { type: "medication", message: "Lembrete: Tomar medicação às 20h", time: "4h atrás" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-1">Olá, {user?.name || 'Usuário'}! 👋</h1>
              <p className="text-primary-foreground/80">Bem-vindo ao seu painel de saúde</p>
            </div>
            <Notification />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Gamification Card */}
        <Card 
          className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/gamification")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/20">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seu Progresso</p>
                  <p className="text-2xl font-bold">Level {userPoints?.level || 1}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary">
                  <Star className="h-5 w-5 fill-primary" />
                  <span className="text-xl font-bold">{userPoints?.total_points || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg bg-accent ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Upcoming Appointments */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximas Consultas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAppointments.map((appointment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <div>
                  <p className="font-medium">{appointment.doctor}</p>
                  <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{appointment.date}</p>
                  <p className="text-xs text-muted-foreground">{appointment.time}</p>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => navigate("/appointments")}
            >
              Ver todas as consultas
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Próximos Lembretes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                >
                  <Badge variant="outline" className="mt-1">
                    {reminder.type === "medication" ? "💊" : reminder.type === "appointment" ? "📅" : "📋"}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{reminder.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(reminder.dateTime, "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => navigate("/reminders")}
              >
                Ver todos os lembretes
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        <Card className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-warning" />
              Alertas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <Badge variant="outline" className="mt-1">
                  {alert.type === "exam" ? "Exame" : "Medicação"}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate("/book-appointment")}
          >
            <Calendar className="h-6 w-6" />
            <span className="text-sm">Agendar Consulta</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate("/records")}
          >
            <FileText className="h-6 w-6" />
            <span className="text-sm">Adicionar Exame</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate("/health-metrics")}
          >
            <Activity className="h-6 w-6" />
            <span className="text-sm">Sinais Vitais</span>
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
