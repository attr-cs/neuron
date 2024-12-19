import path from "path";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

const manifestForPlugin = {
  registerType: "prompt",
  includeAssets: [
    "index.html",
    "android-launchericon-192-192.png",
    "android-launchericon-512-512.png",
    "favicon_dark.png",
    "favicon_light.png",
    "Square150x150Logo.scale-150.png"
  ],
  manifest: {
    name: "Neuron",
    short_name: "Neuron",
    description: "Neuron: Secure Social Media & Messaging Network",
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
    scope: "/",
    start_url: "/",
    orientation: "portrait",
    icons: [
      {
        src: "android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "android-launchericon-512-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "favicon_dark.png",
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/png",
        purpose: "any"
      }
    ]
  },
  devOptions: {
    enabled: true,
  },
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-cache",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  }
};

export default defineConfig({
  plugins: [react(), VitePWA({
      ...manifestForPlugin,
      manifestFilename: 'manifest.webmanifest', 
    })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"]
        }
      }
    }
  }
});
