# NestJS Transactions API Challenge

API RESTful desenvolvida com NestJS e TypeScript para gerenciar transações financeiras e fornecer estatísticas. Este projeto segue os princípios da Clean Architecture.

## 1. Introdução

O objetivo deste desafio é criar uma API que recebe transações (valor e timestamp) e retorna estatísticas baseadas nessas transações ocorridas nos últimos 60 segundos.

## 2. Requisitos Técnicos Atendidos

-   Desenvolvido com **NestJS** e **TypeScript**.
-   Repositório público no **GitHub/GitLab**.
-   Commits por endpoint (ou mais granular).
-   Gerenciador de pacotes: **pnpm** (utilizado neste projeto, mas Yarn também é comum).
-   Armazenamento de dados **em memória** (sem banco de dados externo).
-   Aceita e responde apenas com **JSON**.
-   Padrões **RESTful** na construção dos endpoints.
-   **Tratamento de erros** adequado e respostas HTTP apropriadas.
-   **Testável**: Contém testes unitários (Jest) e de integração/E2E (Supertest).
-   **Containerizável**: Inclui `Dockerfile`.
-   **Documentação**: API documentada com **Swagger** (`/api-docs`).
-   **Logs Estruturados**: Utiliza **Winston** (configurado via `nest-winston` e usado diretamente).
-   **Clean Architecture**: Separação em Controllers, Use Cases, Entities, Repositories e Interfaces.
-   **Inversão de Dependência (DI)** utilizada.
-   **DTOs** para validação e tipagem.
-   Princípios **SOLID** e **Clean Code** aplicados.
-   **Segurança Básica**: `helmet` para proteção contra ataques comuns.
-   **Rate Limiting**: Implementado com `@nestjs/throttler`.
-   **Variáveis de Ambiente**: Suporte para `.env` files via `@nestjs/config`.
-   **Healthcheck Endpoint**: `GET /transactions/health`.

## 3. Endpoints da API

Consulte a documentação do Swagger em `/api-docs` após iniciar a aplicação.

-   **`POST /transactions`**: Cria uma nova transação.
    -   Corpo: `{ "amount": number, "timestamp": "ISO8601_string" }`
    -   Respostas: `201 Created`, `400 Bad Request`, `422 Unprocessable Entity`.
-   **`DELETE /transactions`**: Remove todas as transações.
    -   Resposta: `200 OK`.
-   **`GET /transactions/statistics`**: Retorna estatísticas das transações dos últimos 60 segundos.
    -   Resposta: `200 OK` com corpo `{ "sum": number, "avg": number, "max": number, "min": number, "count": number }`.
-   **`GET /transactions/health`**: Endpoint de healthcheck.
    -   Resposta: `200 OK` com `{ "status": "ok", "timestamp": "ISO_DATE" }`.

## 4. Estrutura do Projeto

O projeto segue uma estrutura baseada na Clean Architecture:

-   `src/application`: Contém os Use Cases (lógica de aplicação) e DTOs.
-   `src/domain`: Contém as Entidades de domínio e as Interfaces dos Repositórios.
-   `src/infrastructure`: Contém os Controllers (HTTP), implementações concretas de Repositórios (em memória), módulos NestJS, configuração de logging, etc.
    -   `src/infrastructure/modules`: Contém módulos de features como `TransactionModule`.

## 5. Como Executar

### 5.1. Pré-requisitos

-   Node.js (v18 ou superior recomendado)
-   NPM
-   Docker (para execução em container)

### 5.2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`.
Exemplo:
```
PORT=3000
```

### 5.3. Instalação de Dependências

```bash
npm install
```

### 5.4. Executando a Aplicação (Desenvolvimento)

```bash
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3000` (ou a porta definida em `.env`).
A documentação do Swagger estará em `http://localhost:3000/api-docs`.

### 5.5. Executando Testes

```bash
# Testes Unitários e de Integração (conforme configuração do Jest)
npm run test

# Testes E2E (se configurado um script específico, senão parte do 'test')
npm run test:e2e

# Testes com Cobertura
npm run test:cov
```

### 5.6. Executando com Docker

Construa a imagem Docker:
```bash
docker build -t nestjs-transactions-api .
```

Execute o container:
```bash
docker run -p 3000:3000 -d --name transactions-app --env-file .env nestjs-transactions-api
```
A aplicação estará acessível em `http://localhost:3000`.

(Opcional) Usando `docker-compose.yml`:
```bash
docker-compose up -d
```
Para parar:
```bash
docker-compose down
```

## 6. Diferenciais (Opcionais Implementados/Considerados)

-   **CI/CD**: Está configurado com GitHub Actions nesse repositório.
-   **Métricas (Prometheus/Grafana)**: O NestJS possui integrações para expor métricas.
-   **WebSockets**: Não implementado, mas seria uma adição para estatísticas em tempo real.

## 7. Decisões de Design e Boas Práticas

-   **Clean Architecture**: Para separação de responsabilidades e testabilidade.
-   **SOLID**: Aplicado no design de classes e módulos.
-   **DTOs e ValidationPipe**: Para validação robusta de entrada.
-   **Injeção de Dependência**: Utilizada extensivamente pelo NestJS.
-   **Logging Estruturado**: Para melhor observabilidade.
-   **Testes Abrangentes**: Unitários para lógica de negócio e E2E para os endpoints da API.
-   **Dockerização**: Para portabilidade e facilidade de deploy.
-   **Swagger**: Para documentação clara da API.
-   **Segurança**: `helmet` e `class-validator` para mitigar riscos comuns.
-   **Rate Limiting**: Para proteger a API contra abuso.
