# API Farmacia · PostgreSQL + MongoDB

Express 5, Prisma 7 (PostgreSQL) y Mongoose (MongoDB). Tarea U2, caso 12.

## Puesta en marcha

```bash
cp .env.example .env
docker compose up -d
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

El servidor arranca solo si MongoDB conecta. Documentación del modelo: `docs/Tarea_modelo_hibrido.md`.

## Pruebas

Importar `postman/TareaU2_Quiroz.postman_collection.json` en Postman y ejecutar Run collection. La colección se puede correr varias veces seguidas.
