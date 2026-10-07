# Mercato frontend

React + Vite + TypeScript + Tailwind + React Router + Axios, built for the existing Spring Boot microservices backend.
All traffic goes through the API Gateway at `http://localhost:8080` (override with `VITE_API_BASE_URL`).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## CORS
- **Dev:** `.env.development` sets the base URL to `/api`, which Vite proxies to the gateway on `http://localhost:8080` (no CORS needed).
- **Production build:** the browser calls the gateway directly, so the gateway must allow your frontend origin. Spring Cloud Gateway example:
  `spring.cloud.gateway.globalcors.cors-configurations.'[/**]'.allowedOrigins=https://your-site` plus `allowedMethods=*`, `allowedHeaders=*`.
  Make sure CORS is configured in only one place (gateway OR services) to avoid duplicate headers.

## Backend limitations found (not worked around)

1. **No numeric `userId` guarantee.** `POST /orders/createOrder` and `GET /orders/my-order/{user_id}` need a numeric `userId`.
   The app reads it from a JWT claim (`userId`, `user_id`, `uid` or `id`). If absent, checkout and orders show a clear notice and are disabled.
   Fix on the backend: add a `userId` claim to the JWT, or expose a `/me` endpoint.
2. **One product per order.** `createOrder` takes a single `productId`, so a multi-item cart checks out one line at a time.
3. **Role in JWT.** The role is read from `role` / `roles` / `authorities`. If missing, the UI treats the user as CUSTOMER (the server still enforces real permissions).
4. **`POST /auth/reset-password` takes no OTP/token.** Unless the backend remembers a verified OTP, anyone who knows an email could call it. Worth checking server-side.
5. **Order response DTO is unspecified.** `src/utils/order.ts` reads common field names (`id/orderId`, `status`, `quantity`, `totalPrice/amount/price`, `productId`, `deliveryAddressDTO`) and lists any other scalar fields generically. Adjust that one file once the DTO is confirmed.
6. **Seller/Admin "Orders"** shows orders placed *by that account*; there is no endpoint to list all orders or a seller's incoming orders.
7. **Payment amount** from `make-payment` is passed to Razorpay as-is (Razorpay expects paise).
8. **`/payments/verify` response shape** is unspecified: any 2xx is success unless the body says `verified:false`, `success:false` or `status:"FAILED"`.

## Deliberately not implemented
Internal endpoints (`reserveStock`, `releaseStock`, `createShipment`, `orderStatusConfirm`, `/payments/webhook`, `/payments/create`), `createAdmin`, `deleteOrder`, delivery tracking, profile editing.

## Structure
`src/api` (gateway client + modules) · `src/context` (Auth, Cart, Toast) · `src/hooks` (`useAsync`, `usePayment`) · `src/routes` (guards) · `src/components` · `src/pages` · `src/utils` (JWT decoding, order field readers).
