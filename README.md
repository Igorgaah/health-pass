# Health Pass - Sistema de Gestão de Saúde

Aplicativo web moderno para gestão pessoal de saúde, desenvolvido com React, TypeScript e Supabase.

## 📁 Estrutura do Projeto

```
health-pass/
├── Backend/              # Backend e Banco de Dados
│   ├── supabase/        # Configuração Supabase
│   │   ├── migrations/  # Migrações do banco de dados
│   │   └── functions/   # Edge Functions
│   ├── src/             # Código do backend
│   │   ├── repositories/ # Repositories (camada de acesso a dados)
│   │   └── tests/        # Testes
│   └── *.md             # Documentação do banco de dados
│
├── Frontend/            # Frontend React
│   ├── src/             # Código fonte
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── hooks/       # Custom hooks
│   │   └── integrations/# Integrações (Supabase)
│   ├── public/          # Arquivos estáticos
│   └── *.config.*       # Configurações (Vite, Tailwind, etc.)
│
└── Sistema/             # Configurações e Documentação Geral
    ├── package.json     # Dependências principais
    └── README.md        # Documentação do sistema
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ ou Bun
- Conta no Supabase
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/health-pass.git
cd health-pass
```

2. **Instale as dependências do Frontend**
```bash
cd Frontend
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie arquivo .env na pasta Frontend
VITE_SUPABASE_URL=https://seu-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
```

4. **Aplique as migrações do banco**
```bash
cd Backend/supabase
supabase db push
```

5. **Inicie o servidor de desenvolvimento**
```bash
cd Frontend
npm run dev
```

## 📚 Documentação

### Backend
- **[DATABASE_DESIGN.md](./Backend/DATABASE_DESIGN.md)**: Design completo do banco de dados
- **[ER_MODEL.md](./Backend/ER_MODEL.md)**: Modelo Entidade-Relacionamento
- **[DEPLOYMENT_GUIDE.md](./Backend/DEPLOYMENT_GUIDE.md)**: Guia de deploy
- **[EXAMPLES.md](./Backend/EXAMPLES.md)**: Exemplos de uso dos repositories

### Frontend
- Verifique `Frontend/README.md` para documentação específica do frontend

## 🛠️ Tecnologias

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query

### Backend
- Supabase (PostgreSQL)
- TypeScript
- Edge Functions

## 📋 Funcionalidades

- ✅ Gestão de consultas médicas
- ✅ Registro de sinais vitais
- ✅ Lembretes personalizados
- ✅ Documentos médicos (exames, receitas, vacinas)
- ✅ Sistema de gamificação
- ✅ Dashboard de saúde
- ✅ Autenticação segura
- ✅ PWA (Progressive Web App)

## 🔐 Segurança

- Row Level Security (RLS) em todas as tabelas
- Autenticação via Supabase Auth
- Criptografia em trânsito e repouso
- Log de auditoria completo
- Conformidade LGPD

## 📝 Scripts Disponíveis

### Frontend
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview da build
npm run lint     # Linter
```

### Backend
```bash
cd Backend/supabase
supabase db push    # Aplicar migrações
supabase functions deploy  # Deploy de funções
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

- Igor Rafael
- Igor Felipe
- Guilherme Silva

---

**Health Pass** - Sua saúde na palma da mão 🏥💚

