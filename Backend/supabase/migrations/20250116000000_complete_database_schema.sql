-- =====================================================
-- HEALTH PASS - SCHEMA COMPLETO DO BANCO DE DADOS
-- Versão: 1.0.0
-- Data: 2025-01-16
-- Descrição: Criação completa do schema do banco de dados
-- =====================================================

-- =====================================================
-- 1. ENUMS
-- =====================================================

-- Enum para status de consultas
DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM (
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'rescheduled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para tipos de métricas de saúde
DO $$ BEGIN
  CREATE TYPE health_metric_type AS ENUM (
    'blood_pressure',
    'weight',
    'glucose',
    'heart_rate',
    'temperature',
    'oxygen_saturation'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para tipos de lembretes
DO $$ BEGIN
  CREATE TYPE reminder_type AS ENUM (
    'medication',
    'appointment',
    'exam',
    'vaccine',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para frequência de repetição
DO $$ BEGIN
  CREATE TYPE repeat_frequency AS ENUM (
    'none',
    'daily',
    'weekly',
    'monthly',
    'yearly'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para tipos de documentos
DO $$ BEGIN
  CREATE TYPE document_type AS ENUM (
    'exam',
    'prescription',
    'vaccine',
    'report',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de Especialidades Médicas
CREATE TABLE IF NOT EXISTS public.specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Médicos
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  crm TEXT,
  phone TEXT,
  email TEXT,
  location TEXT,
  address TEXT,
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Consultas
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30 CHECK (duration_minutes > 0),
  status appointment_status NOT NULL DEFAULT 'pending',
  location TEXT,
  notes TEXT,
  preparation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_reason TEXT
);

-- Tabela de Sinais Vitais
CREATE TABLE IF NOT EXISTS public.health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  metric_type health_metric_type NOT NULL,
  value DECIMAL(10,2),
  systolic INTEGER,
  diastolic INTEGER,
  unit TEXT DEFAULT 'default',
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Metas de Saúde
CREATE TABLE IF NOT EXISTS public.health_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  metric_type health_metric_type NOT NULL,
  min_value DECIMAL(10,2),
  max_value DECIMAL(10,2),
  systolic_min INTEGER,
  systolic_max INTEGER,
  diastolic_min INTEGER,
  diastolic_max INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_type)
);

-- Tabela de Lembretes
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type reminder_type NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  repeat_frequency repeat_frequency NOT NULL DEFAULT 'none',
  enabled BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Documentos Médicos
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  doctor_name TEXT,
  doctor_crm TEXT,
  date DATE NOT NULL,
  validity_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Vacinas (detalhada)
CREATE TABLE IF NOT EXISTS public.vaccines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose_number INTEGER DEFAULT 1,
  total_doses INTEGER DEFAULT 1,
  application_date DATE NOT NULL,
  next_dose_date DATE,
  location TEXT,
  batch_number TEXT,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Log de Auditoria
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para appointments
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_specialty_id ON public.appointments(specialty_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_user_scheduled ON public.appointments(user_id, scheduled_at DESC);

-- Índices para health_metrics
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id ON public.health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON public.health_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_health_metrics_recorded_at ON public.health_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_type_date ON public.health_metrics(user_id, metric_type, recorded_at DESC);

-- Índices para health_goals
CREATE INDEX IF NOT EXISTS idx_health_goals_user_id ON public.health_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_health_goals_metric_type ON public.health_goals(metric_type);

-- Índices para reminders
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date_time ON public.reminders(date_time);
CREATE INDEX IF NOT EXISTS idx_reminders_enabled ON public.reminders(enabled);
CREATE INDEX IF NOT EXISTS idx_reminders_user_enabled_date ON public.reminders(user_id, enabled, date_time);
CREATE INDEX IF NOT EXISTS idx_reminders_completed_at ON public.reminders(completed_at) WHERE completed_at IS NULL;

-- Índices para documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_date ON public.documents(date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_type_date ON public.documents(user_id, type, date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON public.documents(deleted_at) WHERE deleted_at IS NULL;

-- Índices para vaccines
CREATE INDEX IF NOT EXISTS idx_vaccines_user_id ON public.vaccines(user_id);
CREATE INDEX IF NOT EXISTS idx_vaccines_application_date ON public.vaccines(application_date DESC);
CREATE INDEX IF NOT EXISTS idx_vaccines_next_dose_date ON public.vaccines(next_dose_date) WHERE next_dose_date IS NOT NULL;

-- Índices para doctors
CREATE INDEX IF NOT EXISTS idx_doctors_specialty_id ON public.doctors(specialty_id);
CREATE INDEX IF NOT EXISTS idx_doctors_name ON public.doctors(name);

-- Índices para audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_table_date ON public.audit_log(user_id, table_name, created_at DESC);

-- =====================================================
-- 4. TRIGGERS E FUNÇÕES
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_specialties_updated_at ON public.specialties;
CREATE TRIGGER update_specialties_updated_at
  BEFORE UPDATE ON public.specialties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_doctors_updated_at ON public.doctors;
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_goals_updated_at ON public.health_goals;
CREATE TRIGGER update_health_goals_updated_at
  BEFORE UPDATE ON public.health_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reminders_updated_at ON public.reminders;
CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_vaccines_updated_at ON public.vaccines;
CREATE TRIGGER update_vaccines_updated_at
  BEFORE UPDATE ON public.vaccines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para log de auditoria
CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers de auditoria (apenas para tabelas críticas)
DROP TRIGGER IF EXISTS audit_appointments ON public.appointments;
CREATE TRIGGER audit_appointments
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit();

DROP TRIGGER IF EXISTS audit_documents ON public.documents;
CREATE TRIGGER audit_documents
  AFTER INSERT OR UPDATE OR DELETE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit();

DROP TRIGGER IF EXISTS audit_health_metrics ON public.health_metrics;
CREATE TRIGGER audit_health_metrics
  AFTER INSERT OR UPDATE OR DELETE ON public.health_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit();

-- Função para adicionar pontos ao completar lembrete
CREATE OR REPLACE FUNCTION public.award_points_on_reminder_completion()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER;
  reason_text TEXT;
BEGIN
  -- Só processa se o lembrete foi marcado como completo
  IF NEW.completed_at IS NOT NULL AND (OLD.completed_at IS NULL OR OLD.completed_at IS DISTINCT FROM NEW.completed_at) THEN
    -- Define pontos baseado no tipo
    CASE NEW.type
      WHEN 'medication' THEN
        points_to_award := 10;
        reason_text := 'Medicamento tomado no horário';
      WHEN 'appointment' THEN
        points_to_award := 20;
        reason_text := 'Consulta realizada';
      WHEN 'exam' THEN
        points_to_award := 15;
        reason_text := 'Exame realizado';
      ELSE
        points_to_award := 5;
        reason_text := 'Lembrete completado';
    END CASE;

    -- Adiciona transação de pontos
    INSERT INTO public.point_transactions (user_id, points, reason, category)
    VALUES (NEW.user_id, points_to_award, reason_text, 'reminders');

    -- Atualiza total de pontos
    INSERT INTO public.user_points (user_id, total_points, level)
    VALUES (NEW.user_id, points_to_award, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET total_points = user_points.total_points + points_to_award,
        updated_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS reminder_completion_points ON public.reminders;
CREATE TRIGGER reminder_completion_points
  AFTER UPDATE ON public.reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.award_points_on_reminder_completion();

-- Função para calcular nível baseado em pontos
CREATE OR REPLACE FUNCTION public.calculate_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(points / 100) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para atualizar nível automaticamente
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level = public.calculate_level(NEW.total_points);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_level_trigger ON public.user_points;
CREATE TRIGGER update_level_trigger
  BEFORE INSERT OR UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_level();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas para specialties (leitura pública)
DROP POLICY IF EXISTS "Anyone can view specialties" ON public.specialties;
CREATE POLICY "Anyone can view specialties"
  ON public.specialties FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage specialties" ON public.specialties;
CREATE POLICY "Admins can manage specialties"
  ON public.specialties FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para doctors (leitura pública)
DROP POLICY IF EXISTS "Anyone can view doctors" ON public.doctors;
CREATE POLICY "Anyone can view doctors"
  ON public.doctors FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage doctors" ON public.doctors;
CREATE POLICY "Admins can manage doctors"
  ON public.doctors FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para appointments
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
CREATE POLICY "Users can view their own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own appointments" ON public.appointments;
CREATE POLICY "Users can insert their own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
CREATE POLICY "Users can update their own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;
CREATE POLICY "Users can delete their own appointments"
  ON public.appointments FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
CREATE POLICY "Admins can view all appointments"
  ON public.appointments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para health_metrics
DROP POLICY IF EXISTS "Users can view their own metrics" ON public.health_metrics;
CREATE POLICY "Users can view their own metrics"
  ON public.health_metrics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own metrics" ON public.health_metrics;
CREATE POLICY "Users can insert their own metrics"
  ON public.health_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own metrics" ON public.health_metrics;
CREATE POLICY "Users can update their own metrics"
  ON public.health_metrics FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own metrics" ON public.health_metrics;
CREATE POLICY "Users can delete their own metrics"
  ON public.health_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para health_goals
DROP POLICY IF EXISTS "Users can manage their own goals" ON public.health_goals;
CREATE POLICY "Users can manage their own goals"
  ON public.health_goals FOR ALL
  USING (auth.uid() = user_id);

-- Políticas para reminders
DROP POLICY IF EXISTS "Users can manage their own reminders" ON public.reminders;
CREATE POLICY "Users can manage their own reminders"
  ON public.reminders FOR ALL
  USING (auth.uid() = user_id);

-- Políticas para documents
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view their own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
CREATE POLICY "Users can insert their own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
CREATE POLICY "Users can update their own documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para vaccines
DROP POLICY IF EXISTS "Users can manage their own vaccines" ON public.vaccines;
CREATE POLICY "Users can manage their own vaccines"
  ON public.vaccines FOR ALL
  USING (auth.uid() = user_id);

-- Políticas para audit_log (apenas admins)
DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;
CREATE POLICY "Admins can view audit log"
  ON public.audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 6. VIEWS ÚTEIS
-- =====================================================

-- View para próximas consultas
CREATE OR REPLACE VIEW public.upcoming_appointments AS
SELECT 
  a.id,
  a.user_id,
  a.scheduled_at,
  a.status,
  a.location,
  d.name AS doctor_name,
  s.name AS specialty_name,
  p.name AS user_name
FROM public.appointments a
LEFT JOIN public.doctors d ON a.doctor_id = d.id
LEFT JOIN public.specialties s ON a.specialty_id = s.id
LEFT JOIN public.profiles p ON a.user_id = p.user_id
WHERE a.scheduled_at > now()
  AND a.status IN ('pending', 'confirmed')
ORDER BY a.scheduled_at ASC;

-- View para estatísticas de saúde do usuário
CREATE OR REPLACE VIEW public.user_health_stats AS
SELECT 
  hm.user_id,
  hm.metric_type,
  COUNT(*) AS total_records,
  AVG(hm.value) AS avg_value,
  MIN(hm.value) AS min_value,
  MAX(hm.value) AS max_value,
  AVG(hm.systolic) AS avg_systolic,
  AVG(hm.diastolic) AS avg_diastolic,
  MAX(hm.recorded_at) AS last_recorded
FROM public.health_metrics hm
GROUP BY hm.user_id, hm.metric_type;

-- View para lembretes ativos
CREATE OR REPLACE VIEW public.active_reminders AS
SELECT 
  r.*,
  p.name AS user_name
FROM public.reminders r
JOIN public.profiles p ON r.user_id = p.user_id
WHERE r.enabled = true
  AND r.date_time > now()
ORDER BY r.date_time ASC;

-- View para próximas vacinas
CREATE OR REPLACE VIEW public.upcoming_vaccines AS
SELECT 
  v.*,
  p.name AS user_name
FROM public.vaccines v
JOIN public.profiles p ON v.user_id = p.user_id
WHERE v.next_dose_date IS NOT NULL
  AND v.next_dose_date >= CURRENT_DATE
ORDER BY v.next_dose_date ASC;

-- =====================================================
-- 7. DADOS INICIAIS (SEED)
-- =====================================================

-- Inserir especialidades padrão
INSERT INTO public.specialties (name, description, icon) VALUES
('Cardiologia', 'Especialidade médica focada no coração e sistema circulatório', 'heart'),
('Clínica Geral', 'Atenção primária à saúde e medicina preventiva', 'stethoscope'),
('Dermatologia', 'Diagnóstico e tratamento de doenças da pele', 'skin'),
('Endocrinologia', 'Tratamento de distúrbios hormonais e metabólicos', 'activity'),
('Ginecologia', 'Saúde da mulher e sistema reprodutivo', 'user'),
('Neurologia', 'Doenças do sistema nervoso', 'brain'),
('Oftalmologia', 'Cuidados com a visão e olhos', 'eye'),
('Ortopedia', 'Tratamento de ossos, articulações e músculos', 'bone'),
('Pediatria', 'Cuidados médicos para crianças e adolescentes', 'baby'),
('Psiquiatria', 'Saúde mental e transtornos psiquiátricos', 'mind'),
('Urologia', 'Sistema urinário e reprodutor masculino', 'kidney')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 8. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.appointments IS 'Armazena todas as consultas médicas agendadas pelos usuários';
COMMENT ON TABLE public.health_metrics IS 'Registros de sinais vitais e métricas de saúde';
COMMENT ON TABLE public.health_goals IS 'Metas personalizadas de saúde por tipo de métrica';
COMMENT ON TABLE public.reminders IS 'Lembretes personalizados para medicamentos, consultas e exames';
COMMENT ON TABLE public.documents IS 'Documentos médicos (exames, receitas, vacinas) com soft delete';
COMMENT ON TABLE public.vaccines IS 'Registro detalhado de vacinações com controle de doses';
COMMENT ON TABLE public.audit_log IS 'Log de auditoria para rastreabilidade de operações críticas';
COMMENT ON TABLE public.specialties IS 'Catálogo de especialidades médicas disponíveis';
COMMENT ON TABLE public.doctors IS 'Cadastro de profissionais de saúde';

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Atualiza automaticamente o campo updated_at';
COMMENT ON FUNCTION public.log_audit() IS 'Registra operações críticas no log de auditoria';
COMMENT ON FUNCTION public.award_points_on_reminder_completion() IS 'Adiciona pontos quando um lembrete é completado';
COMMENT ON FUNCTION public.calculate_level(points INTEGER) IS 'Calcula o nível do usuário baseado nos pontos';

