import { User, Mail, Phone, Calendar, CreditCard, Settings, LogOut, Bell, Shield, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const profile = user?.profile;

  const userInfo = {
    name: profile?.name || "Usuário",
    email: user?.email || "",
    phone: profile?.phone || "",
    birthDate: profile?.birth_date || "",
    plan: profile?.health_plan || "",
  };

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary-foreground/20">
            <AvatarFallback className="text-2xl bg-primary-foreground/10">
              {userInfo.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold">{userInfo.name}</h1>
          <p className="text-primary-foreground/80 mt-1">{userInfo.email}</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Personal Information */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{userInfo.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{userInfo.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium">{userInfo.birthDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Plano de Saúde</p>
                <p className="font-medium">{userInfo.plan}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Editar Informações
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="appointment-notifications">Lembretes de Consultas</Label>
                <p className="text-sm text-muted-foreground">Receba lembretes antes das consultas</p>
              </div>
              <Switch id="appointment-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="medication-notifications">Lembretes de Medicação</Label>
                <p className="text-sm text-muted-foreground">Horários de tomar medicamentos</p>
              </div>
              <Switch id="medication-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="exam-notifications">Resultados de Exames</Label>
                <p className="text-sm text-muted-foreground">Quando novos resultados estiverem disponíveis</p>
              </div>
              <Switch id="exam-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {isAdmin && (
            <Button 
              variant="outline" 
              className="w-full justify-start bg-primary/5 border-primary/20 hover:bg-primary/10" 
              size="lg"
              onClick={() => navigate('/admin')}
            >
              <Lock className="h-5 w-5 mr-3 text-primary" />
              Painel Administrativo
            </Button>
          )}
          <Button variant="outline" className="w-full justify-start" size="lg">
            <Settings className="h-5 w-5 mr-3" />
            Configurações
          </Button>
          <Button variant="outline" className="w-full justify-start" size="lg">
            <Shield className="h-5 w-5 mr-3" />
            Privacidade e Segurança
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start"
            size="lg"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
