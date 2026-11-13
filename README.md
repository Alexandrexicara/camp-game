# Animal Camp

Jogo de plataforma 2D em pixel art, desenvolvido com Next.js, React e Phaser 3.

## Requisitos

- Node.js 22 (mínimo compatível: 20.9)
- pnpm 10.33.4

## Instalação local

```bash
corepack enable
corepack prepare pnpm@10.33.4 --activate
pnpm install
pnpm dev
```

Abra http://localhost:13000.

## Verificações e build

```bash
pnpm run typecheck
pnpm run build
pnpm start
```

## Publicação na Netlify

1. Importe `Alexandrexicara/camp-game` na Netlify.
2. Use Node.js 22 e pnpm 10.33.4.
3. O arquivo `netlify.toml` já define o comando `pnpm run build` e o adaptador oficial Next.js.
4. Configure `DATABASE_URL` somente quando o banco PostgreSQL for ativado. O jogo não exige banco para iniciar.
5. Publique o site. Cada push na branch `main` poderá disparar uma nova publicação quando a integração Git estiver ativa.

## Banco de dados (opcional)

O projeto já inclui Drizzle ORM e o driver PostgreSQL. Configure `DATABASE_URL` com uma URL PostgreSQL antes de executar os comandos `db:*`. Não coloque credenciais reais no GitHub; use as variáveis de ambiente da hospedagem.

## Tecnologias

- Next.js 16 e React 19
- Phaser 3.90
- TypeScript
- Tailwind CSS 4
- Zustand
- Drizzle ORM e PostgreSQL (opcional)
