/**
 * Repository Pattern para Health Metrics
 * Camada de acesso a dados para sinais vitais
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface CreateHealthMetricDTO {
  user_id: string;
  metric_type: 'blood_pressure' | 'weight' | 'glucose' | 'heart_rate' | 'temperature' | 'oxygen_saturation';
  value?: number;
  systolic?: number;
  diastolic?: number;
  unit?: string;
  notes?: string;
  recorded_at?: string;
}

export interface HealthMetricFilter {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export class HealthMetricsRepository {
  /**
   * Cria um novo registro de métrica
   */
  async create(data: CreateHealthMetricDTO) {
    // Validação: pressão arterial requer systolic e diastolic
    if (data.metric_type === 'blood_pressure') {
      if (!data.systolic || !data.diastolic) {
        throw new Error('Pressão arterial requer valores de sistólica e diastólica');
      }
    } else {
      if (!data.value) {
        throw new Error('Métrica requer um valor');
      }
    }

    const { data: metric, error } = await supabase
      .from('health_metrics')
      .insert({
        ...data,
        recorded_at: data.recorded_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar métrica: ${error.message}`);
    }

    return metric;
  }

  /**
   * Busca métricas de um usuário por tipo
   */
  async findByType(
    userId: string,
    metricType: string,
    filter: HealthMetricFilter = {}
  ) {
    const {
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = filter;

    let query = supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_type', metricType)
      .order('recorded_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (startDate) {
      query = query.gte('recorded_at', startDate);
    }

    if (endDate) {
      query = query.lte('recorded_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar métricas: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca o último registro de um tipo de métrica
   */
  async findLatest(userId: string, metricType: string) {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_type', metricType)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw new Error(`Erro ao buscar última métrica: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca histórico de métricas (últimos N dias)
   */
  async findHistory(userId: string, metricType: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_type', metricType)
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar histórico: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca estatísticas de métricas
   */
  async getStats(userId: string, metricType: string) {
    const { data, error } = await supabase
      .from('user_health_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_type', metricType)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualiza uma métrica
   */
  async update(id: string, userId: string, data: Partial<CreateHealthMetricDTO>) {
    const { data: metric, error } = await supabase
      .from('health_metrics')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar métrica: ${error.message}`);
    }

    return metric;
  }

  /**
   * Deleta uma métrica
   */
  async delete(id: string, userId: string) {
    const { error } = await supabase
      .from('health_metrics')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao deletar métrica: ${error.message}`);
    }

    return true;
  }

  /**
   * Busca todas as métricas de um usuário
   */
  async findAll(userId: string, filter: HealthMetricFilter = {}) {
    const {
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = filter;

    let query = supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (startDate) {
      query = query.gte('recorded_at', startDate);
    }

    if (endDate) {
      query = query.lte('recorded_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar métricas: ${error.message}`);
    }

    return data;
  }
}

