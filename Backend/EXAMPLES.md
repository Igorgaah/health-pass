# Exemplos de Uso - Health Pass Database

## Exemplos Práticos de Uso dos Repositories

### 1. Appointments (Consultas)

```typescript
import { AppointmentRepository } from './src/repositories/AppointmentRepository';

const appointmentRepo = new AppointmentRepository();

// Criar consulta
const appointment = await appointmentRepo.create({
  user_id: 'user-123',
  specialty_id: 'specialty-123',
  doctor_id: 'doctor-123',
  scheduled_at: '2025-02-01T10:00:00Z',
  location: 'Clínica XYZ',
  notes: 'Consulta de rotina',
  preparation: 'Jejum de 8 horas',
});

// Buscar próximas consultas
const upcoming = await appointmentRepo.findUpcoming('user-123', 5);

// Buscar consultas com filtros
const appointments = await appointmentRepo.findByUser('user-123', {
  status: 'confirmed',
  startDate: '2025-02-01',
  endDate: '2025-02-28',
  limit: 20,
  offset: 0,
});

// Cancelar consulta
await appointmentRepo.cancel('appointment-123', 'user-123', 'Motivo do cancelamento');

// Estatísticas
const stats = await appointmentRepo.countByStatus('user-123');
// { pending: 2, confirmed: 5, completed: 10, cancelled: 1 }
```

### 2. Health Metrics (Sinais Vitais)

```typescript
import { HealthMetricsRepository } from './src/repositories/HealthMetricsRepository';

const metricsRepo = new HealthMetricsRepository();

// Registrar pressão arterial
const bp = await metricsRepo.create({
  user_id: 'user-123',
  metric_type: 'blood_pressure',
  systolic: 120,
  diastolic: 80,
  notes: 'Medição pela manhã',
});

// Registrar peso
const weight = await metricsRepo.create({
  user_id: 'user-123',
  metric_type: 'weight',
  value: 70.5,
  unit: 'kg',
});

// Buscar histórico
const history = await metricsRepo.findHistory('user-123', 'weight', 30); // últimos 30 dias

// Buscar última medição
const latest = await metricsRepo.findLatest('user-123', 'blood_pressure');

// Estatísticas
const stats = await metricsRepo.getStats('user-123', 'weight');
// { total_records: 50, avg_value: 70.2, min_value: 68.0, max_value: 72.5 }
```

### 3. Reminders (Lembretes)

```typescript
import { ReminderRepository } from './src/repositories/ReminderRepository';

const reminderRepo = new ReminderRepository();

// Criar lembrete
const reminder = await reminderRepo.create({
  user_id: 'user-123',
  title: 'Tomar remédio',
  description: 'Antibiótico - 1 comprimido',
  type: 'medication',
  date_time: '2025-02-01T08:00:00Z',
  repeat_frequency: 'daily',
});

// Buscar lembretes ativos
const active = await reminderRepo.findActive('user-123', 10);

// Completar lembrete (adiciona pontos automaticamente)
await reminderRepo.complete('reminder-123', 'user-123');

// Buscar lembretes pendentes (para notificações)
const due = await reminderRepo.findDueReminders(5); // próximos 5 minutos
```

### 4. Documents (Documentos)

```typescript
import { DocumentRepository } from './src/repositories/DocumentRepository';

const documentRepo = new DocumentRepository();

// Upload de documento
const document = await documentRepo.create({
  user_id: 'user-123',
  name: 'Exame de Sangue',
  type: 'exam',
  file_url: 'https://storage.supabase.co/...',
  file_size: 1024000,
  mime_type: 'application/pdf',
  doctor_name: 'Dr. João Silva',
  doctor_crm: 'CRM-12345',
  date: '2025-01-15',
  validity_date: '2025-04-15', // para receitas
});

// Buscar documentos por tipo
const exams = await documentRepo.findByType('user-123', 'exam');

// Buscar documentos expirando
const expiring = await documentRepo.findExpiringSoon('user-123', 30); // próximos 30 dias

// Soft delete (LGPD compliance)
await documentRepo.delete('doc-123', 'user-123');

// Restaurar documento
await documentRepo.restore('doc-123', 'user-123');
```

