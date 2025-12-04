/**
 * Repository Pattern para Appointments
 * Camada de acesso a dados para consultas médicas
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface CreateAppointmentDTO {
  user_id: string;
  doctor_id?: string;
  specialty_id?: string;
  scheduled_at: string;
  duration_minutes?: number;
  location?: string;
  notes?: string;
  preparation?: string;
}

export interface UpdateAppointmentDTO {
  doctor_id?: string;
  specialty_id?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  location?: string;
  notes?: string;
  preparation?: string;
  cancelled_reason?: string;
}

export class AppointmentRepository {
  /**
   * Cria uma nova consulta
   */
  async create(data: CreateAppointmentDTO) {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        ...data,
        duration_minutes: data.duration_minutes || 30,
      })
      .select(`
        *,
        doctors (*),
        specialties (*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar consulta: ${error.message}`);
    }

    return appointment;
  }

  /**
   * Busca consultas de um usuário com paginação
   */
  async findByUser(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    const {
      limit = 10,
      offset = 0,
      status,
      startDate,
      endDate,
    } = options;

    let query = supabase
      .from('appointments')
      .select(`
        *,
        doctors (*),
        specialties (*)
      `)
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('scheduled_at', startDate);
    }

    if (endDate) {
      query = query.lte('scheduled_at', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao buscar consultas: ${error.message}`);
    }

    return { data, count };
  }

  /**
   * Busca próximas consultas de um usuário
   */
  async findUpcoming(userId: string, limit: number = 5) {
    const { data, error } = await supabase
      .from('upcoming_appointments')
      .select('*')
      .eq('user_id', userId)
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar próximas consultas: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca uma consulta por ID
   */
  async findById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctors (*),
        specialties (*)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar consulta: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualiza uma consulta
   */
  async update(id: string, userId: string, data: UpdateAppointmentDTO) {
    const updateData: any = { ...data };

    // Se cancelar, adiciona timestamp
    if (data.status === 'cancelled' && !updateData.cancelled_at) {
      updateData.cancelled_at = new Date().toISOString();
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        doctors (*),
        specialties (*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar consulta: ${error.message}`);
    }

    return appointment;
  }

  /**
   * Cancela uma consulta
   */
  async cancel(id: string, userId: string, reason: string) {
    return this.update(id, userId, {
      status: 'cancelled',
      cancelled_reason: reason,
    });
  }

  /**
   * Deleta uma consulta (hard delete)
   */
  async delete(id: string, userId: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao deletar consulta: ${error.message}`);
    }

    return true;
  }

  /**
   * Conta total de consultas por status
   */
  async countByStatus(userId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('status')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao contar consultas: ${error.message}`);
    }

    const counts = data.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return counts;
  }
}

