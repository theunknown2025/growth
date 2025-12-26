import JwtSignUpView from "@/sections/auth/sign-up-view";

export const metadata = {
    title: "Sign Up - Brand Impact",
    description: "Create your Brand Impact account",
}

export default function Page() {
  return (
    <JwtSignUpView />
  );
}