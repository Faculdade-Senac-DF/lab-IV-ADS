# 📋 Gerenciador de Tarefas

**Projeto Final – Laboratório de Inovação IV | ADS SENAC-DF**

Aplicação web full-stack para gerenciamento de tarefas, desenvolvida como projeto final da disciplina de Laboratório de Inovação IV do curso de Análise e Desenvolvimento de Sistemas (ADS) do SENAC-DF.

---

## 🚀 Tecnologias

| Camada    | Tecnologia                   |
|-----------|------------------------------|
| Backend   | Node.js + Express            |
| Banco     | SQLite (better-sqlite3)      |
| Frontend  | HTML5, CSS3, JavaScript (ES6)|
| Testes    | Jest + Supertest             |

---

## ✨ Funcionalidades

- ✅ Criar, visualizar, editar e excluir tarefas (CRUD completo)
- 🏷️ Classificação por **status** (`Pendente`, `Em Andamento`, `Concluída`)
- ⚡ Classificação por **prioridade** (`Baixa`, `Média`, `Alta`)
- 🔍 Filtros combinados por status e prioridade
- 📊 Painel de estatísticas em tempo real
- 💬 Validação de dados no servidor com mensagens de erro em português
- 📱 Interface responsiva (desktop e mobile)
- 🔒 Proteção contra XSS no frontend (escape de HTML)

---

## 📁 Estrutura do Projeto

```
lab-IV-ADS/
├── server.js          # Servidor Express e configuração do app
├── database.js        # Criação e configuração do banco SQLite
├── routes/
│   └── tasks.js       # Rotas da API REST de tarefas
├── public/
│   ├── index.html     # Interface web (SPA)
│   ├── style.css      # Estilos CSS
│   └── app.js         # Lógica do frontend
├── tests/
│   └── tasks.test.js  # Testes automatizados (Jest + Supertest)
├── package.json
└── README.md
```

---

## ⚙️ Como Executar

### Pré-requisitos

- Node.js v18+ e npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Faculdade-Senac-DF/lab-IV-ADS.git
cd lab-IV-ADS

# Instale as dependências
npm install
```

### Iniciar o servidor

```bash
npm start
```

Acesse **http://localhost:3000** no navegador.

### Variáveis de ambiente (opcionais)

| Variável | Padrão      | Descrição                         |
|----------|-------------|-----------------------------------|
| `PORT`   | `3000`      | Porta do servidor HTTP            |
| `DB_PATH`| `tasks.db`  | Caminho do arquivo do banco SQLite|

---

## 🧪 Testes

```bash
npm test
```

Os testes cobrem todas as rotas da API:

- `GET /api/tasks` – listar, filtrar por status e prioridade
- `GET /api/tasks/:id` – buscar por ID
- `POST /api/tasks` – criar tarefa com validações
- `PUT /api/tasks/:id` – atualizar tarefa
- `DELETE /api/tasks/:id` – excluir tarefa

---

## 🌐 API REST

### Base URL: `/api/tasks`

| Método   | Rota             | Descrição                   |
|----------|------------------|-----------------------------|
| `GET`    | `/api/tasks`     | Listar todas as tarefas      |
| `GET`    | `/api/tasks/:id` | Buscar tarefa por ID         |
| `POST`   | `/api/tasks`     | Criar nova tarefa            |
| `PUT`    | `/api/tasks/:id` | Atualizar tarefa existente   |
| `DELETE` | `/api/tasks/:id` | Excluir tarefa               |

#### Filtros disponíveis (query string)

- `?status=pendente|em_andamento|concluida`
- `?priority=baixa|media|alta`

#### Exemplo de payload (POST/PUT)

```json
{
  "title": "Estudar para a prova",
  "description": "Revisar os capítulos 3 e 4",
  "status": "pendente",
  "priority": "alta"
}
```

---

## 👥 Equipe

Projeto desenvolvido pelos alunos do curso de **Análise e Desenvolvimento de Sistemas – SENAC-DF**.

---

## 📄 Licença

MIT
