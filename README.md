# 🚀 ClientFlow — Mini CRM

**Sistema de gestão de clientes full stack** — um portfólio profissional demonstrando
desenvolvimento web moderno com Laravel 13 (API) e React 19 (SPA).

![Stack](https://img.shields.io/badge/Laravel-13-red?logo=laravel)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![PHP](https://img.shields.io/badge/PHP-8.4-purple?logo=php)

---

## ✨ Funcionalidades

- 🔐 **Autenticação via API** — registro, login e logout com tokens Laravel Sanctum
- 📊 **Dashboard** com cards de métricas + gráfico de pizza (Recharts)
- 👥 **CRUD completo de clientes** — criar, listar, editar e excluir
- 🔍 **Busca e filtros** — pesquisa por nome e filtro por status (ativo/inativo/lead)
- 📄 **Paginação** no backend e frontend
- 🎨 **UI moderna** — TailwindCSS 4 + ícones Lucide
- 📱 **Responsivo** — funciona em desktop e mobile

---

## 🛠 Stack Técnica

### Backend
| Tecnologia | Descrição |
|---|---|
| **Laravel 13** | Framework PHP com arquitetura MVC |
| **Sanctum** | Autenticação token-based para API |
| **SQLite** | Banco de dados leve (troque por MySQL/Postgres em produção) |
| **Form Requests** | Validação de dados desacoplada dos controllers |
| **API Resources** | Transformação consistente de dados JSON |
| **Policies** | Autorização por usuário (cada vendedor vê só seus clientes) |

### Frontend
| Tecnologia | Descrição |
|---|---|
| **React 19** | Biblioteca UI com hooks e componentes funcionais |
| **TypeScript** | Tipagem estática ponta a ponta |
| **Vite 8** | Build tool ultrarrápido |
| **TailwindCSS 4** | CSS utility-first com design system customizado |
| **Recharts** | Gráficos interativos |
| **React Router 7** | Roteamento SPA com lazy loading |
| **Axios** | HTTP client com interceptors para auth automática |

---

## 🚀 Rodando localmente

### Pré-requisitos
- PHP 8.3+
- Composer
- Node.js 20+
- npm

### Backend

```bash
cd clientflow
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --port=8000
```

> **Credenciais demo:** `demo@clientflow.app` / `password`

### Frontend

```bash
cd clientflow/frontend
npm install
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

---

## 📡 API Endpoints

### Públicos
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/register` | Registrar novo usuário |
| `POST` | `/api/login` | Login (retorna token) |

### Autenticados (Bearer Token)
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/logout` | Revogar token |
| `GET` | `/api/me` | Dados do usuário logado |
| `GET` | `/api/dashboard` | Estatísticas (total, ativos, inativos, leads) |
| `GET` | `/api/clients` | Listar clientes (com `?status=active` e paginação) |
| `POST` | `/api/clients` | Criar cliente |
| `GET` | `/api/clients/{id}` | Detalhes do cliente |
| `PUT` | `/api/clients/{id}` | Atualizar cliente |
| `DELETE` | `/api/clients/{id}` | Excluir cliente |

---

## 📁 Estrutura do Projeto

```
clientflow/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/    # Auth, Client, Dashboard
│   │   ├── Requests/            # Validação (StoreClient, UpdateClient, etc.)
│   │   └── Resources/           # Transformação JSON (ClientResource, UserResource)
│   ├── Models/                  # User, Client (Eloquent)
│   └── Policies/               # ClientPolicy (autorização)
├── database/
│   ├── migrations/              # Tabelas: users, clients, personal_access_tokens
│   ├── factories/               # UserFactory, ClientFactory
│   └── seeders/                 # DatabaseSeeder (usuário demo + 20 clientes)
├── routes/
│   └── api.php                  # Rotas da API REST
├── frontend/
│   └── src/
│       ├── contexts/            # AuthContext (estado global de autenticação)
│       ├── components/          # Layout (sidebar + outlet)
│       ├── pages/               # Login, Dashboard, Clients
│       └── lib/                 # api.ts (axios), utils.ts
└── config/
    └── cors.php                 # Configuração CORS
```

---

## 🧑‍💻 Autor

**Wallice Carias Perussio** — Desenvolvedor Full Stack

- GitHub: [WalliceCariasPerussio](https://github.com/WalliceCariasPerussio)
- Stack: Laravel, React, Next.js, Vue.js, Python, Docker, MySQL, TailwindCSS
- Email: wallicecarias@gmail.com

---

## 📝 Licença

MIT — sinta-se livre para usar como base para seus projetos ou como material de estudo.
