import { AuthPage } from "pages/auth/AuthPage";
import { Head } from "providers/HeadProvider/Head";

export function SignUpPage() {
  return (
    <>
      <Head title={"Create an Account"} />
      <AuthPage isLoginPage={false} />
    </>
  );
}
