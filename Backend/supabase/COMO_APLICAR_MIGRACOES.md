# 🚀 Como Aplicar as Migrações do Banco de Dados

## ⚠️ IMPORTANTE: Ordem de Aplicação

As migrações devem ser aplicadas **na ordem cronológica** para evitar erros de dependências.

## 📋 Método Recomendado: Supabase Dashboard

### Passo 1: Acessar o Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: **uqewzbzpksomioyihrpw** (ou seu projeto)

### Passo 2: Abrir SQL Editor

1. No menu lateral, clique em **SQL Editor**
2. Clique no botão **New Query** (ou use `Ctrl+N`)

### Passo 3: Aplicar Migrações em Ordem

#### ✅ Migração 1: Sistema de Gamificação
**Arquivo**: `migrations/20251114012507_0b2c7e98-3bfa-4357-863b-7678164a7ed9.sql`

1. Abra o arquivo no editor de código
2. Copie TODO o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou `Ctrl+Enter`)
5. Verifique se apareceu "Success. No rows returned"

#### ✅ Migração 2: Correção de Função
**Arquivo**: `migrations/20251114012615_44c1db01-9166-432d-beb7-8e7b825ff155.sql`

1. Abra o arquivo
2. Copie e cole no SQL Editor
3. Execute

#### ✅ Migração 3: Perfis de Usuário
**Arquivo**: `migrations/20251115165847_24056fac-fb2b-43b8-a3b8-73359727fe4a.sql`

1. Abra o arquivo
2. Copie e cole no SQL Editor
3. Execute

#### ✅ Migração 4: Sistema de Roles
**Arquivo**: `migrations/20251115170505_bfde512c-b0f9-42af-b320-92bbc700c7c9.sql`

1. Abra o arquivo
2. Copie e cole no SQL Editor
3. Execute

#### ✅ Migração 5: Schema Completo (IMPORTANTE!)
**Arquivo**: `migrations/20250116000000_complete_database_schema.sql`

⚠️ **Esta é a migração principal** - Cria todas as tabelas, índices, triggers e views.

1. Abra o arquivo `20250116000000_complete_database_schema.sql`
2. Copie TODO o conteúdo (é um arquivo grande)
3. Cole no SQL Editor
4. Execute
5. Aguarde alguns segundos (pode demorar)

### Passo 4: Verificar se Tudo Foi Criado

Execute esta query no SQL Editor:

```sql
-- Verificar todas as tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Tabelas esperadas:**
- achievements
- appointments
- audit_log
- documents
- doctors
- health_goals
- health_metrics
- point_transactions
- profiles
- reminders
- specialties
- user_achievements
- user_points
- user_roles
- vaccines

### Passo 5: Verificar Dados Iniciais

```sql
-- Verificar especialidades (seed data)
SELECT * FROM specialties;

-- Deve retornar 11 especialidades
```

## 🔧 Método Alternativo: Via Supabase CLI

Se conseguir instalar o Supabase CLI:

```powershell
# 1. Instalar (requer permissões de administrador)
npm install -g supabase

# 2. Login
supabase login

# 3. Link do projeto
cd Backend/supabase
supabase link --project-ref uqewzbzpksomioyihrpw

# 4. Aplicar todas as migrações
supabase db push
```

## ✅ Checklist Pós-Migração

- [ ] Todas as tabelas foram criadas (15 tabelas)
- [ ] Especialidades foram inseridas (11 registros)
- [ ] RLS está habilitado em todas as tabelas
- [ ] Triggers foram criados
- [ ] Views foram criadas
- [ ] Funções foram criadas

## 🐛 Troubleshooting

### Erro: "relation already exists"
**Causa**: Algumas migrações já foram aplicadas anteriormente.

**Solução**: 
- Verifique quais tabelas já existem
- Aplique apenas as migrações faltantes
- Ou use `CREATE TABLE IF NOT EXISTS` (já está no script)

### Erro: "type already exists"
**Causa**: Os ENUMs já foram criados.

**Solução**: 
- O script usa `DO $$ BEGIN ... EXCEPTION ... END $$` para evitar esse erro
- Pode ignorar se aparecer "duplicate_object"

### Erro: "permission denied"
**Causa**: Não tem permissões suficientes.

**Solução**: 
- Use o Service Role Key no dashboard
- Ou verifique se está logado como admin do projeto

### Erro: "foreign key constraint"
**Causa**: Tentando criar tabela que depende de outra que não existe.

**Solução**: 
- Aplique as migrações na ordem correta
- Verifique se `profiles` foi criada antes de `appointments`

## 📊 Verificação Final

Execute estas queries para confirmar:

```sql
-- Contar tabelas
SELECT COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar especialidades
SELECT COUNT(*) as total_specialties FROM specialties;

-- Verificar funções
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

## 🎯 Próximos Passos

Após aplicar as migrações:

1. ✅ Configurar variáveis de ambiente no Frontend
2. ✅ Testar conexão com o banco
3. ✅ Criar primeiro usuário de teste
4. ✅ Verificar se RLS está funcionando

---

**Dúvidas?** Consulte `Backend/DEPLOYMENT_GUIDE.md` para mais detalhes.

