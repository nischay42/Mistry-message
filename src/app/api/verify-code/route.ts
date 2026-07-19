import { prisma } from "@/lib/prisma";
import { verifySchema } from "@/schemas/verifySchema";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from 'zod'


const UsernameQuerySchema = z.object({
  username: usernameValidation
})


export async function POST(request: Request) {
  try {
    const {username, code} = await request.json()

    const decodedUsername = decodeURIComponent(username)
    // validate with zod
    const result = UsernameQuerySchema.safeParse({ username: decodedUsername })

    if (!result.success) {
      const usernameErrors = result.error.issues.map((issue) => issue.message) || []
      return Response.json({
        success: false,
        message: usernameErrors.length > 0
        ? usernameErrors.join(', ')
        :  'Invalid paremeters username'
      },  { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: {username: result.data.username}
    })

    if (!user) {
      return Response.json(
      {
        success: false,
        message: 'User not found'
      },
      { status: 500 }
    )
    }
    // validate verify code with zod
    const decodedCode = decodeURIComponent(code)
    const validatedCode = verifySchema.safeParse({ code: decodedCode })
    const extractedCode = validatedCode.data?.code
    const isCodeValid = user.verifyCode === extractedCode
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

    if (isCodeValid && isCodeNotExpired) {
      await prisma.user.update({
        where: { username: result.data.username},
        data: { isVerified: true}
      })

      return Response.json(
      {
        success: true,
        message: 'Account Verified successfully'
      },
      { status: 200 }
    )
    } else if (!isCodeNotExpired) {
      return Response.json(
      {
        success: false,
        message: 'Verification code has expired, please signup again to get a new code'
      },
      { status: 400 }
    )
    } else {
      return Response.json(
      {
        success: false,
        message: 'Incorrect Verification code'
      },
      { status: 400 }
    )
    }


  } catch (error) {
    console.error("Error verifying user", error);
    return Response.json(
      {
        success: false,
        message: 'Error verifying user'
      },
      { status: 500 }
    )
  }
}