export interface AppConfig {
  serverPort?: number;
  authorizationHeader?: string;
}

export class AppEnvironment {
  static get config(): AppConfig {
    return {
      serverPort: parseInt(process.env.BACKEND_SERVER_PORT || '') || 3000,
      authorizationHeader: process.env.AUTHORIZATION_HEADER || 'AUTHORIZATION_HEADER',
    }
  }
}
