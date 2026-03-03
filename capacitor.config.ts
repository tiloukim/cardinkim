import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cardinkim.app",
  appName: "CardinKim",
  webDir: "out",
  server: {
    url: "https://www.cardinkim.com",
    cleartext: false,
    allowNavigation: ["cardinkim.com", "*.cardinkim.com"],
  },
};

export default config;
