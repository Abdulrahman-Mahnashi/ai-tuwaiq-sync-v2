import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, Languages, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isRTL = language === "ar";

  const translations = {
    ar: {
      title: "تسجيل الدخول",
      subtitle: "مرحباً بك في طويق بروجيكت سنك",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      loginButton: "تسجيل الدخول",
      noAccount: "ليس لديك حساب؟",
      signup: "سجّل الآن",
      forgotPassword: "نسيت كلمة المرور؟",
      loading: "جاري تسجيل الدخول...",
      success: "تم تسجيل الدخول بنجاح!",
      error: "خطأ في تسجيل الدخول",
      errorMessage: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    },
    en: {
      title: "Sign In",
      subtitle: "Welcome to Tuwaiq Project Sync",
      email: "Email",
      password: "Password",
      loginButton: "Sign In",
      noAccount: "Don't have an account?",
      signup: "Sign Up",
      forgotPassword: "Forgot Password?",
      loading: "Signing in...",
      success: "Signed in successfully!",
      error: "Sign in failed",
      errorMessage: "Invalid email or password",
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: t.success,
          description: language === "ar" ? "تم تسجيل الدخول بنجاح" : "Welcome back!",
        });
        navigate("/");
      } else {
        toast({
          title: t.error,
          description: t.errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t.error,
        description: t.errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-[#0a1f1a] via-[#0d2b24] to-[#0a1f1a]"
    >
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="https://i.ibb.co/3YdhZYz8/Smart-Code-Seamless-Solutions-1.png"
              alt="Tuwaiq Logo"
              className="h-16 w-16"
            />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#00d4aa] to-[#00ff88] bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Login Card */}
        <Card className="glass p-8 neon-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#00d4aa]" />
                {t.email}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={language === "ar" ? "example@tuwaiq.academy" : "example@tuwaiq.academy"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass border-[#00d4aa]/30 focus:border-[#00d4aa]"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#00d4aa]" />
                {t.password}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={language === "ar" ? "••••••••" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass border-[#00d4aa]/30 focus:border-[#00d4aa]"
                disabled={isLoading}
              />
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-[#00d4aa] hover:underline"
              >
                {t.forgotPassword}
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full neon-glow bg-gradient-to-r from-[#00d4aa] to-[#00ff88] hover:from-[#00ff88] hover:to-[#00d4aa] text-black font-bold"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  {t.loading}
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  {t.loginButton}
                </>
              )}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {t.noAccount}{" "}
                <Link
                  to="/signup"
                  className="text-[#00d4aa] hover:underline font-semibold"
                >
                  {t.signup}
                </Link>
              </p>
            </div>
          </form>
        </Card>

        {/* Language Toggle */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="text-muted-foreground hover:text-[#00d4aa]"
          >
            <Languages className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;