## Exemplos de Queries SQL Diretas

### Buscar Próximas Consultas

```sql
SELECT 
  a.*,
  d.name AS doctor_name,
  s.name AS specialty_name
FROM appointments a
LEFT JOIN doctors d ON a.doctor_id = d.id
LEFT JOIN specialties s ON a.specialty_id = s.id
WHERE a.user_id = 'user-123'
  AND a.scheduled_at > NOW()
  AND a.status IN ('pending', 'confirmed')
ORDER BY a.scheduled_at ASC
LIMIT 5;
```

### Estatísticas de Saúde

```sql
SELECT 
  metric_type,
  COUNT(*) AS total_records,
  AVG(value) AS avg_value,
  MIN(value) AS min_value,
  MAX(value) AS max_value,
  MAX(recorded_at) AS last_recorded
FROM health_metrics
WHERE user_id = 'user-123'
GROUP BY metric_type;
```

### Lembretes Próximos

```sql
SELECT *
FROM reminders
WHERE user_id = 'user-123'
  AND enabled = true
  AND completed_at IS NULL
  AND date_time BETWEEN NOW() AND NOW() + INTERVAL '1 hour'
ORDER BY date_time ASC;
```

### Documentos Expirando

```sql
SELECT *
FROM documents
WHERE user_id = 'user-123'
  AND deleted_at IS NULL
  AND validity_date IS NOT NULL
  AND validity_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY validity_date ASC;
```

## Exemplos de Integração com Frontend

### React Hook para Appointments

```typescript
import { useState, useEffect } from 'react';
import { AppointmentRepository } from '@/repositories/AppointmentRepository';

export function useAppointments(userId: string) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const repo = new AppointmentRepository();

  useEffect(() => {
    async function load() {
      try {
        const { data } = await repo.findByUser(userId);
        setAppointments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const createAppointment = async (data) => {
    const newAppointment = await repo.create({ ...data, user_id: userId });
    setAppointments([newAppointment, ...appointments]);
    return newAppointment;
  };

  return { appointments, loading, createAppointment };
}
```

### React Hook para Health Metrics

```typescript
import { useState } from 'react';
import { HealthMetricsRepository } from '@/repositories/HealthMetricsRepository';

export function useHealthMetrics(userId: string) {
  const [metrics, setMetrics] = useState([]);
  const repo = new HealthMetricsRepository();

  const addMetric = async (data) => {
    const newMetric = await repo.create({ ...data, user_id: userId });
    setMetrics([newMetric, ...metrics]);
    return newMetric;
  };

  const getHistory = async (type, days = 30) => {
    const history = await repo.findHistory(userId, type, days);
    return history;
  };

  return { metrics, addMetric, getHistory };
}
```

## Exemplos de Validação

### Validação de Pressão Arterial

```typescript
function validateBloodPressure(systolic: number, diastolic: number) {
  if (systolic < 70 || systolic > 250) {
    throw new Error('Pressão sistólica fora do range válido (70-250)');
  }
  if (diastolic < 40 || diastolic > 150) {
    throw new Error('Pressão diastólica fora do range válido (40-150)');
  }
  if (systolic <= diastolic) {
    throw new Error('Pressão sistólica deve ser maior que diastólica');
  }
}
```

### Validação de Agendamento

```typescript
function validateAppointment(scheduledAt: Date) {
  const now = new Date();
  if (scheduledAt < now) {
    throw new Error('Não é possível agendar no passado');
  }
  
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  if (scheduledAt > maxDate) {
    throw new Error('Não é possível agendar com mais de 6 meses de antecedência');
  }
}
```

## Exemplos de Tratamento de Erros

```typescript
try {
  const appointment = await appointmentRepo.create(data);
  return { success: true, data: appointment };
} catch (error) {
  if (error.message.includes('duplicate')) {
    return { success: false, error: 'Consulta já existe' };
  }
  if (error.message.includes('foreign key')) {
    return { success: false, error: 'Médico ou especialidade inválida' };
  }
  return { success: false, error: 'Erro ao criar consulta' };
}
```

---

**Versão**: 1.0.0  
**Data**: 2025-01-16

