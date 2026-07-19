import { DefaultSelection } from '@prisma/client/runtime/client';
import 'next-auth'

declare module 'next-auth' {
  interface User {
    id?: string;
    isVerified?: boolean;
    isAcceptingmessages?: boolean;
    username?: string;
  }
  interface Session {
    user: {
      id?: string;
      isVerified?: boolean;
      isAcceptingmessages?: boolean;
      username?: string;
    } & DefaultSelection['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    isVerified?: boolean;
    isAcceptingmessages?: boolean;
    username?: string; 
  }
}