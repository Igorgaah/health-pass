import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  pointsRequired: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export const AchievementBadge = ({
  name,
  description,
  icon,
  pointsRequired,
  unlocked,
  unlockedAt,
}: AchievementBadgeProps) => {
  // Get icon component dynamically
  const IconComponent = (LucideIcons as any)[
    icon.split('-').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')
  ] || LucideIcons.Award;

  return (
    <Card
      className={cn(
        "p-4 transition-all hover:scale-105",
        unlocked
          ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30"
          : "bg-muted/50 opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "p-3 rounded-full",
            unlocked
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          <IconComponent className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{name}</h3>
            {unlocked && (
              <Badge variant="default" className="ml-2">
                Desbloqueado
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <LucideIcons.Star className="h-3 w-3" />
            <span>{pointsRequired} pontos necessários</span>
          </div>
          {unlocked && unlockedAt && (
            <p className="text-xs text-primary pt-1">
              Desbloqueado em {new Date(unlockedAt).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
