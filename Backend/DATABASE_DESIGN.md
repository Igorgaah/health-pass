# Projeto de Banco de Dados - Health Pass

## 1. Justificativa da Escolha do Banco de Dados

### PostgreSQL (via Supabase)

**Justificativa Técnica:**

1. **ACID Completo**: Garante integridade transacional para operações críticas de saúde
2. **Row Level Security (RLS)**: Segurança nativa por linha, essencial para dados médicos sensíveis
3. **JSON/JSONB**: Suporte nativo para dados semi-estruturados (ex: logs de auditoria)
4. **Full-text Search**: Busca avançada em documentos médicos
5. **Extensibilidade**: Suporta extensões como PostGIS, pg_trgm para buscas
6. **Open Source**: Sem custos de licenciamento
7. **Supabase Integration**: 
   - Autenticação integrada
   - Storage para documentos
   - Edge Functions para processamento
   - Real-time subscriptions
8. **Escalabilidade**: Suporta grandes volumes de dados com particionamento
9. **Conformidade**: Suporta requisitos de LGPD/GDPR para dados de saúde

## 2. Modelo Conceitual (Entidades e Relacionamentos)

### 2.1. Entidades Principais

#### **profiles** (Perfis de Usuário)
- **Relacionamento**: 1:1 com `auth.users` (Supabase Auth)
- **Atributos**: name, avatar_url, health_plan, phone, birth_date
- **Propósito**: Dados complementares do usuário autenticado

#### **specialties** (Especialidades Médicas)
- **Relacionamento**: 1:N com `doctors`, 1:N com `appointments`
- **Atributos**: name, description, icon
- **Propósito**: Catálogo de especialidades médicas

#### **doctors** (Médicos)
- **Relacionamento**: N:1 com `specialties`, 1:N com `appointments`
- **Atributos**: name, crm, phone, email, location, rating
- **Propósito**: Cadastro de profissionais de saúde

#### **appointments** (Consultas Médicas)
- **Relacionamento**: N:1 com `profiles`, N:1 com `doctors`, N:1 com `specialties`
- **Atributos**: scheduled_at, status, location, notes, preparation
- **Propósito**: Agendamento e histórico de consultas

#### **health_metrics** (Sinais Vitais)
- **Relacionamento**: N:1 com `profiles`
- **Atributos**: metric_type, value, systolic, diastolic, recorded_at
- **Propósito**: Registro de pressão arterial, peso, glicemia, etc.

#### **health_goals** (Metas de Saúde)
- **Relacionamento**: N:1 com `profiles` (1:1 por tipo de métrica)
- **Atributos**: metric_type, min_value, max_value, systolic_min/max, diastolic_min/max
- **Propósito**: Metas personalizadas para cada tipo de métrica

#### **reminders** (Lembretes)
- **Relacionamento**: N:1 com `profiles`
- **Atributos**: title, description, type, date_time, repeat_frequency, enabled
- **Propósito**: Lembretes para medicamentos, consultas, exames

#### **documents** (Documentos Médicos)
- **Relacionamento**: N:1 com `profiles`, 1:1 com `vaccines` (opcional)
- **Atributos**: name, type, file_url, doctor_name, date, validity_date
- **Propósito**: Armazenamento de exames, receitas, vacinas

#### **vaccines** (Vacinas)
- **Relacionamento**: N:1 com `profiles`, N:1 com `documents` (opcional)
- **Atributos**: name, dose_number, total_doses, application_date, next_dose_date
- **Propósito**: Controle detalhado de vacinação

#### **user_points** (Sistema de Gamificação)
- **Relacionamento**: 1:1 com `profiles`
- **Atributos**: total_points, level
- **Propósito**: Pontos e níveis do usuário

#### **achievements** (Conquistas)
- **Relacionamento**: N:N com `profiles` (via `user_achievements`)
- **Atributos**: name, description, icon, points_required, category
- **Propósito**: Conquistas disponíveis no sistema

#### **user_achievements** (Conquistas do Usuário)
- **Relacionamento**: N:1 com `profiles`, N:1 com `achievements`
- **Atributos**: unlocked_at
- **Propósito**: Conquistas desbloqueadas por usuário

#### **point_transactions** (Transações de Pontos)
- **Relacionamento**: N:1 com `profiles`
- **Atributos**: points, reason, category, created_at
- **Propósito**: Histórico de ganho de pontos

