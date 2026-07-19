import { prisma } from "@/lib/prisma";


export async function POST(request: Request) {
  
  const { username, content } = await request.json()

  try {
    const user = await prisma.user.findFirst({
      where: { username: username }
    })

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    // is user accepting the messages
    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting the messages",
        },
        { status: 403 },
      );
    }

    await prisma.message.create({
      data: {
        content: content,
        userId: user.id
      }
    })

    return Response.json(
        {
          success: true,
          message: "Message send successfully",
        },
        { status: 403 },
      );

  } catch (error) {
    console.log("Error adding messages: ", error);
    
    return Response.json(
        {
          success: false,
          message: "Internal server error",
        },
        { status: 500 },
      );
  }
}