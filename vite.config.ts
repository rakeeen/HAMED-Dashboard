import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';

const autoReloadPlugin = () => {
  return {
    name: 'auto-reload',
    buildStart() {
      const version = Date.now().toString();
      if (!fs.existsSync('public')) fs.mkdirSync('public', { recursive: true });
      fs.writeFileSync('public/version.json', JSON.stringify({ version }));
    },
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `<script>
          fetch('/HAMED-Dashboard/version.json?t=' + new Date().getTime())
            .then(res => res.json())
            .then(data => {
              var currentVer = data.version;
              var savedVer = localStorage.getItem("dashboard_version");
              if (savedVer && savedVer !== currentVer) {
                localStorage.setItem("dashboard_version", currentVer);
                location.reload();
              } else {
                localStorage.setItem("dashboard_version", currentVer);
              }
            }).catch(e => console.log('v-error'));
        </script></head>`
      );
    }
  };
};

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/HAMED-Dashboard/',
    plugins: [react(), tailwindcss(), autoReloadPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
