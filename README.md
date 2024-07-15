## Bibliotecas usadas nesse projeto:

- Typescript
- Fastify
- Fastify/Cors
- Prisma
- SQLite
- Zod
- [fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod)
- Dayjs
- nodemailer

### Rotas de Criação

#### POST

**`Create Trip - /trips`**

Padrão de corpo:

```json
{
  "destination": "string",
  "starts_at": "string",
  "ends_at": "string",
  "owner_name": "string",
  "owner_email": "string",
  "emails_to_invite": "string"
}
```

Padrão de resposta:

```json
{
  "tripId": "string"
}
```

##### Possíveis Erros 

- 400 - Invalid trip start date
- 400 - Invalid trip end date

**`Create Link - /trips/:tripId/links`**

Padrão de corpo:

```json
"body": {
  "title": "string",
  "url": "string",
},
"params": {
    "tripId": "string"
}
```

Padrão de resposta:

```json
{
  "linkId": "string"
}
```

##### Possíveis Erros 

- 400 - Trip not found

**`Create Invite - /trips/:tripId/invites`**

Padrão de corpo:

```json
"body": {
  "email": "string"
},
"params": {
    "tripId": "string"
}
```

Padrão de resposta:

```json
{
  "participantId": "string"
}
```

##### Possíveis Erros 

- 400 - Trip not found


**`Create Activity - /trips/:tripId/activities`**

Padrão de corpo:

```json
"body": {
  "title": "string",
  "occurs_at": "string (Convertido para data)" 
},
"params": {
    "tripId": "string"
}
```

Padrão de resposta:

```json
{
  "activityId": "string"
}
```

##### Possíveis Erros 

- 400 - Trip not found
- 400 - Invalid activity date

### Rotas de Leitura

#### GET

**`Get Activities - /trips/:tripId/activities`**

Padrão de corpo:

```json
"params": {
    "tripId": "string"
}
```

Padrão de resposta:

```json
return { "activities": "trip.activities" },

{
    "id": "string",
    "title": "string",
    "occurs_at": "Date",
    "trip_id": "string"
}
```

##### Possíveis Erros 

- 400 - Trip not found

**`Get Links - /trips/:tripId/links`**

Padrão de corpo:

```json
"params": {
    "tripId": "string"
}
```

Padrão de resposta:

```json
return { "links": "trip.links" },

{
    "id": "string",
    "title": "string",
    "url": "string",
    "trip_id": "string"
}
```

##### Possíveis Erros 

- 400 - Trip not found


**`Get One Participant - /participants/:participantId`**

Padrão de corpo:

```json
"params": {
    "participantId": "string"
}
```

Padrão de resposta:

```json
{
    "id": "string",
    "is_confirmed": "boolean",
    "name": "string | null",
    "email": "string"
}
```

##### Possíveis Erros 

- 400 - Participant not found


**`Get Participant - /trips/:tripId/participants`**

Padrão de corpo:

```json
"params": {
    "tripId": "string"
}
```

Padrão de resposta:

```json
return { "participants": "trip.participants" }

{
    "id": "string",
    "is_confirmed": "boolean",
    "name": "string | null",
    "email": "string"
}
```

##### Possíveis Erros 

- 400 - Trip not found


**`Get Trip - /trips/:tripId`**

Padrão de corpo:

```json
"params": {
    "tripId": "string"
}
```

Padrão de resposta:

```json
{
    "destination": "string",
    "starts_at": "Date",
    "ends_at": "Date",
    "id": "string",
    "is_confirmed": "boolean"
}
```

##### Possíveis Erros 

- 400 - Trip not found


**`Confirm Trip - /trips/:tripId/confirm`**

Padrão de corpo:

```json
"params": {
    "tripId": "string"
}
```

Padrão de resposta:

```json
"return reply.redirect(`${env.API_BASE_URL}/trips/${tripId}`)"
```

##### Possíveis Erros 

- 400 - Trip not found


**`Confirm Participant - /participants/:participantId/confirm`**

Padrão de corpo:

```json
"params": {
    "tripId": "string",
    "participantId": "string"
}
```

Padrão de resposta:

```json
"return reply.redirect(`${env.WEB_BASE_URL}/trips/${participant.trip_id}`)"
```

##### Possíveis Erros 

- 400 - Participant not found


### Rotas de Update

#### PUT

**`Update Trip - /trips/:tripId`**

Padrão de corpo:

```json
"body": {
  "destination": "string",
  "starts_at": "string (Convertido para data)",
  "ends_at": "string (Convertido para data)"  
},
"params": {
    "tripId": "string"
}
```

Padrão de resposta:

```json
{
  "tripId": "string"
}
```

##### Possíveis Erros 

- 400 - Trip not found
- 400 - Invalid trip start date
- 400 - Invalid trip end date



### Dica:

Mailtrap.io - Caso no futuro eu queira testar o envio de emails em uma aplicação de forma gratuita
