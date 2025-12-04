# Guia de Deploy - Health Pass Database

## 1. Pré-requisitos

### 1.1. Ferramentas Necessárias

- **Node.js** 18+ ou **Bun**
- **Supabase CLI**: `npm install -g supabase`
- **Git** para versionamento
- Conta no **Supabase** (https://supabase.com)

### 1.2. Conta Supabase

1. Acesse https://supabase.com
2. Crie uma conta ou faça login
3. Crie um novo projeto
4. Anote as credenciais:
   - Project URL
   - Service Role Key (para backend)
   - Anon Key (para frontend)

## 2. Configuração Inicial

### 2.1. Instalar Supabase CLI

```bash
npm install -g supabase
# ou
brew install supabase/tap/supabase
```

### 2.2. Login no Supabase

```bash
supabase login
```

Siga as instruções para autenticar via navegador.

### 2.3. Link do Projeto

```bash
cd "Back End/supabase"
supabase link --project-ref seu-project-ref
```

O `project-ref` está na URL do seu projeto Supabase:
`https://supabase.com/dashboard/project/[PROJECT-REF]`

## 3. Aplicar Migrações

### 3.1. Verificar Migrações Existentes

```bash
supabase migration list
```

### 3.2. Aplicar Todas as Migrações

```bash
supabase db push
```

Isso aplicará todas as migrações na pasta `migrations/` em ordem cronológica.

### 3.3. Verificar Status

```bash
supabase db diff
```

Se não houver diferenças, todas as migrações foram aplicadas.

### 3.4. Aplicar Manualmente (Alternativa)

Se preferir aplicar manualmente:

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Cole o conteúdo de `20250116000000_complete_database_schema.sql`
5. Clique em **Run**

## 4. Configurar Variáveis de Ambiente

### 4.1. Backend (.env)

Crie arquivo `.env` na pasta `Back End/`:

```env
# Supabase
SUPABASE_URL=https://seu-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
SUPABASE_ANON_KEY=sua-anon-key

# Ambiente
NODE_ENV=production
PORT=3000
```

### 4.2. Frontend (.env)

Crie arquivo `.env` na pasta `Front End/` ou `Sistema/`:

```env
VITE_SUPABASE_URL=https://seu-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-anon-key
```

**⚠️ IMPORTANTE**: Nunca commite arquivos `.env` com chaves reais!

## 5. Configurar Storage (Documentos)

### 5.1. Criar Bucket

1. Acesse Supabase Dashboard
2. Vá em **Storage**
3. Clique em **New bucket**
4. Nome: `documents`
5. Público: **Não** (privado)
6. Clique em **Create bucket**

### 5.2. Configurar Políticas RLS do Storage

No SQL Editor, execute:

```sql
-- Política para usuários verem seus próprios arquivos
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para usuários fazerem upload
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para usuários deletarem seus arquivos
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 6. Testar Conexão

### 6.1. Teste Básico

Crie arquivo `test-connection.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testConnection() {
  // Testar consulta simples
  const { data, error } = await supabase
    .from('specialties')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Erro de conexão:', error);
  } else {
    console.log('✅ Conexão bem-sucedida!');
    console.log('Especialidades encontradas:', data?.length || 0);
  }
}

testConnection();
```

Execute:
```bash
cd Back End
npx tsx test-connection.ts
```

### 6.2. Verificar Tabelas Criadas

No Supabase Dashboard:
1. Vá em **Table Editor**
2. Verifique se todas as tabelas estão presentes:
   - specialties
   - doctors
   - appointments
   - health_metrics
   - health_goals
   - reminders
   - documents
   - vaccines
   - audit_log

## 7. Configurar Backups

### 7.1. Backups Automáticos (Supabase)

Os backups automáticos já estão habilitados por padrão no Supabase:
- **Frequência**: Diária
- **Retenção**: 7 dias (configurável)
- **Point-in-time recovery**: Disponível

### 7.2. Backup Manual

```bash
# Via CLI
supabase db dump -f backup-$(date +%Y%m%d).sql

# Ou via Dashboard
# Settings > Database > Backups > Download
```

### 7.3. Restaurar Backup

```bash
# Via CLI
supabase db reset
psql -h db.seu-project.supabase.co -U postgres -d postgres -f backup-20250116.sql

# Ou via Dashboard
# Settings > Database > Backups > Restore
```

## 8. Monitoramento

### 8.1. Dashboard Supabase

Acesse métricas em tempo real:
- **Database**: Queries, conexões, tamanho
- **API**: Requisições, latência
- **Storage**: Uso de espaço
- **Logs**: Erros e eventos

### 8.2. Logs via CLI

```bash
# Logs em tempo real
supabase logs

# Logs de função específica
supabase functions logs analyze-health
```

### 8.3. Query Performance

No SQL Editor, execute:

```sql
-- Ver queries lentas
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## 9. Segurança

### 9.1. Verificar RLS

Teste se RLS está funcionando:

```sql
-- Como usuário normal (não admin)
-- Não deve ver dados de outros usuários
SELECT * FROM appointments;
-- Deve retornar apenas do usuário autenticado
```

### 9.2. Rotacionar Chaves

1. Dashboard > Settings > API
2. Gere novas chaves
3. Atualize variáveis de ambiente
4. Revogue chaves antigas

### 9.3. Configurar CORS

Se necessário, configure CORS no Supabase Dashboard:
- Settings > API > CORS
- Adicione domínios permitidos

## 10. Deploy em Produção

### 10.1. Checklist Pré-Deploy

- [ ] Todas as migrações aplicadas
- [ ] Variáveis de ambiente configuradas
- [ ] Storage configurado
- [ ] RLS testado
- [ ] Backups configurados
- [ ] Testes passando
- [ ] Documentação atualizada

### 10.2. Deploy Frontend

```bash
cd Sistema
npm run build
# Deploy para Vercel, Netlify, etc.
```

### 10.3. Deploy Backend (se houver)

```bash
cd Back End
# Deploy para Vercel, Railway, etc.
```

### 10.4. Verificar Pós-Deploy

1. Testar autenticação
2. Testar criação de dados
3. Verificar logs
4. Monitorar performance

## 11. Troubleshooting

### 11.1. Erro: "relation does not exist"

**Causa**: Migração não aplicada

**Solução**:
```bash
supabase db push
```

### 11.2. Erro: "permission denied"

**Causa**: RLS bloqueando acesso

**Solução**: Verificar políticas RLS e autenticação

### 11.3. Erro: "connection timeout"

**Causa**: Pool de conexões esgotado

**Solução**: Aumentar pool ou otimizar queries

### 11.4. Performance Lenta

**Solução**:
1. Verificar índices
2. Analisar queries lentas
3. Otimizar queries
4. Considerar cache

## 12. Manutenção

### 12.1. Atualizar Schema

1. Criar nova migração:
```bash
supabase migration new nome_da_migracao
```

2. Editar arquivo gerado
3. Aplicar:
```bash
supabase db push
```

### 12.2. Limpar Dados Antigos

```sql
-- Exemplo: Limpar logs de auditoria antigos
DELETE FROM audit_log
WHERE created_at < NOW() - INTERVAL '90 days';
```

### 12.3. Otimizar Banco

```sql
-- Vacuum e analisar
VACUUM ANALYZE;

-- Reindexar
REINDEX DATABASE postgres;
```

## 13. Recursos Adicionais

- **Documentação Supabase**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Supabase Discord**: https://discord.supabase.com

---

**Versão**: 1.0.0  
**Última atualização**: 2025-01-16

