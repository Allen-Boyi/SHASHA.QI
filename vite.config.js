import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // This automatically injects 'import React from "react"' into all files when building
    jsxInject: `import React from 'react'`
  }
});