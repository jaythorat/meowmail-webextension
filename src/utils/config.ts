const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL ?? 'https://meowmail.in',
  WS_URL: import.meta.env.VITE_WS_URL ?? 'wss://meowmail.in/socket',
  DEFAULT_DOMAIN: 'meowmail.in',
  MAX_HISTORY: 10,
  BADGE_COLOR: '#f5a623',
  LOCAL_PART_PATTERN: /^[a-z0-9][a-z0-9._-]{2,30}$/,
} as const;

export default CONFIG;
