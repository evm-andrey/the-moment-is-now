# the-moment-is-now

Небольшое веб-приложение (Vite + React + TypeScript) с деплоем через Docker + Nginx.

## Локальная разработка

Требования: Node.js + npm.

```sh
npm ci
npm run dev
```

## Технологии

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Деплой (Docker + Nginx)

Без TLS (профиль `prod`, порт 80):

```sh
docker compose --profile prod up -d --build
```

## Docker + Let's Encrypt (nginx)

First issuance (HTTP-01 via webroot):

```sh
cp .env.example .env
# edit .env (at least LETSENCRYPT_EMAIL)
sh ./scripts/init-letsencrypt.sh
```

After that, run the HTTPS stack:

```sh
docker compose --profile prod-ssl up -d --build web-ssl certbot-renew
```
