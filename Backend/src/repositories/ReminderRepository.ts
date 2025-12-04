/**
 * Repository Pattern para Reminders
 * Camada de acesso a dados para lembretes
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface CreateReminderDTO {
  user_id: string;
  title: string;
  description?: string;
  type: 'medication' | 'appointment' | 'exam' | 'vaccine' | 'other';
  date_time: string;
  repeat_frequency?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  enabled?: boolean;
}

export interface UpdateReminderDTO {
  title?: string;
  description?: string;
  type?: 'medication' | 'appointment' | 'exam' | 'vaccine' | 'other';
  date_time?: string;
  repeat_frequency?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  enabled?: boolean;
  completed_at?: string | null;
}

export class ReminderRepository {
  /**
   * Cria um novo lembrete
   */
  async create(data: CreateReminderDTO) {
    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        ...data,
        repeat_frequency: data.repeat_frequency || 'none',
        enabled: data.enabled !== undefined ? data.enabled : true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar lembrete: ${error.message}`);
    }

    return reminder;
  }

  /**
   * Busca lembretes de um usuário
   */
  async findByUser(
    userId: string,
    options: {
      enabled?: boolean;
      type?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const {
      enabled,
      type,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = options;

    let query = supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('date_time', { ascending: true })
      .range(offset, offset + limit - 1);

    if (enabled !== undefined) {
      query = query.eq('enabled', enabled);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (startDate) {
      query = query.gte('date_time', startDate);
    }

    if (endDate) {
      query = query.lte('date_time', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar lembretes: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca lembretes ativos (próximos)
   */
  async findActive(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('active_reminders')
      .select('*')
      .eq('user_id', userId)
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar lembretes ativos: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca um lembrete por ID
   */
  async findById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar lembrete: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualiza um lembrete
   */
  async update(id: string, userId: string, data: UpdateReminderDTO) {
    const { data: reminder, error } = await supabase
      .from('reminders')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar lembrete: ${error.message}`);
    }

    return reminder;
  }

  /**
   * Marca um lembrete como completo
   * Isso automaticamente adiciona pontos via trigger
   */
  async complete(id: string, userId: string) {
    return this.update(id, userId, {
      completed_at: new Date().toISOString(),
    });
  }

  /**
   * Ativa/desativa um lembrete
   */
  async toggle(id: string, userId: string, enabled: boolean) {
    return this.update(id, userId, { enabled });
  }

  /**
   * Deleta um lembrete
   */
  async delete(id: string, userId: string) {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao deletar lembrete: ${error.message}`);
    }

    return true;
  }

  /**
   * Busca lembretes que precisam ser executados (para notificações)
   */
  async findDueReminders(minutesBefore: number = 5) {
    const now = new Date();
    const targetTime = new Date(now.getTime() + minutesBefore * 60 * 1000);

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('enabled', true)
      .is('completed_at', null)
      .gte('date_time', now.toISOString())
      .lte('date_time', targetTime.toISOString());

    if (error) {
      throw new Error(`Erro ao buscar lembretes pendentes: ${error.message}`);
    }

    return data;
  }
}

