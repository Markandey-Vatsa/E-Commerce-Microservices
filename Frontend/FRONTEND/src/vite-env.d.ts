/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** Gateway path of the chat endpoint (relative to the API base URL). Defaults to /chat/message. */
  readonly VITE_CHAT_ENDPOINT?: string;
}
