import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
// import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve(__dirname, './src')
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/renderer/index.html'),
          anotate: resolve(__dirname, 'src/renderer/src/windows/anotatePanel/index.html'),
          background: resolve(
            __dirname,
            'src/renderer/src/windows/anotateBackground/index.html'
          )
        }
      }
    },
    plugins: [
      react(),
      tailwindcss()
      // this was done for using canvas.js a static file
      // viteStaticCopy({
      //   targets: [
      //     {
      //       src: resolve(__dirname, 'src/renderer/canvas.js'),
      //       dest: '.' // Copies canvas.js to out/renderer/
      //     }
      //   ]
      // })
    ]
  }
})
