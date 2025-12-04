# Como Aplicar as Migrações do Banco de Dados

## Opção 1: Via Supabase Dashboard (Recomendado)

### Passo a Passo:

1. **Acesse o Supabase Dashboard**
   - Vá para https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New Query**

3. **Aplique as migrações em ordem**

   **Migração 1**: Cole o conteúdo de `migrations/20251114012507_0b2c7e98-3bfa-4357-863b-7678164a7ed9.sql`
   - Clique em **Run** (ou Ctrl+Enter)

   **Migração 2**: Cole o conteúdo de `migrations/20251114012615_44c1db01-9166-432d-beb7-8e7b825ff155.sql`
   - Clique em **Run**

   **Migração 3**: Cole o conteúdo de `migrations/20251115165847_24056fac-fb2b-43b8-a3b8-73359727fe4a.sql`
   - Clique em **Run**

   **Migração 4**: Cole o conteúdo de `migrations/20251115170505_bfde512c-b0f9-42af-b320-92bbc700c7c9.sql`
   - Clique em **Run**

   **Migração 5**: Cole o conteúdo de `migrations/20250116000000_complete_database_schema.sql`
   - Clique em **Run**

4. **Verificar se tudo foi criado**
   - Vá em **Table Editor** no menu lateral
   - Verifique se todas as tabelas estão presentes

## Opção 2: Via Supabase CLI

### Instalar Supabase CLI:

```powershell
# No PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Depois instale
npm install -g supabase
```

### Aplicar Migrações:

```bash
cd Backend/supabase
supabase login
supabase link --project-ref uqewzbzpksomioyihrpw
supabase db push
```

## Opção 3: Script SQL Consolidado

Se preferir aplicar tudo de uma vez, use o arquivo:
`Backend/supabase/migrations/20250116000000_complete_database_schema.sql`

**⚠️ ATENÇÃO**: Este script já inclui todas as tabelas. Se você já aplicou as migrações anteriores, pode haver conflitos. Nesse caso, use a Opção 1.

## Verificação Pós-Migração

Execute no SQL Editor para verificar:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar especialidades (seed data)
SELECT * FROM specialties;
```

## Troubleshooting

### Erro: "relation already exists"
- Algumas migrações já foram aplicadas
- Aplique apenas as migrações faltantes

### Erro: "permission denied"
- Verifique se está usando a Service Role Key ou Anon Key correta
- No dashboard, você tem permissões completas

### Erro: "type already exists"
- Os ENUMs já foram criados
- O script usa `DO $$ BEGIN ... EXCEPTION ... END $$` para evitar esse erro

---

**Recomendação**: Use a **Opção 1** (Dashboard) para maior controle e visualização dos erros.

