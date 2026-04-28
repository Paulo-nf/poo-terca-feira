## 🎯 Tema do Projeto(Squad 19)

**Governo / Setor Público, Cidades Inteligentes e Inovação Tecnológica**

O projeto está inserido no contexto de **cidades inteligentes**, utilizando tecnologia para melhorar a comunicação entre cidadãos, organizadores de eventos e a administração pública.  
A proposta busca promover uma **gestão mais eficiente de espaços públicos**, incentivando o uso da **Arena Pernambuco** para diferentes tipos de eventos, como esportivos, culturais e corporativos.

---

## ⚠️ Problemática

A **Arena Pernambuco** é um importante equipamento público do estado de Pernambuco, porém atualmente apresenta **baixa ocupação e subutilização de sua infraestrutura**.  

Diversas reportagens e dados públicos indicam que o espaço possui potencial para sediar uma grande variedade de eventos, mas enfrenta dificuldades relacionadas à **divulgação, organização e descoberta dessas atividades pelo público**.

Essa situação impacta diretamente:

- 👥 **Cidadãos**, que muitas vezes não ficam sabendo dos eventos realizados no local  
- 🎤 **Organizadores de eventos**, que têm dificuldade em divulgar e alcançar o público  
- 🏛️ **Gestores públicos**, que precisam otimizar o uso da infraestrutura da Arena  

---

## ❗ Problema Central

Existe uma **dificuldade de comunicação e conexão** entre as pessoas interessadas em participar de eventos e os organizadores ou administradores da **Arena Pernambuco**.

Como consequência, ocorre:

- baixa divulgação das atividades realizadas  
- dificuldade para o público descobrir eventos  
- subutilização de um importante espaço público  

O projeto busca **resolver esse problema por meio de uma solução tecnológica**, facilitando a divulgação, descoberta e organização de eventos na Arena Pernambuco.

## 🧑‍💻 Equipe
* Marcello Augusto
* Matheus Conolly
* Luiz Felipe 
* Luiz Henrique 
* Pedro Armando  
* Paulo Nery

## Pré-requisitos

- Java 17+
- PostgreSQL rodando localmente (ou via Docker)

## Configuração do banco

Crie o banco antes de subir a aplicação:

```sql
CREATE DATABASE arenape;
```

## Variáveis de ambiente

| Variável            | Descrição                              | Padrão (dev)                                      |
|---------------------|----------------------------------------|---------------------------------------------------|
| `DB_URL`            | URL JDBC do PostgreSQL                 | `jdbc:postgresql://localhost:5432/arenape`        |
| `DB_USERNAME`       | Usuário do banco                       | `postgres`                                        |
| `DB_PASSWORD`       | Senha do banco                         | `postgres`                                        |
| `JWT_SECRET`        | Secret para assinar os tokens (≥32 chars) | `minha-chave-secreta-super-segura-minimo-256bits!!` |
| `JWT_EXPIRATION_MS` | Validade do token em ms                | `86400000` (24h)                                  |
| `ADMIN_EMAIL`       | E-mail do admin criado no seed         | `admin@arenape.com`                               |
| `ADMIN_PASSWORD`    | Senha do admin criado no seed          | `admin123`                                        |
| `CORS_ORIGINS`      | Origens permitidas (separadas por vírgula) | `http://localhost:3000`                        |

> ⚠️ Em produção, **sempre** defina `JWT_SECRET`, `ADMIN_PASSWORD` e credenciais do banco via variáveis de ambiente — nunca deixe os valores padrão.

## Como rodar

```bash
./mvnw spring-boot:run
```

A aplicação sobe em `http://localhost:8080`.

---

## Swagger

```
http://localhost:8080/swagger-ui/index.html
```

### Como autenticar no Swagger

1. Faça login em `POST /auth/login`
2. Copie o `token` do response
3. Clique em **Authorize** 🔒 no topo do Swagger
4. Digite `Bearer <seu token>` e confirme

---

## Rotas

### Auth — público