#### **user_roles** (Roles de Usuário)
- **Relacionamento**: N:1 com `auth.users`
- **Atributos**: role (admin, user)
- **Propósito**: Controle de acesso baseado em roles

#### **audit_log** (Log de Auditoria)
- **Relacionamento**: N:1 com `auth.users` (opcional)
- **Atributos**: action, table_name, record_id, old_data, new_data
- **Propósito**: Rastreabilidade de todas as operações críticas

### 2.2. Diagrama de Relacionamentos

```
auth.users (1) ────< (1) profiles
                        │
                        ├───< (N) appointments ────> (N) doctors ────> (N) specialties
                        ├───< (N) health_metrics
                        ├───< (N) health_goals
                        ├───< (N) reminders
                        ├───< (N) documents ────< (1) vaccines
                        ├───< (1) user_points ────< (N) point_transactions
                        ├───< (N) user_achievements ────> (N) achievements
                        └───< (N) audit_log
```

## 3. Modelo Lógico (Normalização)

### 3.1. Normalização 3FN (Terceira Forma Normal)

Todas as tabelas seguem a **3FN**:
- ✅ Eliminação de dependências transitivas
- ✅ Chaves primárias claras (UUID)
- ✅ Dependências funcionais identificadas
- ✅ Redundância mínima
- ✅ Integridade referencial garantida

### 3.2. Estrutura Detalhada das Tabelas

#### **specialties**
| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| name | TEXT | NOT NULL, UNIQUE | Nome da especialidade |
| description | TEXT | NULL | Descrição detalhada |
| icon | TEXT | NULL | Ícone para UI |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Última atualização |

**Justificativa**: Tabela de catálogo, normalizada para evitar duplicação.

#### **doctors**
| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| specialty_id | UUID | FK → specialties(id) | Especialidade do médico |
| name | TEXT | NOT NULL | Nome completo |
| crm | TEXT | NULL | Registro profissional |
| phone | TEXT | NULL | Telefone de contato |
| email | TEXT | NULL | Email profissional |
| location | TEXT | NULL | Localização/clínica |
| address | TEXT | NULL | Endereço completo |
| rating | DECIMAL(3,2) | DEFAULT 0.0, CHECK (0-5) | Avaliação média |
| bio | TEXT | NULL | Biografia |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Última atualização |

**Justificativa**: Dados do médico separados para reutilização e normalização.

#### **appointments**
| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| user_id | UUID | FK → profiles(user_id), NOT NULL | Usuário |
| doctor_id | UUID | FK → doctors(id) | Médico (opcional) |
| specialty_id | UUID | FK → specialties(id) | Especialidade |
| scheduled_at | TIMESTAMPTZ | NOT NULL | Data/hora agendada |
| duration_minutes | INTEGER | DEFAULT 30, CHECK > 0 | Duração em minutos |
| status | appointment_status | NOT NULL, DEFAULT 'pending' | Status da consulta |
| location | TEXT | NULL | Local da consulta |
| notes | TEXT | NULL | Observações do usuário |
| preparation | TEXT | NULL | Instruções de preparo |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Última atualização |
| cancelled_at | TIMESTAMPTZ | NULL | Data de cancelamento |
| cancelled_reason | TEXT | NULL | Motivo do cancelamento |

**Justificativa**: 
- `status` como ENUM garante consistência
- `cancelled_at` permite soft delete
- Índices em `user_id`, `scheduled_at`, `status` para performance

#### **health_metrics**
| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| user_id | UUID | FK → profiles(user_id), NOT NULL | Usuário |
| metric_type | health_metric_type | NOT NULL | Tipo de métrica |
| value | DECIMAL(10,2) | NULL | Valor numérico |
| systolic | INTEGER | NULL | Pressão sistólica |
| diastolic | INTEGER | NULL | Pressão diastólica |
| unit | TEXT | DEFAULT 'default' | Unidade de medida |
| notes | TEXT | NULL | Observações |
| recorded_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data do registro |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |

**Justificativa**:
- `metric_type` como ENUM garante tipos válidos
- `systolic`/`diastolic` separados para pressão arterial
- `value` genérico para outros tipos (peso, glicemia)
- Índices compostos para queries por usuário + tipo + data

