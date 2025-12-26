import Link from "next/link"
import SignInForm from "@/components/auth/sign-in-form"
import BrandLogo from "@/components/logo/brand-logo"

export default function JwtSignInView() {
    return (
      <div className="flex min-h-screen bg-[#0F0A19]">
        <div className="hidden lg:block relative w-1/2 bg-gradient-to-br from-purple-light to-purple-primary">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
            <div className="w-20 h-20 mb-8">
              <BrandLogo size="large" />
            </div>
            <h1 className="text-4xl font-bold mb-6 text-center">Welcome to Growth</h1>
            <p className="text-xl max-w-md text-center text-purple-100">
              Measure, manage, and maximize your brand's influence with our powerful analytics platform.
            </p>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center mb-8 lg:hidden">
              <BrandLogo />
              <h1 className="text-2xl font-bold ml-2 text-white">Growth</h1>
            </div>
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-2 text-white">Sign In</h2>
              <p className="text-white/60">Enter your credentials to access your account</p>
            </div>
            <SignInForm />
            <div className="mt-8 text-center">
              <p className="text-white/60">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-purple-light hover:text-white font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
}