| Método | Rota             | Descrição                          |
|--------|------------------|------------------------------------|
| POST   | `/auth/register` | Cria usuário (role USER)           |
| POST   | `/auth/login`    | Retorna token JWT                  |

### Events — leitura pública

| Método | Rota            | Descrição               |
|--------|-----------------|-------------------------|
| GET    | `/events`       | Lista todos os eventos  |
| GET    | `/events/{id}`  | Busca evento por ID     |

### Events — requer ADMIN 🔒

| Método | Rota            | Descrição              |
|--------|-----------------|------------------------|
| POST   | `/events`       | Cria um novo evento    |
| PUT    | `/events/{id}`  | Edita evento e/ou status |
| DELETE | `/events/{id}`  | Remove um evento       |

#### Body — criar evento
```json
{
  "name": "Show de Rock",
  "location": "Recife, PE",
  "description": "Uma noite incrível",
  "imageUrl": "https://exemplo.com/imagem.jpg",
  "price": 50.00,
  "availableTickets": 200,
  "eventDate": "2026-12-31T21:00"
}
```

#### Body — editar evento (status é opcional)
```json
{
  "name": "Show de Rock",
  "location": "Recife, PE",
  "description": "Uma noite incrível",
  "imageUrl": "https://exemplo.com/imagem.jpg",
  "price": 50.00,
  "availableTickets": 200,
  "eventDate": "2026-12-31T21:00",
  "status": "CONFIRMED"
}
```

---

## Status de evento

| Status      | Descrição                              |
|-------------|----------------------------------------|
| `PENDING`   | Criado, aguardando confirmação         |
| `CONFIRMED` | Confirmado                             |
| `CANCELLED` | Cancelado — não pode mais ser editado  |

### Transições permitidas

| De          | Para        | Permitido |
|-------------|-------------|-----------|
| `PENDING`   | `CONFIRMED` | ✅        |
| `PENDING`   | `CANCELLED` | ✅        |
| `CONFIRMED` | `CANCELLED` | ✅        |
| `CONFIRMED` | `PENDING`   | ❌        |
| `CANCELLED` | qualquer    | ❌        |

---

## Regras de negócio

- Evento novo sempre inicia com status `PENDING`
- Não é possível editar ou alterar status de evento `CANCELLED`
- Não é possível excluir evento `CONFIRMED`
- Não é possível criar ou editar evento com data no passado
- Registro público sempre cria usuários com role `USER`
- Token JWT expira conforme `JWT_EXPIRATION_MS` (padrão: 24h)


# Entrega 1

## 🎨 Protótipo no Figma

Clique na imagem abaixo para visualizar o board do projeto no Figma.

[![Figma](https://img.shields.io/badge/Ver%20no%20Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/design/uUnYvqXewYGu32xTjMx6K4/Untitled?node-id=0-1&p=f&t=wJDdoVGdvRHGltFI-0)

## 🎥 Demonstração do Projeto

Clique na imagem abaixo para assistir à demonstração do sistema.

[![Demonstração do Projeto](https://img.youtube.com/vi/rY0nByWVCTE/0.jpg)](https://youtu.be/rY0nByWVCTE)

## 📄 Histórias de Usuário

Clique na imagem abaixo abaixo para visualizar.

[![Google Docs](https://img.shields.io/badge/Histórias%20de%20Usuário-Google%20Docs-blue?style=for-the-badge&logo=googledocs&logoColor=white)](https://docs.google.com/document/d/1pr9lrvJhAbzC1pVu2YAyu88P86T6NZQV/edit?usp=sharing)

# Entrega 2

## 📺  Screencast
👉 **[Demo](https://youtu.be/HBw482dQmb0?si=TTZNCfSk2JqGlnu0)**

![Bug Tracker Interface](https://i.ibb.co/MkmJT5Gh/print-bug-tracker.png)

# Entrega 3
## 📺  Screencast
👉 **[Demo](https://youtu.be/NRYEwl3QbmU)**
![Bug Tracker Interface](https://i.ibb.co/vx4HFTZy/Screenshot-20260427-231423.png)