#### **health_goals**
| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| user_id | UUID | FK → profiles(user_id), NOT NULL | Usuário |
| metric_type | health_metric_type | NOT NULL | Tipo de métrica |
| min_value | DECIMAL(10,2) | NULL | Valor mínimo |
| max_value | DECIMAL(10,2) | NULL | Valor máximo |
| systolic_min | INTEGER | NULL | Sistólica mínima |
| systolic_max | INTEGER | NULL | Sistólica máxima |
| diastolic_min | INTEGER | NULL | Diastólica mínima |
| diastolic_max | INTEGER | NULL | Diastólica máxima |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Última atualização |
| UNIQUE(user_id, metric_type) | | | Uma meta por tipo |

**Justificativa**: 
- UNIQUE garante uma meta por tipo de métrica por usuário
- Campos separados para pressão arterial (sistólica/diastólica)

#### **reminders**
| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| user_id | UUID | FK → profiles(user_id), NOT NULL | Usuário |
| title | TEXT | NOT NULL | Título do lembrete |
| description | TEXT | NULL | Descrição detalhada |
| type | reminder_type | NOT NULL | Tipo (medication, appointment, exam) |
| date_time | TIMESTAMPTZ | NOT NULL | Data/hora do lembrete |
| repeat_frequency | repeat_frequency | NOT NULL, DEFAULT 'none' | Frequência de repetição |
| enabled | BOOLEAN | NOT NULL, DEFAULT true | Ativo/Inativo |
| completed_at | TIMESTAMPTZ | NULL | Data de conclusão |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Última atualização |

**Justificativa**:
- `enabled` permite desativar sem deletar
- `completed_at` rastreia conclusão para gamificação
- Índices em `user_id`, `date_time`, `enabled` para queries eficientes

#### **documents**
| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| user_id | UUID | FK → profiles(user_id), NOT NULL | Usuário |
| name | TEXT | NOT NULL | Nome do documento |
| type | document_type | NOT NULL | Tipo (exam, prescription, vaccine) |
| file_url | TEXT | NOT NULL | URL do arquivo no storage |
| file_size | BIGINT | NULL | Tamanho em bytes |
| mime_type | TEXT | NULL | Tipo MIME do arquivo |
| doctor_name | TEXT | NULL | Nome do médico |
| doctor_crm | TEXT | NULL | CRM do médico |
| date | DATE | NOT NULL | Data do documento |
| validity_date | DATE | NULL | Data de validade |
| notes | TEXT | NULL | Observações |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Última atualização |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |

**Justificativa**:
- `deleted_at` para soft delete (LGPD compliance)
- `file_url` aponta para Supabase Storage
- Índice parcial em `deleted_at IS NULL` para queries eficientes

#### **vaccines**
| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| user_id | UUID | FK → profiles(user_id), NOT NULL | Usuário |
| name | TEXT | NOT NULL | Nome da vacina |
| dose_number | INTEGER | DEFAULT 1 | Número da dose |
| total_doses | INTEGER | DEFAULT 1 | Total de doses necessárias |
| application_date | DATE | NOT NULL | Data de aplicação |
| next_dose_date | DATE | NULL | Data da próxima dose |
| location | TEXT | NULL | Local de aplicação |
| batch_number | TEXT | NULL | Lote da vacina |
| document_id | UUID | FK → documents(id) | Documento relacionado |
| notes | TEXT | NULL | Observações |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Última atualização |

**Justificativa**:
- Tabela separada para controle detalhado de vacinação
- `next_dose_date` para lembretes automáticos
- Relacionamento opcional com `documents` para comprovante

#### **audit_log**
| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| user_id | UUID | FK → auth.users(id) | Usuário que executou |
| action | TEXT | NOT NULL | Ação (INSERT, UPDATE, DELETE) |
| table_name | TEXT | NOT NULL | Tabela afetada |
| record_id | UUID | NULL | ID do registro |
| old_data | JSONB | NULL | Dados anteriores |
| new_data | JSONB | NULL | Dados novos |
| ip_address | INET | NULL | IP do usuário |
| user_agent | TEXT | NULL | User agent do navegador |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data do log |

**Justificativa**:
- JSONB para flexibilidade em diferentes estruturas
- Rastreabilidade completa para compliance
- Índices em `user_id`, `table_name`, `created_at` para queries

## 4. Estratégias de Performance

### 4.1. Índices

