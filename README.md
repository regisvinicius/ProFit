ProfitOS
Profit Intelligence for Small E-commerce Sellers

ProfitOS é uma aplicação web Docker-first, criada para ajudar vendedores de e-commerce
a entenderem o lucro líquido real, identificar produtos que parecem bons mas dão
prejuízo e tomar decisões de preço com base em dados — não em achismo.

Este projeto foi desenvolvido como um projeto de portfólio sênior, com foco em
arquitetura moderna, experiência de desenvolvimento (DX), automação e boas práticas
de engenharia de software.

==================================================
OBJETIVO DO PROJETO
==================================================

- Demonstrar domínio de arquitetura full-stack moderna
- Mostrar uso prático de Docker, CI/CD e Cloud
- Construir um produto realista e potencialmente vendável
- Priorizar decisões técnicas conscientes, não apenas features

==================================================
VISÃO GERAL DA ARQUITETURA
==================================================

A aplicação segue uma arquitetura totalmente containerizada, com serviços isolados
e comunicação via rede Docker.

┌─────────────┐      HTTP       ┌──────────────┐
│  Frontend   │ ─────────────▶ │   Backend    │
│ React/Vite  │                │  Fastify API │
└─────────────┘                └───────┬──────┘
                                        │
                                        │ SQL
                                        ▼
                                ┌──────────────┐
                                │ PostgreSQL   │
                                │   Database   │
                                └──────────────┘

Todos os serviços rodam em containers Docker e são orquestrados via Docker Compose.

==================================================
COMPONENTES
==================================================

FRONTEND
- React + Vite
- UI focada em clareza de dados e tomada de decisão
- Comunicação via API REST
- Estilização com Tailwind CSS + shadcn/ui
- Lint e formatação com Biome

BACKEND
- Node.js + Fastify + TypeScript
- API REST
- Arquitetura modular (routes, services, domain)
- Camada de domínio isolada para cálculos financeiros
- Configuração via variáveis de ambiente
- Endpoint de health check
- Validação de dados
- Lint e formatação com Biome

DATABASE
- PostgreSQL
- Rodando em container dedicado
- Persistência via volumes Docker
- Migrations versionadas
- Comunicação via rede interna do Docker

==================================================
INFRAESTRUTURA (DOCKER-FIRST)
==================================================

O projeto é desenhado para rodar da mesma forma em:

- Ambiente local
- Ambiente de produção (Oracle Cloud)

Nenhuma dependência é instalada diretamente na máquina host além de:
- Docker
- Docker Compose

Containers principais:
- frontend
- backend
- db

==================================================
CLOUD & DEPLOY
==================================================

Oracle Cloud Always Free
- VM Linux (Ubuntu)
- Docker + Docker Compose
- Zero custo
- Infra simples, reproduzível e documentada

DEPLOY AUTOMÁTICO (PREPARADO)
- GitHub Actions
- Pipeline acionado por push na branch main
- Build e deploy via SSH
- docker compose up -d --build

OBSERVAÇÃO:
O ambiente de produção está totalmente preparado, mas o deploy em produção
não será executado inicialmente. O foco do projeto é arquitetura, automação
e qualidade técnica, mantendo produção pronta para uso futuro.

==================================================
AUTENTICAÇÃO
==================================================

- JWT + Refresh Token
- Autenticação baseada em API
- Frontend consome tokens via HTTP
- Configuração por ambiente

==================================================
DOMÍNIO DO NEGÓCIO (CORE)
==================================================

ProfitOS não é um ERP.

O foco principal do sistema é fornecer inteligência de lucro e suporte à decisão.

Principais responsabilidades do domínio:
- Cálculo de lucro líquido real
- Análise de margem
- Simulação de preços
- Identificação de produtos com baixa ou negativa rentabilidade

Entidades principais:
- Product
- Sale
- Cost
- Channel
- FeeRule

O motor de cálculo financeiro é isolado do restante da aplicação.

==================================================
QUALIDADE DE CÓDIGO
==================================================

- Biome para lint e formatação
- TypeScript em modo estrito
- Padrões consistentes entre frontend e backend
- Scripts automatizados para desenvolvimento

==================================================
TESTES (PLANEJADOS)
==================================================

- Testes de domínio (cálculos financeiros)
- Testes de API (rotas críticas)
- Testes focados em lógica, não apenas UI

==================================================
ROADMAP (MVP)
==================================================

1. Infra Docker funcionando
2. Backend com health check
3. Frontend conectado à API
4. Autenticação
5. Cadastro de produtos
6. Motor de cálculo de lucro
7. Relatórios básicos
8. Pipeline de deploy automático

==================================================
DECISÕES TÉCNICAS IMPORTANTES
==================================================

- Docker desde o primeiro commit
- Fastify pela performance, tipagem e ecossistema moderno
- Biome pela simplicidade e excelente DX
- Oracle Cloud Always Free pelo custo zero
- Foco no domínio e decisões de negócio, não em CRUD genérico
