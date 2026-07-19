import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma"


export const authOptions:  NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
    },
    async authorize(credentials: any): Promise<any> {
     try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            {email: credentials.identifier},
            {username: credentials.identifier}
        ]}
      })
      if (!user) {
        throw new Error('No user found with this email')
      }
      if (!user.isVerified) {
        throw new Error('Please verify your account before login')
      }
      const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
      if (isPasswordCorrect) {
        return user
      } else {
        throw new Error('Incorrect Password')
      }
     } catch (error: any) {
      throw new Error(error)
     }
    }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingmessages;
        token.username = user.username;
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.isVerified = token.isVerified
        session.user.isAcceptingMessages = token.isAcceptingmessages
        session.user.username = token.username
      }
      return session
    }
  },
  pages: {
    signIn: '/sign-in'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
}