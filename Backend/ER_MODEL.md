# Modelo Entidade-Relacionamento (ER) - Health Pass

## Diagrama Conceitual

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
│  (Autenticação) │
└────────┬────────┘
         │ 1:1
         │
┌────────▼────────┐
│    profiles     │
│  - id (PK)      │
│  - user_id (FK) │
│  - name         │
│  - avatar_url   │
│  - health_plan  │
│  - phone        │
│  - birth_date   │
└────────┬────────┘
         │
         │ 1:N
         ├─────────────────────────────────────────────────────────────┐
         │                                                              │
┌────────▼────────┐                                    ┌───────────────▼────────┐
│  appointments   │                                    │   health_metrics      │
│  - id (PK)      │                                    │   - id (PK)           │
│  - user_id (FK)│                                    │   - user_id (FK)      │
│  - doctor_id    │                                    │   - metric_type       │
│  - specialty_id│                                    │   - value             │
│  - scheduled_at │                                    │   - systolic          │
│  - status       │                                    │   - diastolic         │
│  - location     │                                    │   - recorded_at       │
│  - notes        │                                    └───────────────────────┘
└────────┬────────┘
         │                                            
         │ N:1                                        ┌───────────────────────┐
         │                                            │   health_goals       │
┌────────▼────────┐                                  │   - id (PK)          │
│    doctors       │                                  │   - user_id (FK)     │
│  - id (PK)      │                                  │   - metric_type       │
│  - specialty_id │                                  │   - min_value         │
│  - name         │                                  │   - max_value         │
│  - crm          │                                  │   - systolic_min/max  │
│  - phone        │                                  │   - diastolic_min/max │
│  - email        │                                  └───────────────────────┘
│  - location     │
│  - rating       │
└────────┬────────┘
         │ N:1
         │
┌────────▼────────┐
│  specialties    │
│  - id (PK)      │
│  - name (UNIQUE)│
│  - description │
│  - icon        │
└─────────────────┘

┌─────────────────┐
│    profiles      │
└────────┬─────────┘
         │
         │ 1:N
         ├─────────────────────────────────────────────────────────────┐
         │                                                              │
┌────────▼────────┐                                    ┌───────────────▼────────┐
│   reminders      │                                    │     documents          │
│  - id (PK)      │                                    │   - id (PK)           │
│  - user_id (FK) │                                    │   - user_id (FK)      │
│  - title        │                                    │   - name              │
│  - type         │                                    │   - type              │
│  - date_time    │                                    │   - file_url          │
│  - repeat_freq  │                                    │   - date              │
│  - enabled      │                                    │   - validity_date     │
│  - completed_at │                                    │   - deleted_at        │
└─────────────────┘                                    └───────────┬───────────┘
                                                                    │ 1:1
                                                                    │
                                                          ┌─────────▼─────────┐
                                                          │     vaccines      │
                                                          │   - id (PK)       │
                                                          │   - user_id (FK)  │
                                                          │   - name          │
                                                          │   - dose_number   │
                                                          │   - total_doses   │
                                                          │   - app_date      │
                                                          │   - next_dose     │
                                                          │   - document_id   │
                                                          └───────────────────┘

┌─────────────────┐
│    profiles      │
└────────┬─────────┘
         │
         │ 1:1
         │
┌────────▼────────┐
│  user_points    │
│  - id (PK)      │
│  - user_id (FK) │
│  - total_points │
│  - level        │
└────────┬────────┘
         │ 1:N
         │
┌────────▼────────┐
│point_transactions│
│  - id (PK)      │
│  - user_id (FK) │
│  - points       │
│  - reason       │
│  - category     │
└─────────────────┘

┌─────────────────┐
│    profiles      │
└────────┬─────────┘
         │ N:N
         │
┌────────▼────────┐         ┌─────────────────┐
│user_achievements│────────▶│  achievements   │
│  - id (PK)      │   N:1   │  - id (PK)      │
│  - user_id (FK) │         │  - name         │
│  - achievement_id│        │  - description  │
│  - unlocked_at  │         │  - points_req   │
└─────────────────┘         │  - category     │
                            └─────────────────┘

┌─────────────────┐
│   auth.users     │
└────────┬─────────┘
         │ 1:N
         │
