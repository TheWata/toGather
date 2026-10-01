# 🌐 toGather — Rede Social Fechada e Descentralizada (Ecossistema Nexus)

> Aplicação completa com **Back-End REST API (Node.js + Express)** e **Front-End SPA (React + Vite + Tailwind CSS)**.

---

## 📌 Sumário
- [Visão Geral e Conceito](#-visão-geral-e-conceito)
- [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Contas de Teste e Códigos de Acesso](#-contas-de-teste-e-códigos-de-acesso)
- [Documentação da API REST (Back-End)](#-documentação-da-api-rest-back-end)
  - [Status Codes HTTP Tratados](#status-codes-http-tratados)
  - [Autenticação e Sessão](#autenticação-e-sessão)
  - [CRUD Completo de Publicações / Momentos](#crud-completo-de-publicações--momentos)
  - [Rotas de Grupos e QG](#rotas-de-grupos-e-qg)
  - [Mecanismos Especiais (Spotlight, Nudge, Chat)](#mecanismos-especiais-spotlight-nudge-chat)
- [Telas da Aplicação (Front-End)](#-telas-da-aplicação-front-end)
- [Testes Automatizados](#-testes-automatizados)

---

## 💡 Visão Geral e Conceito

O **toGather** é uma rede social intimista e fechada, inspirada no ecossistema Nexus e imune a algoritmos predatórios de engajamento infinito. O projeto adota a premissa de microcomunidades privadas (Guildas / Grupos de amigos e família) com mecânicas cooperativas:

1. **Spotlight Diário (Destaque Rotativo)**: A cada dia, apenas **um membro** do grupo é sorteado para compartilhar um vídeo curto de até 60 segundos com áudio e controles.
2. **Mecânica de "Cutucar" (Nudge)**: Membros do grupo podem cutucar o sorteado caso ele ainda não tenha enviado o momento do dia.
3. **Fotos Coletivas do Dia**: Feed de fotos dos membros com CRUD completo (criar, visualizar, editar legenda e excluir).
4. **Guild Progression**: Nível do grupo, XP acumulado por postagens coletivas e sequência diária (*Streak*).
5. **Chat do QG**: Bate-papo interno do grupo com atualização dinâmica e scroll automático.

---

## 🛠️ Arquitetura e Tecnologias

### Back-End:
- **Node.js**: Runtime Javascript assíncrono.
- **Express 4.x**: Framework minimalista para API REST.
- **express-session**: Gerenciamento de sessões com cookies seguros (`httpOnly`, `sameSite: 'lax'`).
- **bcryptjs**: Hashing seguro de senhas com salt rounds.
- **cors**: Configuração de Cross-Origin Resource Sharing com credenciais ativadas.
- **uuid**: Identificadores únicos universais para entidades.
- **Armazenamento em Memória**: Estrutura de dados relacional em memória com seed inicial consistente.

### Front-End:
- **React 19**: Biblioteca de interfaces reativas com Hooks (`useState`, `useEffect`, `useRef`, `useCallback`).
- **Vite 8**: Build tool de alta performance com HMR instantâneo.
- **Tailwind CSS v4**: Estilização moderna com design system escuro (*Cyber Clean / Glassmorphism*).
- **Lucide Icons**: Ícones minimalistas para interface limpa e intuitiva.
- **Context API**: Autenticação global com persistência de sessão e verificação automática em `/api/auth/me`.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos:
- Node.js instalado (versão 18+ recomendada)
- Gerenciador de pacotes `npm`

### 1. Iniciar o Back-End (Porta 3001)
Na raiz do projeto:
```bash
npm install
npm start
```
> O servidor iniciará em `http://localhost:3001`.

### 2. Iniciar o Front-End (Porta 5173)
Em um novo terminal, entre na pasta `client`:
```bash
cd client
npm install
npm run dev
```
> A aplicação abrirá em `http://localhost:5173`.

---

## 🔑 Contas de Teste e Códigos de Acesso

### Usuários de Demonstração (Senha padrão para todos: `123456`):
| Nome | E-mail | Função / Grupos |
| :--- | :--- | :--- |
| **Alex** | `alex@nexus.io` | Admin em *Amigos da Faculdade*, Membro em *Família* |
| **Bruna** | `bruna@nexus.io` | Sorteada de hoje em *Amigos da Faculdade*, Admin em *Devs Nexus* |
| **Carlos** | `carlos@nexus.io` | Membro em *Amigos da Faculdade* e *Devs Nexus* |
| **Diana** | `diana@nexus.io` | Admin em *Família*, Membro em *Devs Nexus* |

> ⚡ **Facilidade na Tela de Login**: Há botões de preenchimento com 1 clique para qualquer um dos 4 usuários demo.

### Códigos para Ingressar em Grupos Existentes:
- `FAC2024` — *Amigos da Faculdade* 🎓
- `FAMILIA01` — *Família* 🏠
- `DEVNEX42` — *Devs Nexus* 💻

---

## 📡 Documentação da API REST (Back-End)

### Status Codes HTTP Tratados:
- **`200 OK`**: Sucesso em consultas (`GET`), atualizações (`PUT`), exclusões (`DELETE`) ou ações como cutucar.
- **`201 Created`**: Sucesso na criação de novos recursos (`POST` de posts, registro de conta ou mensagem no chat).
- **`400 Bad Request`**: Dados obrigatórios ausentes, formato inválido, violação de regras de negócio (ex: usuário tentando se cutucar ou senha menor que 6 caracteres).
- **`401 Unauthorized`**: Tentativa de acesso a rota protegida sem sessão ativa ou credenciais incorretas no login.
- **`403 Forbidden`**: Tentativa de editar/excluir post de outro autor ou postar spotlight sem ser o membro sorteado.
- **`404 Not Found`**: Recurso não localizado (post inexistente, grupo não encontrado com o código informado).

---

### Autenticação e Sessão
| Método | Endpoint | Status | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | `201` / `400` | Cadastro de novo usuário (`username`, `email`, `password`) |
| `POST` | `/api/auth/login` | `200` / `400` / `401` | Login com e-mail e senha, criando cookie de sessão HTTPOnly |
| `POST` | `/api/auth/logout` | `200` / `401` | Encerramento da sessão e destruição do cookie |
| `GET` | `/api/auth/me` | `200` / `401` | Retorna o usuário autenticado na sessão atual |

---

### CRUD Completo de Publicações / Momentos
| Método | Endpoint | Status | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/groups/:groupId/posts` | `200` / `401` / `403` / `404` | **Listar** todas as publicações do grupo |
| `GET` | `/api/posts/:id` | `200` / `401` / `404` | **Consultar** publicação específica por ID |
| `POST` | `/api/groups/:groupId/posts` | `201` / `400` / `401` / `403` | **Criar** publicação (`type`: "photo" ou "spotlight", `url`, `caption`) |
| `PUT` | `/api/posts/:id` | `200` / `400` / `401` / `403` / `404` | **Atualizar** a legenda da publicação (somente pelo autor) |
| `DELETE` | `/api/posts/:id` | `200` / `401` / `403` / `404` | **Excluir** publicação (somente pelo autor) |

---

### Rotas de Grupos e QG
| Método | Endpoint | Status | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/groups` | `200` / `401` | Lista todos os grupos do usuário autenticado |
| `POST` | `/api/groups/join` | `200` / `400` / `401` / `404` | Ingressa em um grupo pelo código |
| `GET` | `/api/groups/:groupId/hq` | `200` / `401` / `403` / `404` | Dados consolidados do QG: Spotlight, fotos, membros, chat e XP |

---

### Mecanismos Especiais (Spotlight, Nudge, Chat)
| Método | Endpoint | Status | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/groups/:groupId/nudge` | `200` / `400` / `401` / `404` | Cutuca o membro sorteado para postar o Spotlight (com anti-spam) |
| `POST` | `/api/groups/:groupId/chat` | `201` / `400` / `401` / `403` | Envia mensagem no chat interno da guilda |
| `GET` | `/api/health` | `200` | Verificação de integridade da API |

---

## 🖥️ Telas da Aplicação (Front-End)

1. **Tela de Autenticação (`AuthPage`)**:
   - Abas alternáveis para **Entrar** e **Criar Conta**.
   - Atalhos rápidos com 1 clique para as 4 contas demo.
   - Validações completas e mensagens de erro visíveis com estilo feedback toast.

2. **Dashboard de Grupos (`GroupsPage`)**:
   - Exibição de cartões para cada grupo participante.
   - Indicadores de **Nível da Guilda**, **Sequência de Dias (Streak)** e **Status do Spotlight**.
   - Modal para ingressar em novos grupos via código com feedback imediato.

3. **QG do Grupo (`HQPage`)**:
   - **Hero Spotlight**: Vídeo do membro sorteado com player customizado, áudio e controles; ou estado de espera com botão interativo de **Cutucar**.
   - **Feed de Momentos**: Galeria de fotos com botão para adicionar novo momento, modal de edição de legenda e exclusão com confirmação.
   - **Chat em Tempo Real**: Bate-papo persistente com auto-scroll para a última mensagem.
   - **Barra de Progresso de Nível e XP**: Atualização dinâmica do grupo a cada post publicado.

---

## 🧪 Testes Automatizados

O projeto inclui um script de teste automatizado ponta a ponta (`test_api.js`) cobrindo 100% dos requisitos acadêmicos da API REST.

Para executar os testes:
```bash
node test_api.js
```

O script testa de forma encadeada:
1. `GET /api/health`
2. Proteção de rota contra acessos não autenticados (`401 Unauthorized`)
3. Login e geração de cookie de sessão HTTPOnly
4. Consulta de perfil autenticado (`/api/auth/me`)
5. Listagem de grupos pertencentes ao usuário autenticado
6. Consulta ao QG do grupo (`/api/groups/:groupId/hq`)
7. Listagem de posts do grupo (`GET /api/groups/:groupId/posts`)
8. Criação de novo post com retorno `201 Created`
9. Edição de legenda com retorno `200 OK`
10. Exclusão de post com retorno `200 OK`
11. Envio de mensagem de chat (`201 Created`)
12. Mecanismo de cutucar (`200 OK`)
13. Validação de erros controlados (`400 Bad Request` e `404 Not Found`)
