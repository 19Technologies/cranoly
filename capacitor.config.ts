import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cranoly.app",
  appName: "Cranoly",
  webDir: "out",
  android: {
    backgroundColor: "#1b1b1e",
  },
  plugins: {
    SystemBars: {
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
    },
  },
};

export default config;