┌────────▼────────┐
│  audit_log      │
│  - id (PK)      │
│  - user_id (FK) │
│  - action       │
│  - table_name   │
│  - record_id    │
│  - old_data     │
│  - new_data     │
└─────────────────┘
```

## Relacionamentos Detalhados

### 1. profiles ↔ auth.users
- **Tipo**: 1:1 (Obrigatório)
- **Cardinalidade**: Um usuário autenticado tem exatamente um perfil
- **Cascade**: DELETE CASCADE (se usuário for deletado, perfil também é)

### 2. profiles ↔ appointments
- **Tipo**: 1:N
- **Cardinalidade**: Um usuário pode ter múltiplas consultas
- **Cascade**: DELETE CASCADE

### 3. doctors ↔ appointments
- **Tipo**: N:1 (Opcional)
- **Cardinalidade**: Um médico pode ter múltiplas consultas, mas uma consulta pode não ter médico específico
- **Cascade**: SET NULL (se médico for deletado, consulta mantém especialidade)

### 4. specialties ↔ appointments
- **Tipo**: N:1 (Opcional)
- **Cardinalidade**: Uma especialidade pode ter múltiplas consultas
- **Cascade**: SET NULL

### 5. specialties ↔ doctors
- **Tipo**: 1:N
- **Cardinalidade**: Uma especialidade pode ter múltiplos médicos
- **Cascade**: SET NULL

### 6. profiles ↔ health_metrics
- **Tipo**: 1:N
- **Cardinalidade**: Um usuário pode ter múltiplos registros de métricas
- **Cascade**: DELETE CASCADE

### 7. profiles ↔ health_goals
- **Tipo**: 1:N (mas UNIQUE por metric_type)
- **Cardinalidade**: Um usuário tem uma meta por tipo de métrica
- **Cascade**: DELETE CASCADE

### 8. profiles ↔ reminders
- **Tipo**: 1:N
- **Cardinalidade**: Um usuário pode ter múltiplos lembretes
- **Cascade**: DELETE CASCADE

### 9. profiles ↔ documents
- **Tipo**: 1:N
- **Cardinalidade**: Um usuário pode ter múltiplos documentos
- **Cascade**: DELETE CASCADE
- **Soft Delete**: deleted_at para LGPD compliance

### 10. documents ↔ vaccines
- **Tipo**: 1:1 (Opcional)
- **Cardinalidade**: Uma vacina pode ter um documento relacionado (comprovante)
- **Cascade**: SET NULL

### 11. profiles ↔ vaccines
- **Tipo**: 1:N
- **Cardinalidade**: Um usuário pode ter múltiplas vacinas
- **Cascade**: DELETE CASCADE

### 12. profiles ↔ user_points
- **Tipo**: 1:1
- **Cardinalidade**: Um usuário tem um registro de pontos
- **Cascade**: DELETE CASCADE

### 13. profiles ↔ point_transactions
- **Tipo**: 1:N
- **Cardinalidade**: Um usuário pode ter múltiplas transações de pontos
- **Cascade**: DELETE CASCADE

### 14. profiles ↔ user_achievements ↔ achievements
- **Tipo**: N:N (via tabela intermediária)
- **Cardinalidade**: Um usuário pode ter múltiplas conquistas, uma conquista pode ser de múltiplos usuários
- **Cascade**: DELETE CASCADE em ambos os lados

### 15. auth.users ↔ audit_log
- **Tipo**: 1:N (Opcional)
- **Cardinalidade**: Um usuário pode ter múltiplos logs de auditoria
- **Cascade**: SET NULL (logs são mantidos mesmo se usuário for deletado)

## Atributos Principais

### Entidade: profiles
- **PK**: id (UUID)
- **FK**: user_id → auth.users(id)
- **Unique**: user_id
- **Not Null**: id, user_id, name, created_at, updated_at

### Entidade: appointments
- **PK**: id (UUID)
- **FK**: user_id → profiles(user_id)
- **FK**: doctor_id → doctors(id) [NULLABLE]
- **FK**: specialty_id → specialties(id) [NULLABLE]
- **Not Null**: id, user_id, scheduled_at, status, created_at, updated_at
- **Check**: duration_minutes > 0
- **Enum**: status (pending, confirmed, completed, cancelled, rescheduled)

### Entidade: health_metrics
- **PK**: id (UUID)
- **FK**: user_id → profiles(user_id)
- **Not Null**: id, user_id, metric_type, recorded_at, created_at
- **Enum**: metric_type (blood_pressure, weight, glucose, heart_rate, temperature, oxygen_saturation)
- **Lógica**: value OU (systolic E diastolic) devem estar preenchidos

### Entidade: reminders
- **PK**: id (UUID)
- **FK**: user_id → profiles(user_id)
- **Not Null**: id, user_id, title, type, date_time, repeat_frequency, enabled, created_at, updated_at
- **Enum**: type (medication, appointment, exam, vaccine, other)
- **Enum**: repeat_frequency (none, daily, weekly, monthly, yearly)

## Dependências Funcionais

### Tabela: appointments
- id → user_id, doctor_id, specialty_id, scheduled_at, status, location, notes
- user_id → (não determina nada, mas é FK)
- scheduled_at + user_id → (pode determinar conflitos de agendamento)

### Tabela: health_metrics
- id → user_id, metric_type, value, systolic, diastolic, recorded_at
- user_id + metric_type + recorded_at → (pode ter múltiplos registros no mesmo dia)

### Tabela: health_goals
- user_id + metric_type → min_value, max_value, systolic_min/max, diastolic_min/max
- **UNIQUE(user_id, metric_type)**: Garante uma meta por tipo

### Tabela: reminders
- id → user_id, title, type, date_time, repeat_frequency, enabled
- user_id + date_time → (pode ter múltiplos lembretes no mesmo horário)

## Regras de Negócio

1. **Appointments**: 
   - Não pode agendar no passado
   - Status inicial é 'pending'
   - Cancelamento requer cancelled_reason

2. **Health Metrics**:
   - Pressão arterial requer systolic E diastolic
   - Outros tipos usam apenas value

3. **Reminders**:
   - Completar lembrete adiciona pontos automaticamente
   - Lembretes repetitivos geram novos registros

4. **Documents**:
   - Soft delete (deleted_at) para LGPD
   - Validity_date para receitas

5. **Vaccines**:
   - next_dose_date calculado automaticamente
   - Relacionamento opcional com documents

6. **User Points**:
   - Level calculado automaticamente (points / 100 + 1)
   - Transações são imutáveis (apenas INSERT)

## Índices Estratégicos

1. **appointments(user_id, scheduled_at DESC)**: Próximas consultas
2. **health_metrics(user_id, metric_type, recorded_at DESC)**: Histórico por tipo
3. **reminders(user_id, enabled, date_time)**: Lembretes ativos
4. **documents(user_id, type, date DESC) WHERE deleted_at IS NULL**: Documentos ativos
5. **vaccines(next_dose_date) WHERE next_dose_date IS NOT NULL**: Próximas vacinas

---

**Versão**: 1.0.0  
**Data**: 2025-01-16

