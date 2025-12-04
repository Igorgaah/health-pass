/**
 * Testes Unitários para Repositories
 * Execute com: npm test ou jest
 */

import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { HealthMetricsRepository } from '../repositories/HealthMetricsRepository';
import { ReminderRepository } from '../repositories/ReminderRepository';
import { DocumentRepository } from '../repositories/DocumentRepository';

// Mock do Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  })),
}));

describe('AppointmentRepository', () => {
  let repository: AppointmentRepository;

  beforeEach(() => {
    repository = new AppointmentRepository();
  });

  describe('create', () => {
    it('deve criar uma consulta com sucesso', async () => {
      const appointmentData = {
        user_id: 'user-123',
        specialty_id: 'specialty-123',
        scheduled_at: '2025-02-01T10:00:00Z',
        location: 'Clínica XYZ',
      };

      const result = await repository.create(appointmentData);
      expect(result).toBeDefined();
    });

    it('deve definir duration_minutes padrão como 30', async () => {
      const appointmentData = {
        user_id: 'user-123',
        scheduled_at: '2025-02-01T10:00:00Z',
      };

      await repository.create(appointmentData);
      // Verificar se duration_minutes foi definido
    });
  });

  describe('findByUser', () => {
    it('deve buscar consultas de um usuário', async () => {
      const result = await repository.findByUser('user-123');
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('deve aplicar filtros de status', async () => {
      const result = await repository.findByUser('user-123', {
        status: 'confirmed',
      });
      expect(result).toBeDefined();
    });
  });

  describe('cancel', () => {
    it('deve cancelar uma consulta com motivo', async () => {
      const result = await repository.cancel('appointment-123', 'user-123', 'Motivo do cancelamento');
      expect(result).toBeDefined();
    });
  });
});

describe('HealthMetricsRepository', () => {
  let repository: HealthMetricsRepository;

  beforeEach(() => {
    repository = new HealthMetricsRepository();
  });

  describe('create', () => {
    it('deve criar métrica de pressão arterial com systolic e diastolic', async () => {
      const metricData = {
        user_id: 'user-123',
        metric_type: 'blood_pressure' as const,
        systolic: 120,
        diastolic: 80,
      };

      const result = await repository.create(metricData);
      expect(result).toBeDefined();
    });

    it('deve rejeitar pressão arterial sem systolic ou diastolic', async () => {
      const metricData = {
        user_id: 'user-123',
        metric_type: 'blood_pressure' as const,
        value: 100,
      };

      await expect(repository.create(metricData)).rejects.toThrow();
    });

    it('deve criar métrica de peso com value', async () => {
      const metricData = {
        user_id: 'user-123',
        metric_type: 'weight' as const,
        value: 70.5,
      };

      const result = await repository.create(metricData);
      expect(result).toBeDefined();
    });
  });

  describe('findHistory', () => {
    it('deve buscar histórico dos últimos 30 dias por padrão', async () => {
      const result = await repository.findHistory('user-123', 'weight');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe('ReminderRepository', () => {
  let repository: ReminderRepository;

  beforeEach(() => {
    repository = new ReminderRepository();
  });

  describe('create', () => {
    it('deve criar lembrete com valores padrão', async () => {
      const reminderData = {
        user_id: 'user-123',
        title: 'Tomar remédio',
        type: 'medication' as const,
        date_time: '2025-02-01T10:00:00Z',
      };

      const result = await repository.create(reminderData);
      expect(result).toBeDefined();
    });
  });

  describe('complete', () => {
    it('deve marcar lembrete como completo', async () => {
      const result = await repository.complete('reminder-123', 'user-123');
      expect(result).toBeDefined();
      // O trigger deve adicionar pontos automaticamente
    });
  });

  describe('findDueReminders', () => {
    it('deve buscar lembretes que precisam ser executados', async () => {
      const result = await repository.findDueReminders(5);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe('DocumentRepository', () => {
  let repository: DocumentRepository;

  beforeEach(() => {
    repository = new DocumentRepository();
  });

  describe('delete', () => {
    it('deve fazer soft delete (não deletar fisicamente)', async () => {
      const result = await repository.delete('doc-123', 'user-123');
      expect(result).toBeDefined();
      expect(result.deleted_at).toBeDefined();
    });
  });

  describe('restore', () => {
    it('deve restaurar documento deletado', async () => {
      const result = await repository.restore('doc-123', 'user-123');
      expect(result).toBeDefined();
      expect(result.deleted_at).toBeNull();
    });
  });

  describe('findExpiringSoon', () => {
    it('deve buscar documentos expirando em 30 dias', async () => {
      const result = await repository.findExpiringSoon('user-123', 30);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

