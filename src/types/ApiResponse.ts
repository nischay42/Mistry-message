import { MessageSchema } from "../../generated/prisma/client"

export interface ApiResponse {
  success: boolean;
  message: string;
  isAccesptingMessages?: boolean;
  messages?: Array<MessageSchema>
}
