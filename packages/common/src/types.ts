import { flattenError, z } from "zod";

export const safeSignUpSchema = z.object({
    username: z.string()
        .min(3, "username should be atleast 3 characters")
        .max(25, "username must be under 25 characters")
        .toLowerCase(),
    email: z
        .email('Please provide a valid email address').toLowerCase(),
    password: z.string()
        .min(8, 'Password should be atleast 8 characters')
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    photo: z.string().optional()
})

export const safeSignInSchema = z.object({
    email: z.email('Please provide a valid email address').toLowerCase(),
    password: z.string()
        .min(8, 'Password should be atleast 8 characters')
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
})

export const roomSlugSchema = z.object({
    slug: z.string()
        .min(8, "slug should be atleast 8 characters")
        .max(30, "slug must be under 30 characters")
})

export const flatten_Error = flattenError;
export { z }
export type safeSignUpSchemaType = z.infer<typeof safeSignUpSchema>
export type SafeSignInSchemaType = z.infer<typeof safeSignInSchema>
export type RoomSlugSchemaType = z.infer<typeof roomSlugSchema>