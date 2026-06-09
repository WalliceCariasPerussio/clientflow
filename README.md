# 🚀 ClientFlow — Mini CRM

**Sistema de gestão de clientes full stack** — um portfólio profissional demonstrando desenvolvimento web moderno com Laravel 13 (API) e React 19 (SPA).

![Laravel](https://img.shields.io/badge/Laravel-13-red?logo=laravel)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![PHP](https://img.shields.io/badge/PHP-8.4-purple?logo=php)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![SQLite](https://img.shields.io/badge/SQLite-3-blue?logo=sqlite)

---

## ✨ Funcionalidades

### 📊 Dashboard
- Cards de métricas: clientes, empresas, receita total
- 💰 Cards financeiros: receita total, faturamento do mês, pendentes
- 📈 Gráfico de barras: vendas por mês
- 🥧 Gráfico de pizza: distribuição de clientes (ativos/inativos/leads)
- 👥 Lista de clientes recentes
- 📥 Exportar CSV

### 👥 Clientes
- CRUD completo com modal
- Busca por nome/email e filtro por status
- Vínculo com empresas
- Paginação server-side

### 💰 Vendas
- Registro de vendas por cliente
- Status: concluída, pendente, cancelada
- Filtro por status e busca por descrição

### 🏦 Financeiro
- Controle de entradas e saídas
- Categorização (serviço, produto, assinatura, etc.)
- Cards de saldo total, entradas e saídas do mês

### 📅 Agenda
- Compromissos com clientes
- Navegação mensal
- Status: agendado, concluído, cancelado

### 🏢 Empresas
- Cadastro de empresas vinculadas aos clientes
- Listagem completa

### 🎨 UI/UX
- 🔐 Autenticação via API (Laravel Sanctum)
- 🌙 Dark mode
- 📱 100% responsivo (mobile-first)
- 🎭 Animações e transições
- 🔔 Notificações toast

---

## 🐳 Docker (Recomendado)

```bash
# Clone
git clone https://github.com/WalliceCariasPerussio/clientflow.git
cd clientflow

# Build + iniciar
docker compose up -d --build

# Acessar
open http://localhost:8006
```

> **Credenciais demo:** `demo@clientflow.app` / `password`

### Comandos úteis

```bash
# Logs
docker compose logs -f

# Reiniciar
docker compose restart

# Rebuild após alterações
docker compose up -d --build

# Parar
docker compose down
```

### Estrutura Docker

```
clientflow/
├── Dockerfile              # PHP 8.4-fpm + Nginx + Supervisor
├── docker-compose.yml      # Porta 8006, volumes persistentes
├── entrypoint.sh           # Migrations + seed automáticos
├── nginx/
│   └── default.conf        # Serve frontend build + proxy /api → PHP-FPM
└── supervisor/
    └── supervisord.conf    # Gerencia PHP-FPM + Nginx
```

| Serviço | Descrição |
|---------|-----------|
| `php-fpm` | Processa requisições PHP/Laravel |
| `nginx` | Serve frontend estático + proxy reverso |
| `supervisord` | Mantém ambos os processos vivos |

---

## 💻 Rodando localmente (dev)

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
|--------|------|-----------|
| `POST` | `/api/register` | Registrar novo usuário |
| `POST` | `/api/login` | Login (retorna token) |

### Autenticados (Bearer Token)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/logout` | Revogar token |
| `GET` | `/api/me` | Dados do usuário |
| `GET` | `/api/dashboard` | Estatísticas completas |
| `GET` | `/api/clients` | Listar clientes |
| `POST` | `/api/clients` | Criar cliente |
| `PUT` | `/api/clients/{id}` | Atualizar cliente |
| `DELETE` | `/api/clients/{id}` | Excluir cliente |
| `GET` | `/api/clients/export` | Exportar CSV |
| `GET` | `/api/clients/recent` | Clientes recentes |
| `GET` | `/api/sales` | Listar vendas |
| `POST` | `/api/sales` | Registrar venda |
| `GET` | `/api/sales/totals` | Totais de vendas |
| `GET` | `/api/sales/monthly` | Vendas agrupadas por mês |
| `GET` | `/api/transactions` | Listar transações |
| `POST` | `/api/transactions` | Criar transação |
| `GET` | `/api/transactions/balance` | Saldo financeiro |
| `GET` | `/api/appointments` | Listar compromissos |
| `POST` | `/api/appointments` | Agendar compromisso |
| `GET` | `/api/companies` | Listar empresas |
| `POST` | `/api/companies` | Criar empresa |

---

## 🛠 Stack Técnica

### Backend

| Tecnologia | Descrição |
|------------|-----------|
| **Laravel 13** | Framework PHP MVC |
| **Sanctum** | Auth token-based |
| **SQLite** | Banco leve (troque por MySQL/PG em prod) |
| **API Resources** | Transformação JSON |
| **Policies** | Autorização por usuário |

### Frontend

| Tecnologia | Descrição |
|------------|-----------|
| **React 19** | UI com hooks + componentes |
| **TypeScript** | Tipagem estática |
| **Vite 8** | Build tool |
| **TailwindCSS 4** | CSS utility-first |
| **Recharts** | Gráficos (barra + pizza) |
| **React Router 7** | Roteamento SPA |
| **Lucide** | Ícones |

---

## 🧑‍💻 Autor

**Wallice Carias Perussio** — Desenvolvedor Full Stack

- GitHub: [WalliceCariasPerussio](https://github.com/WalliceCariasPerussio)
- Stack: Laravel, React, Next.js, Vue.js, Python, Docker, MySQL, TailwindCSS
- Email: wallicecarias@gmail.com

---

## 📝 Licença

MIT — use como base para seus projetos ou portfólio.
