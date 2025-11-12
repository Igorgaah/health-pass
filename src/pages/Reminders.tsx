import { useState, useEffect } from "react";
import { Bell, Plus, Trash2, Edit, Pill, Calendar, FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ReminderDialog } from "@/components/ReminderDialog";
import { format, isPast, isBefore, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  requestNotificationPermission as requestPushPermission, 
  scheduleNotification, 
  sendNotification as sendPushNotification 
} from "@/utils/registerSW";

export interface Reminder {
  id: string;
  title: string;
  description: string;
  type: "medication" | "appointment" | "exam";
  dateTime: Date;
  repeat: "none" | "daily" | "weekly" | "monthly";
  enabled: boolean;
}

const Reminders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | undefined>();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Load reminders from localStorage
    const stored = localStorage.getItem("healthpass_reminders");
    if (stored) {
      const parsed = JSON.parse(stored);
      setReminders(parsed.map((r: any) => ({ ...r, dateTime: new Date(r.dateTime) })));
    }

    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Save reminders to localStorage
    localStorage.setItem("healthpass_reminders", JSON.stringify(reminders));

    // Agendar notificações via Service Worker
    reminders.forEach((reminder) => {
      if (reminder.enabled && !isPast(reminder.dateTime)) {
        scheduleNotification({
          id: reminder.id,
          title: reminder.title,
          description: reminder.description,
          dateTime: reminder.dateTime
        });
      }
    });

    // Check for upcoming reminders (backup)
    const checkReminders = () => {
      const now = new Date();
      reminders.forEach((reminder) => {
        if (reminder.enabled && !isPast(reminder.dateTime)) {
          const timeDiff = reminder.dateTime.getTime() - now.getTime();
          // Notify 5 minutes before
          if (timeDiff > 0 && timeDiff <= 5 * 60 * 1000) {
            handleSendNotification(reminder);
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [reminders]);

  const requestNotificationPermission = async () => {
    const permission = await requestPushPermission();
    setNotificationPermission(permission);
    
    if (permission === "granted") {
      toast({
        title: "Notificações ativadas",
        description: "Você receberá lembretes mesmo com o app fechado!",
      });
    } else if (permission === "denied") {
      toast({
        title: "Notificações bloqueadas",
        description: "Ative as notificações nas configurações do navegador",
        variant: "destructive"
      });
    }
  };

  const handleSendNotification = async (reminder: Reminder) => {
    const typeIcons = {
      medication: "💊",
      appointment: "📅",
      exam: "📋"
    };

    await sendPushNotification(
      `${typeIcons[reminder.type]} ${reminder.title}`,
      {
        body: reminder.description,
        tag: reminder.id,
        data: { url: '/reminders' }
      }
    );

    toast({
      title: reminder.title,
      description: reminder.description,
    });
  };

  const handleAddReminder = (reminder: Omit<Reminder, "id">) => {
    const newReminder = {
      ...reminder,
      id: Date.now().toString(),
    };
    setReminders([...reminders, newReminder]);
    toast({
      title: "Lembrete criado",
      description: "Seu lembrete foi configurado com sucesso",
    });
  };

  const handleEditReminder = (reminder: Reminder) => {
    setReminders(reminders.map((r) => (r.id === reminder.id ? reminder : r)));
    toast({
      title: "Lembrete atualizado",
      description: "As alterações foram salvas",
    });
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
    toast({
      title: "Lembrete excluído",
      description: "O lembrete foi removido",
    });
  };

  const handleToggleReminder = (id: string) => {
    setReminders(
      reminders.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      )
    );
  };

  const openEditDialog = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingReminder(undefined);
  };

  const getTypeIcon = (type: Reminder["type"]) => {
    switch (type) {
      case "medication":
        return <Pill className="h-4 w-4" />;
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "exam":
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: Reminder["type"]) => {
    switch (type) {
      case "medication":
        return "Medicamento";
      case "appointment":
        return "Consulta";
      case "exam":
        return "Exame";
    }
  };

  const getRepeatLabel = (repeat: Reminder["repeat"]) => {
    switch (repeat) {
      case "none":
        return "Não repete";
      case "daily":
        return "Diariamente";
      case "weekly":
        return "Semanalmente";
      case "monthly":
        return "Mensalmente";
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => 
    a.dateTime.getTime() - b.dateTime.getTime()
  );

  const upcomingReminders = sortedReminders.filter(r => !isPast(r.dateTime) && r.enabled);
  const pastReminders = sortedReminders.filter(r => isPast(r.dateTime) || !r.enabled);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-20">
      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Lembretes</h1>
              <p className="text-muted-foreground">
                Configure alarmes para não perder nada
              </p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Novo
          </Button>
        </div>

        {notificationPermission !== "granted" && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Bell className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Ative as notificações</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Receba alertas para não esquecer seus medicamentos e consultas, mesmo com o app fechado!
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={requestNotificationPermission} variant="outline" size="sm">
                      Ativar notificações
                    </Button>
                    <Button onClick={() => navigate("/install")} variant="ghost" size="sm">
                      Instalar app
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {upcomingReminders.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Próximos</h2>
            {upcomingReminders.map((reminder) => (
              <Card key={reminder.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(reminder.type)}
                        <Badge variant="outline">{getTypeLabel(reminder.type)}</Badge>
                        {reminder.repeat !== "none" && (
                          <Badge variant="secondary">{getRepeatLabel(reminder.repeat)}</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg">{reminder.title}</h3>
                      <p className="text-sm text-muted-foreground">{reminder.description}</p>
                      <p className="text-sm font-medium">
                        {format(reminder.dateTime, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(reminder)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {pastReminders.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-muted-foreground">Anteriores</h2>
            {pastReminders.map((reminder) => (
              <Card key={reminder.id} className="opacity-60">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(reminder.type)}
                        <Badge variant="outline">{getTypeLabel(reminder.type)}</Badge>
                      </div>
                      <h3 className="font-semibold">{reminder.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(reminder.dateTime, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteReminder(reminder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {reminders.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Nenhum lembrete configurado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie lembretes para medicamentos, consultas e exames
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar primeiro lembrete
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <ReminderDialog
        open={dialogOpen}
        onOpenChange={closeDialog}
        onSave={editingReminder ? handleEditReminder : handleAddReminder}
        reminder={editingReminder}
      />
    </div>
  );
};

export default Reminders;
