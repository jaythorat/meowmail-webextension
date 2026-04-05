import { defineConfig } from 'wxt';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  srcDir: 'src',
  manifest: ({ browser }) => {
    // MV3 uses _execute_action, MV2 (Firefox) uses _execute_browser_action
    const popupCommand = browser === 'firefox' ? '_execute_browser_action' : '_execute_action';

    return {
      name: 'MeowMail — Disposable Email',
      description: 'Generate temporary email addresses instantly. No signup, no tracking.',
      permissions: ['activeTab', 'storage', 'contextMenus', 'clipboardWrite'],
      host_permissions: ['https://meowmail.in/*', 'https://api.meowmail.in/*'],
      icons: {
        16: '/icons/icon-16.png',
        32: '/icons/icon-32.png',
        48: '/icons/icon-48.png',
        128: '/icons/icon-128.png',
      },
      commands: {
        [popupCommand]: {
          suggested_key: {
            default: 'Alt+M',
            mac: 'Alt+M',
          },
          description: 'Open MeowMail popup',
        },
        'copy-address': {
          suggested_key: {
            default: 'Ctrl+Shift+C',
            mac: 'Command+Shift+C',
          },
          description: 'Copy current MeowMail address to clipboard',
        },
      },
    };
  },
  vite: () => ({
    plugins: [preact(), tailwindcss()],
  }),
});
