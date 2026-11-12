# AI Shopping Assistant: integration notes

## What was added
- `src/api/chatApi.ts`: the only file that knows the chat contract (path, request body, response parsing).
- `src/context/ChatContext.tsx`: in-memory conversation state; remounts per account so logout / 401 wipes it.
- `src/components/chat/*`: ChatBubble, ChatText (safe markdown-lite), ChatProductCard, ChatInput, ChatWelcome.
- `src/pages/Chatbot/index.tsx`: the `/chat` page.
- Edited: `App.tsx` (provider + protected `/chat` route), `Navbar.tsx` (link shown only when logged in),
  `api/client.ts` (base URL now read from `VITE_API_BASE_URL`; added `triggerUnauthorized`), `types/index.ts`, `vite-env.d.ts`, `.env.example`.

## Backend contract
1. `POST {gateway}/chat/message` (path overridable with `VITE_CHAT_ENDPOINT`), body `{ "conversationId": "<uuid>", "message": "<text>" }`.
2. `Authorization: Bearer <JWT>` is sent on every request by the shared Axios client.
3. Response (ChatResponse DTO field names not provided): a plain string, or JSON with one of `response | reply | message | answer | content | text | output`.
   Optional structured products: `products | items | recommendations | results` = `[{ id, name, description?, price?, stock? }]`.
   If your DTO uses a different field name, add it to `TEXT_KEYS` in `src/api/chatApi.ts`.
4. The backend must bind each conversationId to the authenticated user and reject other users' ids. A UUID is not a credential.
5. The Gateway must allow the `Authorization` header via CORS in production.

## Conversation IDs
- `ChatContext` creates a UUID v4 per conversation and sends the same one with every message.
- New chat / Clear: new UUID and empty history. Login, logout or a 401 remounts the provider, so the next customer always gets a fresh id.
- The id lives only in memory (not in localStorage), so a page refresh starts a new conversation.

## Run locally
```
npm ci
npm run dev        # http://localhost:5173, /api is proxied to the gateway on :8080
npm run build
```

## Deploy on Vercel
Set `VITE_API_BASE_URL` to the public API Gateway URL (no trailing slash) for Production (and Preview). Optionally `VITE_CHAT_ENDPOINT`.
Add a `vercel.json` rewrite of all routes to `/index.html` if you do not already have one, so `/chat` works on refresh.
