import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="relative flex items-center justify-center p-4 pt-24 pb-16 min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900 via-amber-800 to-lime-800" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-lime-400/20 rounded-full blur-xl" />
          <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-xl" />
        </div>

        <LoginForm />
      </main>

      <Footer />
    </div>
  )
}
