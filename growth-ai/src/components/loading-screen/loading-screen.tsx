import BrandLogo from "../logo/brand-logo"

export default function LoadingView() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-8">
        <div className="relative">
          <div className="w-20 h-20">
            <BrandLogo size="large" />
          </div>
          <div className="absolute -inset-4">
            <div className="w-28 h-28 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-purple-600 border-l-transparent animate-spin"></div>
          </div>
        </div>

        <div className="space-y-3 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Loading</h1>
          <p className="text-gray-500">Please wait while we prepare your experience</p>
        </div>

        <div className="flex justify-center items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "450ms" }}></div>
        </div>
      </div>
    </div>
  )
}

