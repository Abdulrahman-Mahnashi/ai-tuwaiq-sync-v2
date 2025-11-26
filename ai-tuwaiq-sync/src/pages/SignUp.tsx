import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, Languages, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isRTL = language === "ar";

  const translations = {
    ar: {
      title: "إنشاء حساب جديد",
      subtitle: "انضم إلى مجتمع طويق بروجيكت سنك",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      signupButton: "إنشاء الحساب",
      haveAccount: "لديك حساب بالفعل؟",
      login: "تسجيل الدخول",
      loading: "جاري إنشاء الحساب...",
      success: "تم إنشاء الحساب بنجاح!",
      error: "خطأ في إنشاء الحساب",
      errorMessage: "حدث خطأ أثناء إنشاء الحساب",
      passwordMismatch: "كلمات المرور غير متطابقة",
      passwordTooShort: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    },
    en: {
      title: "Create Account",
      subtitle: "Join the Tuwaiq Project Sync community",
      name: "Full Name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      signupButton: "Create Account",
      haveAccount: "Already have an account?",
      login: "Sign In",
      loading: "Creating account...",
      success: "Account created successfully!",
      error: "Account creation failed",
      errorMessage: "An error occurred while creating the account",
      passwordMismatch: "Passwords do not match",
      passwordTooShort: "Password must be at least 6 characters",
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: t.error,
        description: t.passwordMismatch,
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t.error,
        description: t.passwordTooShort,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(email, password, name);
      if (success) {
        toast({
          title: t.success,
          description: language === "ar" ? "مرحباً بك في طويق بروجيكت سنك!" : "Welcome to Tuwaiq Project Sync!",
        });
        navigate("/");
      } else {
        toast({
          title: t.error,
          description: language === "ar" ? "البريد الإلكتروني مستخدم بالفعل" : "Email already exists",
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

        {/* Sign Up Card */}
        <Card className="glass p-8 neon-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#00d4aa]" />
                {t.name}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={language === "ar" ? "أحمد محمد" : "Ahmed Mohammed"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="glass border-[#00d4aa]/30 focus:border-[#00d4aa]"
                disabled={isLoading}
              />
            </div>

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
                minLength={6}
                className="glass border-[#00d4aa]/30 focus:border-[#00d4aa]"
                disabled={isLoading}
              />
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#00d4aa]" />
                {t.confirmPassword}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={language === "ar" ? "••••••••" : "••••••••"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="glass border-[#00d4aa]/30 focus:border-[#00d4aa]"
                disabled={isLoading}
              />
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
                  <UserPlus className="mr-2 h-5 w-5" />
                  {t.signupButton}
                </>
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {t.haveAccount}{" "}
                <Link
                  to="/login"
                  className="text-[#00d4aa] hover:underline font-semibold"
                >
                  {t.login}
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

export default SignUp;

