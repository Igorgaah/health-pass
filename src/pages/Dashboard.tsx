import { Calendar, FileText, Activity, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";

const Dashboard = () => {
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
          <h1 className="text-2xl font-bold mb-1">Olá, Usuário!</h1>
          <p className="text-primary-foreground/80">Bem-vindo ao seu painel de saúde</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
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
            <Button variant="outline" className="w-full mt-2">
              Ver todas as consultas
            </Button>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
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
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Calendar className="h-6 w-6" />
            <span className="text-sm">Agendar Consulta</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <FileText className="h-6 w-6" />
            <span className="text-sm">Adicionar Exame</span>
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
