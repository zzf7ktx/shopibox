import { LoginForm } from "@/components/LoginForm";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import { Claim } from "@/types/claim";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await verifySession();

  if (session.isAuth) {
    redirect("/main");
  }

  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <LoginForm />
      </div>
    </div>
  );
}
