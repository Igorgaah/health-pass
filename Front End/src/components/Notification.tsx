import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'appointment' | 'medication' | 'exam' | 'general';
}

const Notification = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-primary/10 text-primary';
      case 'medication': return 'bg-accent/10 text-accent';
      case 'exam': return 'bg-secondary/10 text-secondary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notificações</SheetTitle>
          <SheetDescription>
            Você tem {unreadCount} notificações não lidas
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 transition-all ${
                  !notification.read ? 'border-l-4 border-l-primary' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      <Badge variant="outline" className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Notification;
