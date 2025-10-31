import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.', // جذر المشروع الحالي
  build: {
    outDir: 'public', // مكان خروج الملفات بعد الـ build
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/js/index.js'), // مسار ملفك الأساسي
      },
    },
  },
});
