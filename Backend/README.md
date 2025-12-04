# Health Pass - Backend Database

Projeto completo de banco de dados para o sistema Health Pass, desenvolvido com PostgreSQL via Supabase.

## 📋 Estrutura do Projeto

```
Back End/
├── DATABASE_DESIGN.md          # Documentação técnica completa
├── ER_MODEL.md                 # Modelo Entidade-Relacionamento
├── DEPLOYMENT_GUIDE.md         # Guia de deploy passo a passo
├── README.md                   # Este arquivo
├── supabase/
│   ├── migrations/
│   │   └── 20250116000000_complete_database_schema.sql
│   ├── functions/
│   │   └── analyze-health/
│   └── config.toml
└── src/
    ├── repositories/           # Camada de acesso a dados
    │   ├── AppointmentRepository.ts
    │   ├── HealthMetricsRepository.ts
    │   ├── ReminderRepository.ts
    │   └── DocumentRepository.ts
    └── tests/                  # Testes
        ├── repositories.test.ts
        └── integration.test.ts
```

## 🚀 Início Rápido

### 1. Aplicar Migrações

```bash
cd supabase
supabase db push
```

### 2. Configurar Variáveis de Ambiente

Crie `.env`:
```env
SUPABASE_URL=https://seu-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave
```

### 3. Testar Conexão

```bash
npm test
```

## 📚 Documentação

- **[DATABASE_DESIGN.md](./DATABASE_DESIGN.md)**: Design completo do banco
- **[ER_MODEL.md](./ER_MODEL.md)**: Modelo ER e relacionamentos
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**: Guia de deploy

## 🗄️ Estrutura do Banco

### Tabelas Principais

- **profiles**: Perfis de usuário
- **appointments**: Consultas médicas
- **health_metrics**: Sinais vitais
- **health_goals**: Metas de saúde
- **reminders**: Lembretes
- **documents**: Documentos médicos
- **vaccines**: Vacinas
- **specialties**: Especialidades
- **doctors**: Médicos
- **audit_log**: Log de auditoria

### Tabelas de Gamificação

- **user_points**: Pontos do usuário
- **achievements**: Conquistas
- **user_achievements**: Conquistas desbloqueadas
- **point_transactions**: Histórico de pontos

## 🔒 Segurança

- **Row Level Security (RLS)**: Habilitado em todas as tabelas
- **Políticas de acesso**: Usuários só acessam seus próprios dados
- **Auditoria**: Todas as operações críticas são logadas
- **Soft Delete**: Documentos usam deleted_at para LGPD

## 📊 Performance

- **Índices otimizados**: Para todas as queries frequentes
- **Views materializadas**: Para relatórios complexos
- **Paginação**: Cursor-based e OFFSET/LIMIT
- **Connection pooling**: Gerenciado pelo Supabase

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes de integração
npm test:integration
```

## 📦 Repositories

Padrão Repository para acesso a dados:

```typescript
import { AppointmentRepository } from './repositories/AppointmentRepository';

const repo = new AppointmentRepository();

// Criar consulta
const appointment = await repo.create({
  user_id: 'user-123',
  scheduled_at: '2025-02-01T10:00:00Z',
  specialty_id: 'specialty-123',
});

// Buscar consultas
const appointments = await repo.findByUser('user-123', {
  status: 'confirmed',
  limit: 10,
});
```

## 🔄 Migrações

Todas as mudanças no schema via migrações:

```bash
# Criar nova migração
supabase migration new nome_da_migracao

# Aplicar migrações
supabase db push

# Ver status
supabase migration list
```

## 📈 Monitoramento

- **Dashboard Supabase**: Métricas em tempo real
- **Logs**: `supabase logs`
- **Query Performance**: Via pg_stat_statements

## 🛠️ Tecnologias

- **PostgreSQL 15+**: Banco de dados
- **Supabase**: Plataforma BaaS
- **TypeScript**: Tipagem estática
- **Jest**: Testes

## 📝 Licença

MIT

---

**Versão**: 1.0.0  
**Última atualização**: 2025-01-16

