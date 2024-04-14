declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI?: string;
      PORT?: string;
      GEOCODING_API_KEY?: string;
    }
  }
}

export {};
