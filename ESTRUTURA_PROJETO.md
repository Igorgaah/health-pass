# Estrutura do Projeto Health Pass

## 📁 Organização Final

```
health-pass/
│
├── Backend/                          # 🗄️ Backend e Banco de Dados
│   ├── supabase/                     # Configuração Supabase
│   │   ├── migrations/               # Migrações do banco de dados
│   │   │   ├── 20250116000000_complete_database_schema.sql
│   │   │   └── ...
│   │   ├── functions/                # Edge Functions
│   │   │   └── analyze-health/
│   │   └── config.toml               # Configuração do Supabase
│   │
│   ├── src/                          # Código do backend
│   │   ├── repositories/             # Camada de acesso a dados
│   │   │   ├── AppointmentRepository.ts
│   │   │   ├── HealthMetricsRepository.ts
│   │   │   ├── ReminderRepository.ts
│   │   │   └── DocumentRepository.ts
│   │   └── tests/                    # Testes
│   │       ├── repositories.test.ts
│   │       └── integration.test.ts
│   │
│   └── *.md                          # Documentação
│       ├── DATABASE_DESIGN.md        # Design completo do BD
│       ├── ER_MODEL.md               # Modelo ER
│       ├── DEPLOYMENT_GUIDE.md       # Guia de deploy
│       ├── EXAMPLES.md               # Exemplos de uso
│       ├── PROJECT_SUMMARY.md        # Resumo do projeto
│       └── README.md                 # README do backend
│
├── Frontend/                         # 🎨 Frontend React
│   ├── src/                          # Código fonte
│   │   ├── components/               # Componentes React
│   │   │   ├── ui/                   # Componentes UI (shadcn/ui)
│   │   │   ├── AchievementBadge.tsx
│   │   │   ├── AdminRoute.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   └── ...
│   │   ├── pages/                    # Páginas da aplicação
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Appointments.tsx
│   │   │   ├── HealthMetrics.tsx
│   │   │   └── ...
│   │   ├── hooks/                    # Custom hooks
│   │   │   ├── useAuth.tsx
│   │   │   ├── useGamification.tsx
│   │   │   └── ...
│   │   ├── integrations/             # Integrações
│   │   │   └── supabase/
│   │   │       ├── client.ts
│   │   │       └── types.ts
│   │   ├── lib/                      # Utilitários
│   │   └── utils/                    # Funções auxiliares
│   │
│   ├── public/                       # Arquivos estáticos
│   │   ├── favicon.ico
│   │   ├── Health Pass.jpg
│   │   └── ...
│   │
│   ├── package.json                  # Dependências do frontend
│   ├── vite.config.ts                # Configuração Vite
│   ├── tailwind.config.ts            # Configuração Tailwind
│   ├── tsconfig.json                 # Configuração TypeScript
│   ├── index.html                    # HTML principal
│   └── README.md                     # README do frontend
│
├── Sistema/                          # 📋 Documentação Geral
│   ├── README.md                     # Documentação do sistema
│   ├── RELATORIO_REORGANIZACAO.md    # Relatório de reorganização
│   └── package.json                  # (mantido para referência)
│
└── README.md                         # 📖 README principal do projeto
```

## 🎯 Responsabilidades

### Backend/
- **Banco de dados**: Migrações, schema, configurações
- **Repositories**: Camada de acesso a dados
- **Edge Functions**: Funções serverless
- **Documentação técnica**: Design, ER, deploy

### Frontend/
- **Aplicação React**: Componentes, páginas, hooks
- **Configurações**: Vite, Tailwind, TypeScript
- **Assets**: Imagens, ícones, arquivos estáticos
- **Integrações**: Cliente Supabase

### Sistema/
- **Documentação geral**: READMEs, relatórios
- **Configurações compartilhadas**: Referências

## 🚀 Como Usar

### Desenvolvimento Frontend
```bash
cd Frontend
npm install
npm run dev
```

### Aplicar Migrações do Banco
```bash
cd Backend/supabase
supabase db push
```

### Ver Documentação
- **Backend**: `Backend/README.md`
- **Frontend**: `Frontend/README.md`
- **Banco de Dados**: `Backend/DATABASE_DESIGN.md`

---

**Última atualização**: 2025-01-16

