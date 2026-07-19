import { prisma } from "@/lib/prisma";
import { z } from 'zod'
import { usernameValidation } from "@/schemas/signUpSchema";


const UsernameQuerySchema = z.object({
  username: usernameValidation
})

export async function GET(request: Request) {

  try {
    const { searchParams } = new URL(request.url)
    const queryParam = {
      username: searchParams.get('username')
    }
    // validate with zod
    const result = UsernameQuerySchema.safeParse(queryParam)
    console.log(result); // TODO: test result

    if (!result.success) {
      const usernameErrors = result.error.issues.map((issue) => issue.message) || []
      return Response.json({
        success: false,
        message: usernameErrors.length > 0
        ? usernameErrors.join(', ')
        :  'Invalid query paremeters'
      },  { status: 400 })
    }

    const {username} = result.data
    
    const existingVerifiedUser = await prisma.user.findFirst({
      where: {
        username,
        isVerified: true
      }
    });

    if (existingVerifiedUser) {
      return Response.json({
        success: false,
        message: 'Username is already taken'
      },  { status: 400 })
    }

    return Response.json({
        success: true,
        message: 'Username is available'
      },  { status: 200 })

  } catch (error) {
    console.error("Error checking username", error);
    return Response.json(
      {
        success: false,
        message: 'Error cecking username'
      },
      { status: 500 }
    )
  }
}