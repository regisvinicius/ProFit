# Backend: possíveis melhorias (arquitetura e estrutura)

Documento de referência. Nada é obrigatório; priorize conforme o roadmap.

---

## 1. Nomenclatura: dois “schemas”

- **`src/schemas/`** — Zod: validação de API (body/response), tipos e OpenAPI.
- **`src/db/schemas/`** — Drizzle: definição das tabelas (um arquivo por tabela).

Manter os dois nomes está ok; o importante é deixar explícito na doc (SUMMARY, onboarding) para evitar confusão.

---

## 2. Tratamento de erros centralizado ✅ (implementado)

- **`src/lib/errors.ts`**: `AppError(statusCode, message, code?)`, `ERRORS` (constantes), `createErrorHandler()`.
- **`app.setErrorHandler(createErrorHandler())`** no bootstrap: `AppError` → status + `{ error, code? }`; erros 4xx do Fastify (ex.: validação) repassados; demais → 500.
- Serviços/rotas lançam `AppError`; rotas sem try/catch.

---

## 3. Constantes para mensagens de erro ✅ (implementado)

Objeto **`ERRORS`** em `src/lib/errors.ts` (EMAIL_ALREADY_REGISTERED, INVALID_EMAIL_OR_PASSWORD, REFRESH_TOKEN_REQUIRED, etc.). Serviços usam `throw new AppError(409, ERRORS.EMAIL_ALREADY_REGISTERED)`.

---

## 4. Prefixo de versão da API (ex.: `/v1`) ✅ (implementado)

Rotas registradas com prefixo: **`/v1/health`** (liveness, readiness), **`/v1/auth`** (register, login, refresh, logout, me).

---

## 5. Testes de rotas/serviços

Além dos testes de domínio e de config, vale ter alguns testes de integração ou de serviço para auth (ex.: register → login, refresh, logout). Podem usar DB em memória ou `drizzle.mock()`.

---

## 6. TypeScript mais restrito (opcional)

No `tsconfig.json` já há `strict: true`. Se quiser ir além:

- `noUncheckedIndexedAccess: true` — acessos a índices (ex.: `arr[0]`) ficam `T | undefined`.
- Útil em código que manipula arrays/objetos dinâmicos; pode exigir pequenos ajustes.

---

## 7. Drizzle relations

Não há `relations()` definidas; o uso de `db.query.users` etc. já funciona. Quando precisar de joins com relações tipadas (ex.: sale com product e channel), dá para adicionar `relations()` nos arquivos em `db/schemas/` e manter um arquivo por tabela.

---

## 8. Estrutura de pastas ao crescer

- **Rotas**: hoje flat (`auth.ts`, `health.ts`). Se crescer, pode agrupar por domínio (ex.: `routes/auth/index.ts`, `routes/products/index.ts`) ou por versão (`routes/v1/`).
- **Schemas Zod**: centralizados em `src/schemas/` está bom; outra opção é colocar schemas por recurso (ex.: `routes/auth/schemas.ts`) se preferir colocation.

---

## 9. Documentação da estrutura atual

- Atualizar **SUMMARY.md** com a estrutura `db/schemas/` (um arquivo por tabela + `index.ts` com `schemaForDb` e `DatabaseSchema`).
- Mencionar na doc a diferença entre `src/schemas/` (Zod) e `src/db/schemas/` (Drizzle).

---

## Prioridade sugerida

| Prioridade | Item | Esforço |
|------------|------|--------|
| Alta      | Doc da estrutura (SUMMARY + dois “schemas”) | Baixo |
| Média     | Erro centralizado + constantes de erro      | Médio |
| Média     | Prefixo `/v1`                               | Baixo |
| Quando for evoluir | Testes de auth (integração/serviço) | Médio |
| Opcional  | `noUncheckedIndexedAccess`, relations       | Conforme necessidade |
