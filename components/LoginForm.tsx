"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useActionState } from "react";
import { login } from "@/actions";
import { CgSpinnerTwoAlt } from "react-icons/cg";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Login</CardTitle>
          <CardDescription>
            Enter your name below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <div className='flex flex-col gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  name='name'
                  type='text'
                  placeholder='name'
                  required
                />
                {state?.errors?.name && (
                  <p className='text-xs text-destructive'>
                    {state.errors.name}
                  </p>
                )}
              </div>
              <div className='grid gap-2'>
                <div className='flex items-center'>
                  <Label htmlFor='password'>Password</Label>
                </div>
                <Input id='password' name='password' type='password' required />
                {state?.errors?.password && (
                  <p className='text-xs text-destructive'>
                    {state.errors.password}
                  </p>
                )}
              </div>
              {state?.data && (
                <p className='text-xs text-destructive'>{state.data}</p>
              )}
              <Button type='submit' className='w-full'>
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {pending && (
        <div className='backdrop-filter backdrop-blur-sm z-50 h-screen w-screen fixed top-0 left-0 flex flex-col items-center justify-center'>
          <CgSpinnerTwoAlt className='animate-spin -ml-1 mr-3 h-10 w-10 text-primary' />
          <div>{`Verifying...`}</div>
        </div>
      )}
    </div>
  );
}
