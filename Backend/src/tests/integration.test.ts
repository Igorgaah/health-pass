/**
 * Testes de Integração - API ↔ Banco de Dados
 * Execute com: npm test:integration
 * 
 * Requer:
 * - Banco de dados de teste configurado
 * - Variáveis de ambiente de teste
 */

import { createClient } from '@supabase/supabase-js';

// Configuração de teste
const TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL || '';
const TEST_SUPABASE_KEY = process.env.TEST_SUPABASE_KEY || '';

const supabase = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_KEY);

describe('Integração API ↔ Banco de Dados', () => {
  let testUserId: string;
  let testAppointmentId: string;
  let testMetricId: string;
  let testReminderId: string;

  beforeAll(async () => {
    // Criar usuário de teste ou usar existente
    // testUserId = 'test-user-id';
  });

  afterAll(async () => {
    // Limpar dados de teste
    if (testAppointmentId) {
      await supabase.from('appointments').delete().eq('id', testAppointmentId);
    }
    if (testMetricId) {
      await supabase.from('health_metrics').delete().eq('id', testMetricId);
    }
    if (testReminderId) {
      await supabase.from('reminders').delete().eq('id', testReminderId);
    }
  });

  describe('Appointments', () => {
    it('deve criar e buscar consulta', async () => {
      // Criar
      const { data: appointment, error: createError } = await supabase
        .from('appointments')
        .insert({
          user_id: testUserId,
          scheduled_at: new Date().toISOString(),
          status: 'pending',
        })
        .select()
        .single();

      expect(createError).toBeNull();
      expect(appointment).toBeDefined();
      testAppointmentId = appointment.id;

      // Buscar
      const { data: found, error: findError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', testAppointmentId)
        .single();

      expect(findError).toBeNull();
      expect(found).toBeDefined();
      expect(found.id).toBe(testAppointmentId);
    });

    it('deve atualizar status da consulta', async () => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', testAppointmentId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe('confirmed');
    });

    it('deve verificar RLS - usuário só vê suas consultas', async () => {
      // Testar que usuário A não vê consultas de usuário B
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', 'other-user-id');

      // Com RLS, não deve retornar dados de outro usuário
      expect(data).toEqual([]);
    });
  });

  describe('Health Metrics', () => {
    it('deve criar métrica de pressão arterial', async () => {
      const { data, error } = await supabase
        .from('health_metrics')
        .insert({
          user_id: testUserId,
          metric_type: 'blood_pressure',
          systolic: 120,
          diastolic: 80,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.systolic).toBe(120);
      expect(data.diastolic).toBe(80);
      testMetricId = data.id;
    });

    it('deve buscar histórico de métricas', async () => {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', testUserId)
        .eq('metric_type', 'blood_pressure')
        .order('recorded_at', { ascending: false });

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Reminders', () => {
    it('deve criar lembrete e completar (adiciona pontos)', async () => {
      // Criar
      const { data: reminder, error: createError } = await supabase
        .from('reminders')
        .insert({
          user_id: testUserId,
          title: 'Teste',
          type: 'medication',
          date_time: new Date().toISOString(),
        })
        .select()
        .single();

      expect(createError).toBeNull();
      testReminderId = reminder.id;

      // Completar (deve adicionar pontos via trigger)
      const { data: updated, error: updateError } = await supabase
        .from('reminders')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', testReminderId)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updated.completed_at).toBeDefined();

      // Verificar se pontos foram adicionados
      const { data: points } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', testUserId)
        .eq('category', 'reminders')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      expect(points).toBeDefined();
      expect(points.points).toBe(10); // 10 pontos para medication
    });
  });

  describe('Audit Log', () => {
    it('deve registrar operações no audit_log', async () => {
      // Criar uma operação que dispara trigger
      await supabase
        .from('appointments')
        .insert({
          user_id: testUserId,
          scheduled_at: new Date().toISOString(),
        });

      // Verificar se foi registrado no audit_log
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', 'appointments')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.action).toBe('INSERT');
    });
  });

  describe('Performance', () => {
    it('deve usar índices para queries rápidas', async () => {
      const start = Date.now();

      await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', testUserId)
        .order('scheduled_at', { ascending: false })
        .limit(10);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Deve ser rápido com índices
    });
  });
});

