# NestJS Transactions API Challenge

<!-- Badges -->
<p align="center">
  <a href="https://github.com/pedrohenriquebr/desafio-cobuccio/actions/workflows/ci.yml">
    <img src="https://github.com/pedrohenriquebr/desafio-cobuccio/actions/workflows/ci.yml/badge.svg" alt="Build Status">
  </a>
</p>

API RESTful desenvolvida com NestJS e TypeScript para gerenciar transações financeiras e fornecer estatísticas, seguindo os princípios da Clean Architecture.

## Sumário

- [1. Introdução](#1-introdução)
- [2. Requisitos Técnicos Atendidos](#2-requisitos-técnicos-atendidos)
- [3. Endpoints da API](#3-endpoints-da-api)
- [4. Estrutura do Projeto](#4-estrutura-do-projeto)
- [5. Como Executar](#5-como-executar)
  - [5.1. Pré-requisitos](#51-pré-requisitos)
  - [5.2. Variáveis de Ambiente](#52-variáveis-de-ambiente)
  - [5.3. Instalação de Dependências](#53-instalação-de-dependências)
  - [5.4. Executando a Aplicação](#54-executando-a-aplicação-desenvolvimento)
  - [5.5. Executando Testes](#55-executando-testes)
  - [5.6. Executando com Docker](#56-executando-com-docker)
- [6. Diferenciais e Próximos Passos](#6-diferenciais-e-próximos-passos)
- [7. Decisões de Design e Boas Práticas](#7-decisões-de-design-e-boas-práticas)

## 1. Introdução

O objetivo deste desafio é criar uma API robusta e eficiente que permita o registro de transações financeiras (compostas por valor e timestamp) e o cálculo de estatísticas agregadas sobre essas transações, considerando apenas aquelas ocorridas nos últimos 60 segundos.

## 2. Requisitos Técnicos Atendidos

-   **Tecnologias Base**: Desenvolvido com **NestJS** e **TypeScript**.
-   **Controle de Versão**: Repositório público no **GitHub**.
-   **Histórico de Commits**: Commits granulares por funcionalidade/endpoint.
-   **Gerenciador de Pacotes**: **npm** (utilizado neste projeto).
-   **Armazenamento de Dados**: Solução **em memória**, sem dependência de bancos de dados externos.
-   **Comunicação**: API aceita e responde exclusivamente com **JSON**.
-   **Padrões de API**: Endpoints construídos seguindo os princípios **RESTful**.
-   **Tratamento de Erros**: Implementação de tratamento de erros consistente, com respostas HTTP apropriadas.
-   **Testabilidade**: Cobertura de testes com **Jest** para testes unitários e **Supertest** para testes E2E.
-   **Containerização**: Inclui `Dockerfile` para fácil portabilidade e deploy.
-   **Documentação da API**: Documentação interativa com **Swagger (OpenAPI)**, acessível em `/api-docs`.
-   **Logging**: Logs estruturados utilizando **Winston** (via `nest-winston`).
-   **Arquitetura**: Aplicação da **Clean Architecture**, promovendo separação de responsabilidades (Controllers, Use Cases, Entities, Repositories, Interfaces).
-   **Inversão de Dependência (DI)**: Utilizada extensivamente, conforme padrão do NestJS.
-   **Data Transfer Objects (DTOs)**: Para validação de entrada e tipagem de dados.
-   **Princípios de Código**: Aplicação dos princípios **SOLID** e **Clean Code**.
-   **Segurança Básica**: Utilização de `helmet` para proteção contra vulnerabilidades web comuns.
-   **Rate Limiting**: Implementado com `@nestjs/throttler` para prevenir abuso da API.
-   **Configuração**: Suporte para variáveis de ambiente (`.env`) através do `@nestjs/config`.
-   **Healthcheck**: Endpoint `GET /transactions/health` para monitoramento da saúde da aplicação.

## 3. Endpoints da API

A documentação detalhada e interativa da API está disponível via Swagger em `http://localhost:PORT/api-docs` (substitua `PORT` pela porta configurada) após iniciar a aplicação.

-   **`POST /transactions`**: Cria uma nova transação.
    -   **Corpo da Requisição**: `{ "amount": number, "timestamp": "ISO8601_string" }`
    -   **Respostas Possíveis**:
        -   `201 Created`: Transação registrada com sucesso.
        -   `400 Bad Request`: Requisição malformada ou dados inválidos (e.g., formato de timestamp incorreto, campos obrigatórios ausentes).
        -   `422 Unprocessable Entity`: A transação não pôde ser processada devido a uma violação de regra de negócio (e.g., timestamp no futuro, valor negativo).
-   **`DELETE /transactions`**: Remove todas as transações existentes.
    -   **Respostas Possíveis**:
        -   `200 OK`: Todas as transações foram removidas com sucesso.
-   **`GET /transactions/statistics`**: Retorna estatísticas das transações ocorridas nos últimos 60 segundos.
    -   **Respostas Possíveis**:
        -   `200 OK`: Retorna um objeto com as estatísticas: `{ "sum": number, "avg": number, "max": number, "min": number, "count": number }`.
-   **`GET /transactions/health`**: Endpoint de verificação de saúde da aplicação.
    -   **Respostas Possíveis**:
        -   `200 OK`: Retorna `{ "status": "ok", "timestamp": "ISO_DATE_STRING" }`.

## 4. Estrutura do Projeto

O projeto adota uma estrutura modular e organizada, inspirada na Clean Architecture, para facilitar a manutenção, testabilidade e escalabilidade:

-   `src/`
    -   `application/`: Contém a lógica de negócios da aplicação.
        -   `use-cases/`: Casos de uso específicos (e.g., criar transação, obter estatísticas).
        -   `dtos/`: Data Transfer Objects para validação e estruturação de dados de entrada/saída.
    -   `domain/`: Camada central da arquitetura, contendo as regras de negócio mais puras.
        -   `entities/`: Entidades de domínio (e.g., Transação).
        -   `repositories/`: Interfaces dos repositórios, definindo contratos para acesso a dados.
    -   `infrastructure/`: Detalhes de implementação e frameworks.
        -   `controllers/`: Controladores HTTP (NestJS) que lidam com requisições e respostas.
        -   `repositories/`: Implementações concretas das interfaces de repositório (e.g., repositório em memória).
        -   `modules/`: Módulos NestJS que organizam a aplicação (e.g., `TransactionModule`).
        -   `config/`: Configurações da aplicação (e.g., logging, variáveis de ambiente).
        -   `logging/`: Configuração e middlewares de logging.
-   `test/`: Contém os testes E2E.

## 5. Como Executar

### 5.1. Pré-requisitos

-   Node.js (v18.x ou superior recomendado)
-   npm (Node Package Manager, geralmente incluído com Node.js)
-   Docker (opcional, para execução em container)

### 5.2. Variáveis de Ambiente

1.  Copie o arquivo de exemplo `.env.example` para um novo arquivo chamado `.env` na raiz do projeto:
    ```bash
    cp .env.example .env
    ```
2.  Modifique o arquivo `.env` conforme necessário. A porta padrão é `3000`.
    ```env
    PORT=3000
    # Adicione outras variáveis de ambiente aqui, se necessário
    ```

### 5.3. Instalação de Dependências

Navegue até o diretório raiz do projeto e instale as dependências:
```bash
npm install
```

### 5.4. Executando a Aplicação (Desenvolvimento)

Para iniciar a aplicação em modo de desenvolvimento com hot-reloading:
```bash
npm run start:dev
```
A aplicação estará disponível em `http://localhost:3000` (ou a porta configurada no `.env`).
A documentação do Swagger estará acessível em `http://localhost:3000/api-docs`.

### 5.5. Executando Testes

Para executar os diferentes tipos de testes:
```bash
# Executar todos os testes (unitários e de integração, conforme configuração do Jest)
npm run test

# Executar testes End-to-End (E2E)
npm run test:e2e

# Gerar relatório de cobertura de testes
npm run test:cov
```

### 5.6. Executando com Docker

#### Construindo a Imagem Docker
```bash
docker build -t nestjs-transactions-api .
```

#### Executando o Container
```bash
docker run -p 3000:3000 -d --name transactions-app --env-file .env nestjs-transactions-api
```
A aplicação estará acessível em `http://localhost:3000`.

#### Usando Docker Compose (Opcional)
Para facilitar o gerenciamento do container:
```bash
docker-compose up -d
```
Para parar e remover o container:
```bash
docker-compose down
```

## 6. Diferenciais e Monitoramento com Prometheus & Grafana

*   **CI/CD (Integração Contínua/Entrega Contínua):**
    *   Um pipeline de Integração Contínua está configurado usando **GitHub Actions**. Você pode conferir o workflow em `.github/workflows/ci.yml`. Ele automatiza a execução de testes e builds a cada novo commit ou pull request, garantindo a qualidade e estabilidade do código.

*   **Métricas e Monitoramento com Prometheus & Grafana:**
    *   A aplicação está configurada para expor métricas no formato Prometheus através de um endpoint `/metrics`. Isso permite um monitoramento detalhado da saúde e performance da API.
    *   **Como visualizar:**
        1.  Após iniciar os serviços com `docker-compose up -d`, o **Grafana** estará acessível em `http://localhost:3001`.
        2.  Faça login no Grafana utilizando as credenciais padrão:
            *   **Usuário:** `admin`
            *   **Senha:** `admin`
            *   (Será solicitado que você altere a senha no primeiro login).
        3.  **Importar o Dashboard:**
            *   No menu lateral esquerdo do Grafana, clique no ícone "+" (Create) e depois em "Import dashboard".
            *   Clique no botão "Upload JSON file" e selecione o arquivo `nestjs-app-dashboard.json` (que você exportou ou que está no diretório `grafana_config/dashboards_json/` do projeto, se você o versionou).
            *   Siga as instruções na tela, selecionando o datasource "Prometheus" (que deve ter sido provisionado automaticamente) quando solicitado.
            *   Alternativamente, se você configurou o provisionamento automático de dashboards (conforme discutido anteriormente, com `dashboard_providers.yaml`), o dashboard já deve aparecer listado, possivelmente dentro de uma pasta como "App Dashboards".
        4.  Com o dashboard importado/carregado, você poderá visualizar métricas como taxa de requisições, latência, contagem de transações ativas, e outras métricas padrão do Node.js.

*   **WebSockets para Estatísticas em Tempo Real (Próximo Passo):**
    *   Embora não implementado neste momento, uma evolução natural seria a utilização de WebSockets para enviar atualizações das estatísticas em tempo real para clientes conectados, em vez de depender apenas do polling no endpoint `GET /transactions/statistics`.

## 7. Decisões de Design e Boas Práticas

A construção desta API foi guiada por uma série de decisões e princípios que visam um software de alta qualidade:

*   **Clean Architecture**: Foi a base para a estrutura do projeto, buscando uma clara separação de responsabilidades, alta coesão, baixo acoplamento e, fundamentalmente, uma excelente testabilidade.
*   **SOLID**: Os cinco princípios SOLID foram bússolas durante o desenvolvimento, ajudando a criar um código mais manutenível, flexível e compreensível.
*   **DTOs e `ValidationPipe`**: Para garantir que os dados que entram na nossa API sejam sempre válidos e que os "contratos" entre as camadas sejam explícitos, usamos Data Transfer Objects e o sistema de validação do NestJS.
*   **Injeção de Dependência**: Aproveitamos ao máximo o poderoso sistema de Injeção de Dependência do NestJS para gerenciar as dependências entre os componentes e facilitar a escrita de testes isolados.
*   **Logging Estruturado**: Implementamos logs detalhados e consistentes com Winston, o que é crucial para entender o comportamento da aplicação, monitorar e depurar problemas rapidamente.
*   **Testes Abrangentes**: Acreditamos que testar é essencial! O projeto conta com testes unitários para a lógica de negócio e os casos de uso, além de testes E2E (ponta-a-ponta) para garantir que os endpoints da API se comportem como esperado.
*   **Dockerização**: Pensando em portabilidade e consistência entre diferentes ambientes (desenvolvimento, teste, produção), a aplicação é totalmente containerizável.
*   **Documentação com Swagger**: Para que qualquer pessoa possa entender e interagir com a API facilmente, geramos uma documentação interativa com Swagger (OpenAPI).
*   **Segurança Consciente**: Adotamos medidas básicas como o uso de `helmet` para proteger contra vulnerabilidades web comuns e validação rigorosa de entrada com `class-validator`.
*   **Controle de Tráfego (Rate Limiting)**: Para proteger a API contra uso excessivo ou abusivo, implementamos um limite de taxa de requisições.
