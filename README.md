# Health Pass

Aplicativo web moderno para gestão pessoal de saúde, desenvolvido com React e TypeScript. O Health Pass permite que os usuários gerenciem seus registros médicos, agendem consultas, acompanhem vacinas e mantenham um histórico completo de sua saúde em um só lugar.

## 🚀 Funcionalidades

### 📊 Dashboard
- Visão geral da saúde do usuário
- Estatísticas rápidas (próximas consultas, exames pendentes, vacinas em dia, lembretes)
- Alertas e notificações recentes
- Acesso rápido às principais funcionalidades

### 📅 Agendamento de Consultas
- Agendar novas consultas médicas
- Visualizar consultas agendadas
- Detalhes completos de cada consulta
- Histórico de consultas passadas

### 📋 Registros Médicos
- **Exames**: Gerenciar e visualizar resultados de exames
- **Receitas**: Armazenar receitas médicas com validade
- **Vacinas**: Controle de carteira de vacinação com lembretes de próximas doses
- Upload de documentos médicos
- Visualização e download de documentos
- Busca e filtros para facilitar o acesso

### 👤 Perfil do Usuário
- Gerenciar informações pessoais
- Configurações de conta
- Plano de saúde

### 🔔 Notificações
- Sistema de alertas e lembretes
- Notificações de exames pendentes
- Lembretes de medicação
- Avisos de consultas próximas

### 🎯 Onboarding
- Experiência inicial guiada para novos usuários
- Apresentação das funcionalidades principais

## 🛠️ Tecnologias

### Core
- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool e dev server ultra-rápido

### Roteamento e Estado
- **React Router DOM** - Roteamento para aplicações React
- **TanStack Query (React Query)** - Gerenciamento de estado do servidor e cache

### UI e Estilização
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI reutilizáveis e acessíveis
- **Radix UI** - Primitivos UI acessíveis e não estilizados
- **Lucide React** - Biblioteca de ícones moderna

### Formulários e Validação
- **React Hook Form** - Biblioteca para gerenciamento de formulários
- **Zod** - Validação de schemas TypeScript-first
- **@hookform/resolvers** - Resolvers para integração com Zod

### Outras Bibliotecas
- **date-fns** - Manipulação de datas
- **sonner** - Sistema de notificações toast
- **recharts** - Biblioteca de gráficos para React

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ ou Bun
- npm, yarn, pnpm ou bun

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/health-pass.git
cd health-pass
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
# ou
pnpm install
# ou
bun install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

4. Acesse a aplicação em `http://localhost:8080`

## 📜 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria uma build de produção
- `npm run build:dev` - Cria uma build em modo desenvolvimento
- `npm run preview` - Preview da build de produção
- `npm run lint` - Executa o linter ESLint

## 📁 Estrutura do Projeto

```
health-pass/
├── public/                 # Arquivos estáticos públicos
├── src/
│   ├── assets/            # Imagens e outros assets
│   ├── components/        # Componentes React reutilizáveis
│   │   ├── ui/           # Componentes UI base (shadcn/ui)
│   │   └── ...           # Componentes específicos da aplicação
│   ├── hooks/            # Custom hooks React
│   ├── lib/              # Utilitários e helpers
│   ├── pages/            # Páginas/rotas da aplicação
│   │   ├── Dashboard.tsx
│   │   ├── Appointments.tsx
│   │   ├── BookAppointment.tsx
│   │   ├── Records.tsx
│   │   ├── Profile.tsx
│   │   ├── Auth.tsx
│   │   ├── Onboarding.tsx
│   │   └── ...
│   ├── App.tsx           # Componente raiz da aplicação
│   ├── main.tsx          # Ponto de entrada
│   └── index.css         # Estilos globais
├── package.json
├── vite.config.ts        # Configuração do Vite
├── tailwind.config.ts    # Configuração do Tailwind
└── tsconfig.json         # Configuração do TypeScript
```

## 🔐 Autenticação

O sistema de autenticação atual utiliza armazenamento local (localStorage) para simulação. Em produção, deve ser integrado com um backend real que forneça:

- Autenticação via JWT ou sessões
- Validação de credenciais
- Gerenciamento de tokens
- Recuperação de senha

## 🎨 Personalização

### Temas
O projeto utiliza Tailwind CSS com suporte a temas. Você pode personalizar as cores e estilos editando:
- `tailwind.config.ts` - Configuração do Tailwind
- `src/index.css` - Variáveis CSS e estilos globais

### Componentes UI
Os componentes base são do shadcn/ui e podem ser customizados editando os arquivos em `src/components/ui/`.

## 🚧 Próximas Funcionalidades

- [ ] Integração com backend real
- [ ] Sincronização com nuvem
- [ ] Compartilhamento de documentos com profissionais de saúde
- [ ] Integração com laboratórios e clínicas
- [ ] Notificações push
- [ ] Modo offline
- [ ] Exportação de relatórios em PDF
- [ ] Integração com wearables (smartwatches, etc.)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvido por

[Seu Nome/Autor]

## 📧 Contato

Para dúvidas ou sugestões, entre em contato através do email ou abra uma issue no repositório.

---

**Health Pass** - Sua saúde na palma da mão 🏥💚
