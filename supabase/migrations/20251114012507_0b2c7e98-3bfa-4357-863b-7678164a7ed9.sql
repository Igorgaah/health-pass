-- Create user points table
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create point transactions table
CREATE TABLE public.point_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_points
CREATE POLICY "Users can view their own points"
ON public.user_points FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points"
ON public.user_points FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
ON public.user_points FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for achievements (public read)
CREATE POLICY "Anyone can view achievements"
ON public.achievements FOR SELECT
USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for point_transactions
CREATE POLICY "Users can view their own transactions"
ON public.point_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.point_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, points_required, category) VALUES
('Primeira Consulta', 'Registre sua primeira consulta', 'calendar-check', 10, 'appointments'),
('Pontualidade', 'Complete 5 lembretes no horário', 'clock', 50, 'reminders'),
('Compromisso com a Saúde', 'Complete 10 consultas', 'heart', 100, 'appointments'),
('Disciplina Total', 'Complete 20 lembretes consecutivos', 'trophy', 200, 'reminders'),
('Monitoramento Ativo', 'Registre sinais vitais por 7 dias seguidos', 'activity', 150, 'metrics'),
('Especialista', 'Complete 50 lembretes', 'star', 500, 'reminders'),
('Guardião da Saúde', 'Complete 25 consultas', 'shield', 300, 'appointments'),
('Mestre da Consistência', 'Registre sinais vitais por 30 dias seguidos', 'award', 1000, 'metrics');

-- Trigger function to update user_points updated_at
CREATE OR REPLACE FUNCTION public.update_user_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_points_updated_at_trigger
BEFORE UPDATE ON public.user_points
FOR EACH ROW
EXECUTE FUNCTION public.update_user_points_updated_at();