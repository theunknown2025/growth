import Link from "next/link";
import SignUpForm from "@/components/auth/sign-up-form";
import BrandLogo from "@/components/logo/brand-logo";

export default function JwtSignUpView() {
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
                        Join us and amplify your brand's impact with our powerful tools.
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
                        <h2 className="text-3xl font-bold mb-2 text-white">Sign Up</h2>
                        <p className="text-white/60">Enter your details to create an account</p>
                    </div>
                    <SignUpForm />
                    <div className="mt-8 text-center">
                        <p className="text-white/60">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="text-purple-light hover:text-white font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}