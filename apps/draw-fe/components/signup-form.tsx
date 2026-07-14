"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useMutation } from "@tanstack/react-query";
import { userSignUpApi } from "@/api/room.api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { safeSignUpSchema, safeSignUpSchemaType } from "@repo/common/types";

export interface ErrorMessage{
  message: string
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  
  
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<safeSignUpSchemaType>({
    resolver: zodResolver(safeSignUpSchema)
  })

  const signUpMutation = useMutation({
    mutationFn: (data: safeSignUpSchemaType) => userSignUpApi(data.username, data.email, data.password),
    onMutate: () => {
      const id = toast.loading("Signing up...");
      return { id };
    },
    onSuccess: (data, variables, context) => {
      const message = data.message || 'Successfully signed up';
      toast.dismiss(context.id)
      toast.success(message)
      console.log(data)
      router.push("/signin")
    },
    onError: (error: AxiosError<ErrorMessage>, variables, context) => {
      const message = error.response?.data.message || "Sign Up Failed !"
      toast.dismiss(context!.id)
      toast.error(message)
      console.log("signup failed: ", message)
    }
  })

  function signupMutationHandler(data: safeSignUpSchemaType){
    signUpMutation.mutate(data)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(signupMutationHandler)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Username</FieldLabel>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="John Doe" 
                  {...register('username')}
                  // value={username}
                  // onChange={(e) => setUsername(e.target.value)}
                  required 
                />
                { errors.username && <FieldError errors={[errors.username]} /> }
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register('email')}
                  // value={email}
                  // onChange={(e) => setEmail(e.target.value)}
                  required
                />
                { errors.email && <FieldError errors={[errors.email]} /> }
              </Field>
              <Field>
                <Field className="w-full">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input 
                    id="password" 
                    type="password" 
                    {...register('password')}
                    // value={password}
                    // onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                    { errors.password && <FieldError errors={[errors.password]} /> }
                  </Field>
                  {/* <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input id="confirm-password" type="password" required />
                  </Field> */}
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit">Create Account</Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link href="/signin">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
