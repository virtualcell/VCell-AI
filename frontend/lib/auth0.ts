import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client({
  signInReturnToPath: '/chat',
  logoutStrategy: 'v2',
  authorizationParameters: process.env.AUTH0_AUDIENCE
    ? {
        audience: process.env.AUTH0_AUDIENCE,
        scope: 'openid profile email',
      }
    : undefined,
});
