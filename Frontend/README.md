# Health Pass - Frontend

Frontend do sistema Health Pass desenvolvido com React, TypeScript e Vite.

## 🚀 Início Rápido

### Instalação

```bash
npm install
```

### Configuração

Crie um arquivo `.env` na raiz do Frontend:

```env
VITE_SUPABASE_URL=https://seu-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
```

### Desenvolvimento

```bash
npm run dev
```

O servidor iniciará em `http://localhost:8080`

### Build

```bash
npm run build
```

Os arquivos compilados estarão em `dist/`

## 📁 Estrutura

```
Frontend/
├── src/
│   ├── components/      # Componentes React reutilizáveis
│   │   └── ui/         # Componentes UI (shadcn/ui)
│   ├── pages/          # Páginas/rotas da aplicação
│   ├── hooks/          # Custom hooks
│   ├── integrations/   # Integrações (Supabase)
│   ├── lib/            # Utilitários
│   └── utils/          # Funções auxiliares
├── public/             # Arquivos estáticos
└── *.config.*          # Configurações
```

## 🛠️ Tecnologias

- **React 18**: Biblioteca UI
- **TypeScript**: Tipagem estática
- **Vite**: Build tool
- **Tailwind CSS**: Estilização
- **shadcn/ui**: Componentes UI
- **React Router**: Roteamento
- **TanStack Query**: Gerenciamento de estado do servidor
- **Supabase**: Backend e autenticação

## 📋 Scripts

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run build:dev` - Build em modo desenvolvimento
- `npm run preview` - Preview da build
- `npm run lint` - Executar linter

## 🔗 Integração com Backend

O frontend se conecta ao backend via Supabase:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Exemplo de uso
const { data, error } = await supabase
  .from('appointments')
  .select('*');
```

## 📱 PWA

O projeto está configurado como PWA (Progressive Web App):
- Instalável em dispositivos móveis
- Funciona offline (com cache)
- Service Worker configurado

## 🎨 Temas

O projeto suporta temas claro/escuro via `next-themes`.

---

Para mais informações sobre o backend, veja [../Backend/README.md](../Backend/README.md)

