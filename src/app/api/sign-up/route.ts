import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { signUpSchema } from "@/schemas/signUpSchema";

export async function POST(request: Request) {

   try {
    const { username, email, password } = await request.json()

    const validatedCredentials = signUpSchema.safeParse({ username, email, password })

    if (!validatedCredentials.success) {
      const errors = validatedCredentials.error.issues.map(issue => issue.message)
      return Response.json({
        success: false,
        message: errors.join(', ')
      }, { status: 400 })
    }

    const { 
      username: validatedUsername, 
      email: validatedEmail, 
      password: validatedPassword 
    } = validatedCredentials.data

    const existingUserVerifiedByUsername = await prisma.user.findFirst({ 
      where: {
        username: validatedUsername, isVerified: true
      }
    })

    if (existingUserVerifiedByUsername) {
      return Response.json({
        success: false,
        message: 'Username is already taken'
      }, {status: 400})
    }

    const existingUserByEmail = await prisma.user.findUnique({
      where: {
        email: validatedEmail
      }
    })

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
         return Response.json({
          success: false,
          message: "User already exist with this email"
      }, {status: 409})
      } else {
        const hashedPassword = await bcrypt.hash(validatedPassword, 10)
        await prisma.user.update({
          where: { email: validatedEmail },
          data: {
            password: hashedPassword,
            verifyCode: verifyCode,
            verifyCodeExpiry: new Date(Date.now() + 3600000),
          }
        })
      }
    } else {
      const hasedPassword = await bcrypt.hash(validatedPassword, 10)
      const expiryDate = new Date()
      expiryDate.setHours(expiryDate.getHours() +  1)

      await prisma.user.create({
        data: {
          username: validatedUsername,
          email: validatedEmail,
          password: hasedPassword,
          verifyCode,
          verifyCodeExpiry: expiryDate,
          isVerified: false,
          isAcceptingMessage: true
        }
      })
    }

    // send verification email
    const emailResponse = await sendVerificationEmail(
      validatedEmail,
      validatedUsername,
      verifyCode
    )

    if (!emailResponse.success) {
      return Response.json({
        success: false,
        message: emailResponse.message
      }, {status: 500})
    }

    return Response.json({
        success: true,
        message: 'User registered successfully. Please verify your email'
    }, {status: 201})

   } catch (error) {
    console.log('Error registering user', error);
    return Response.json(
      {
        success: false,
        message: 'Error registering user'
      },
      {
        status: 500
      }
    )
   }
}