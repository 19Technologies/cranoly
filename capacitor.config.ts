import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cranoly.app",
  appName: "Cranoly",
  webDir: "out",
  android: {
    backgroundColor: "#fbf7f0",
  },
  plugins: {
    SystemBars: {
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
    },
  },
};

export default config;
