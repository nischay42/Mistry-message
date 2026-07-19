import {z} from 'zod'

export const messageSchema = z.object({
  content: z
  .string()
  .min(10, {error: 'Content must be at leat of 10 characters'})
  .max(300, {error: 'Content must be no longer than 300 characters'})
})