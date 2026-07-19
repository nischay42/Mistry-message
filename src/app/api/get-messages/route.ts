import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { User } from "next-auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 },
    );
  }

  const userId = user.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 401 },
      );
    }

    return Response.json(
        {
          success: true,
          message: user.messages,
        },
        { status: 200 },
      );

  } catch (error) {
    console.log("An unexpected error occured: ", error);

    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 500 },
    );
  }
}