import JwtSignInView from "@/sections/auth/JwtSignInView";
export const runtime = "edge";
export const metadata = {
    title: "Sign In - Brand Impact",
    description: "Sign in to your Brand Impact account",
}

export default function Page() {
  return (
    <JwtSignInView />
  );
}
