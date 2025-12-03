import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementBadge } from "@/components/AchievementBadge";
import { useGamification } from "@/hooks/useGamification";
import BottomNav from "@/components/BottomNav";

const Gamification = () => {
  const navigate = useNavigate();
  const { userPoints, achievements, userAchievements, loading } = useGamification();

  useEffect(() => {
    document.title = "Gamificação - Health Pass";
  }, []);

  const nextLevelPoints = userPoints ? userPoints.level * 100 : 100;
  const currentLevelProgress = userPoints
    ? ((userPoints.total_points % 100) / 100) * 100
    : 0;

  const unlockedAchievementIds = userAchievements.map(ua => ua.achievement_id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando conquistas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Gamificação</h1>
              <p className="text-sm text-muted-foreground">
                Conquistas e progresso
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* User Stats Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="h-8 w-8 text-primary" />
                Level {userPoints?.level || 1}
              </h2>
              <p className="text-muted-foreground mt-1">
                {userPoints?.total_points || 0} pontos totais
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Conquistas</p>
              <p className="text-2xl font-bold">
                {userAchievements.length}/{achievements.length}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso do nível</span>
              <span className="font-medium">
                {userPoints?.total_points || 0} / {nextLevelPoints}
              </span>
            </div>
            <Progress value={currentLevelProgress} className="h-3" />
            <p className="text-xs text-muted-foreground text-center">
              {100 - (userPoints?.total_points || 0) % 100} pontos para o próximo nível
            </p>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{userPoints?.total_points || 0}</p>
            <p className="text-xs text-muted-foreground">Pontos</p>
          </Card>
          <Card className="p-4 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{userAchievements.length}</p>
            <p className="text-xs text-muted-foreground">Conquistas</p>
          </Card>
          <Card className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{userPoints?.level || 1}</p>
            <p className="text-xs text-muted-foreground">Nível</p>
          </Card>
        </div>

        {/* Achievements Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="reminders">Lembretes</TabsTrigger>
            <TabsTrigger value="appointments">Consultas</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {achievements.map((achievement) => {
              const userAchievement = userAchievements.find(
                (ua) => ua.achievement_id === achievement.id
              );
              return (
                <AchievementBadge
                  key={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  icon={achievement.icon}
                  pointsRequired={achievement.points_required}
                  unlocked={!!userAchievement}
                  unlockedAt={userAchievement?.unlocked_at}
                />
              );
            })}
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4 mt-4">
            {achievements
              .filter((a) => a.category === "reminders")
              .map((achievement) => {
                const userAchievement = userAchievements.find(
                  (ua) => ua.achievement_id === achievement.id
                );
                return (
                  <AchievementBadge
                    key={achievement.id}
                    name={achievement.name}
                    description={achievement.description}
                    icon={achievement.icon}
                    pointsRequired={achievement.points_required}
                    unlocked={!!userAchievement}
                    unlockedAt={userAchievement?.unlocked_at}
                  />
                );
              })}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4 mt-4">
            {achievements
              .filter((a) => a.category === "appointments")
              .map((achievement) => {
                const userAchievement = userAchievements.find(
                  (ua) => ua.achievement_id === achievement.id
                );
                return (
                  <AchievementBadge
                    key={achievement.id}
                    name={achievement.name}
                    description={achievement.description}
                    icon={achievement.icon}
                    pointsRequired={achievement.points_required}
                    unlocked={!!userAchievement}
                    unlockedAt={userAchievement?.unlocked_at}
                  />
                );
              })}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4 mt-4">
            {achievements
              .filter((a) => a.category === "metrics")
              .map((achievement) => {
                const userAchievement = userAchievements.find(
                  (ua) => ua.achievement_id === achievement.id
                );
                return (
                  <AchievementBadge
                    key={achievement.id}
                    name={achievement.name}
                    description={achievement.description}
                    icon={achievement.icon}
                    pointsRequired={achievement.points_required}
                    unlocked={!!userAchievement}
                    unlockedAt={userAchievement?.unlocked_at}
                  />
                );
              })}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Gamification;
