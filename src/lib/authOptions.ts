import { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// POC only: in-memory users
export const users = [
  { id: '1', email: 'patient@example.com', password: 'demo123', role: 'patient' },
  { id: '2', email: 'doctor@example.com', password: 'demo123', role: 'doctor' },
];

export const authOptions: NextAuthOptions = {
  // POC: provide a default secret if env var is missing
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-do-not-use-in-prod',
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = users.find(
          u => u.email === credentials?.email && u.password === credentials?.password
        );
        if (user) {
          return { id: user.id, email: user.email, role: user.role } as any;
        }
        return null;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).role = token.role;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};
