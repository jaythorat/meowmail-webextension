import { defineConfig } from 'wxt';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'MeowMail — Disposable Email',
    description: 'Generate temporary email addresses instantly. No signup, no tracking.',
    permissions: ['activeTab', 'storage', 'contextMenus', 'clipboardWrite'],
    host_permissions: ['https://meowmail.in/*'],
    icons: {
      16: '/icons/icon-16.png',
      32: '/icons/icon-32.png',
      48: '/icons/icon-48.png',
      128: '/icons/icon-128.png',
    },
  },
  vite: () => ({
    plugins: [preact(), tailwindcss()],
  }),
});