**Índices B-tree** (busca por range):
- `appointments(user_id, scheduled_at DESC)` - Próximas consultas
- `health_metrics(user_id, metric_type, recorded_at DESC)` - Histórico
- `reminders(user_id, enabled, date_time)` - Lembretes ativos
- `documents(user_id, type, date DESC)` - Documentos por tipo

**Índices Parciais** (filtros comuns):
- `documents(deleted_at) WHERE deleted_at IS NULL` - Apenas ativos
- `vaccines(next_dose_date) WHERE next_dose_date IS NOT NULL` - Próximas doses

**Índices Simples**:
- Todas as foreign keys
- Campos de busca frequente (status, type, etc.)

### 4.2. Paginação

**Estratégia Cursor-based** (recomendada para grandes volumes):
```sql
-- Exemplo: Próximas consultas
SELECT * FROM appointments
WHERE user_id = $1
  AND scheduled_at > $2  -- cursor
ORDER BY scheduled_at ASC
LIMIT 20;
```

**Estratégia OFFSET/LIMIT** (para volumes menores):
```sql
SELECT * FROM appointments
WHERE user_id = $1
ORDER BY scheduled_at DESC
LIMIT 20 OFFSET $2;
```

### 4.3. Views Materializadas

Para relatórios complexos:
```sql
CREATE MATERIALIZED VIEW user_health_stats AS
SELECT 
  user_id,
  metric_type,
  COUNT(*) as total_records,
  AVG(value) as avg_value,
  MAX(recorded_at) as last_recorded
FROM health_metrics
GROUP BY user_id, metric_type;

-- Atualizar periodicamente
REFRESH MATERIALIZED VIEW user_health_stats;
```

## 5. Segurança e Boas Práticas

### 5.1. Row Level Security (RLS)

**Política Base**: Usuários só acessam seus próprios dados
```sql
CREATE POLICY "Users can view their own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);
```

**Política Admin**: Admins acessam tudo
```sql
CREATE POLICY "Admins can view all"
ON table_name FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
```

### 5.2. Criptografia

- **Senhas**: Hash via Supabase Auth (Argon2)
- **Dados em trânsito**: TLS/SSL obrigatório
- **Dados em repouso**: Criptografia do Supabase Storage
- **Dados sensíveis**: Campos críticos podem usar `pgcrypto` se necessário

### 5.3. Proteções

**SQL Injection**:
- ✅ Prepared statements (Supabase usa por padrão)
- ✅ Validação de tipos
- ✅ Sanitização de inputs

**Data Leakage**:
- ✅ RLS em todas as tabelas
- ✅ Políticas restritivas
- ✅ Validação de permissões

**Escalada de Privilégios**:
- ✅ Funções SECURITY DEFINER com search_path
- ✅ Validação de roles
- ✅ Auditoria de ações administrativas

### 5.4. Backups e Recuperação

**Estratégia Supabase**:
- Backups automáticos diários
- Point-in-time recovery (7 dias)
- Retenção configurável

**Plano de Recuperação**:
1. Identificar ponto de restauração
2. Restaurar via Supabase Dashboard
3. Validar integridade referencial
4. Notificar usuários se necessário

## 6. Versionamento

### 6.1. Migrações

Todas as mudanças via migrações numeradas:
```
20250116000000_complete_database_schema.sql
20250117000000_add_indexes.sql
20250118000000_add_functions.sql
```

### 6.2. Versionamento de Schema

Tabela de versão (opcional):
```sql
CREATE TABLE schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 7. Log de Auditoria

### 7.1. Tabela audit_log

Registra todas as operações críticas:
- INSERT, UPDATE, DELETE em tabelas sensíveis
- Dados antigos e novos (JSONB)
- Usuário, IP, timestamp

### 7.2. Triggers Automáticos

```sql
CREATE TRIGGER audit_appointments
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH ROW
EXECUTE FUNCTION log_audit();
```

## 8. Conformidade e Compliance

### 8.1. LGPD/GDPR

- ✅ Soft delete para recuperação
- ✅ Log de auditoria completo
- ✅ Direito ao esquecimento (DELETE com cascade)
- ✅ Exportação de dados do usuário

### 8.2. HIPAA (se aplicável)

- ✅ Criptografia em trânsito e repouso
- ✅ Controle de acesso granular
- ✅ Auditoria completa
- ✅ Backup e recuperação

---

**Versão**: 1.0.0  
**Data**: 2025-01-16  
**Autor**: Sistema Health Pass

