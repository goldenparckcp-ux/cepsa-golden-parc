import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cepsa.goldenpark',
  appName: 'Cepsa Golden Park',
  webDir: 'public',
  server: {
    url: 'https://www.goldenparkstation.com',
    cleartext: true
  }
};

export default config;
