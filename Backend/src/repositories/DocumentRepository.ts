/**
 * Repository Pattern para Documents
 * Camada de acesso a dados para documentos médicos
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface CreateDocumentDTO {
  user_id: string;
  name: string;
  type: 'exam' | 'prescription' | 'vaccine' | 'report' | 'other';
  file_url: string;
  file_size?: number;
  mime_type?: string;
  doctor_name?: string;
  doctor_crm?: string;
  date: string;
  validity_date?: string;
  notes?: string;
}

export interface UpdateDocumentDTO {
  name?: string;
  type?: 'exam' | 'prescription' | 'vaccine' | 'report' | 'other';
  doctor_name?: string;
  doctor_crm?: string;
  date?: string;
  validity_date?: string;
  notes?: string;
}

export class DocumentRepository {
  /**
   * Cria um novo documento
   */
  async create(data: CreateDocumentDTO) {
    const { data: document, error } = await supabase
      .from('documents')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar documento: ${error.message}`);
    }

    return document;
  }

  /**
   * Busca documentos de um usuário (apenas não deletados)
   */
  async findByUser(
    userId: string,
    options: {
      type?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const {
      type,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = options;

    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar documentos: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca um documento por ID
   */
  async findById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar documento: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualiza um documento
   */
  async update(id: string, userId: string, data: UpdateDocumentDTO) {
    const { data: document, error } = await supabase
      .from('documents')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar documento: ${error.message}`);
    }

    return document;
  }

  /**
   * Soft delete de um documento (LGPD compliance)
   */
  async delete(id: string, userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao deletar documento: ${error.message}`);
    }

    return data;
  }

  /**
   * Restaura um documento deletado
   */
  async restore(id: string, userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .update({ deleted_at: null })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao restaurar documento: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca documentos por tipo
   */
  async findByType(userId: string, type: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .is('deleted_at', null)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar documentos por tipo: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca documentos com validade próxima do vencimento
   */
  async findExpiringSoon(userId: string, days: number = 30) {
    const today = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(today.getDate() + days);

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .not('validity_date', 'is', null)
      .gte('validity_date', today.toISOString().split('T')[0])
      .lte('validity_date', expirationDate.toISOString().split('T')[0])
      .order('validity_date', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar documentos expirando: ${error.message}`);
    }

    return data;
  }
}

