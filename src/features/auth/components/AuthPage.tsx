import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { User as UserType } from "@/shared/types";
import { Zap, Mail, Lock, User, Phone, ArrowRight, ArrowLeft, Loader2, Eye, EyeOff, MapPin, Radio } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

import { authService } from "../services/authService";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      if (isLogin) {
        const user = await authService.login(trimmedEmail, trimmedPassword);
        setUser(user);
        toast({
          title: "Welcome back!",
          description: `Signed in as ${user.full_name}`,
        });
        navigate("/dashboard");
      } else {
        await authService.register({
          email: trimmedEmail,
          password: trimmedPassword,
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
        });

        toast({
          title: "Account created!",
          description: "Your account has been created. Please sign in with your credentials.",
        });
        setIsLogin(true);
      }
    } catch (err: any) {
      toast({
        title: isLogin ? "Sign in failed" : "Registration failed",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email.trim()) {
        throw new Error("Please enter your email address.");
      }

      toast({
        title: "Password Reset Requested",
        description: "If an account exists with this email, reset instructions have been dispatched.",
      });
      setForgotPassword(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Decorative Icons */}
      <div className="absolute top-10 left-10 opacity-10">
        <MapPin className="w-24 h-24 text-primary" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10">
        <Radio className="w-24 h-24 text-primary" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Back to Home Link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg bg-card/60 border border-border/50 backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Landing Page</span>
          </Link>
        </div>

        {/* Logo Section with smart-meter.png */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 p-2.5 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-primary/25 glow-primary">
            <img src="/smart-meter.png" alt="Smart Meter Beacon" className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(249,115,22,0.4)]" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight font-mono">
            METER<span className="text-primary font-extrabold">TRACK</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Smart Meter GPS & Custody Beacon</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-px w-12 bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Enterprise Console</span>
            <div className="h-px w-12 bg-border" />
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 rounded-3xl shadow-2xl border border-border/50 backdrop-blur-xl animate-fade-in">
          {forgotPassword ? (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-2">Reset Password</h2>
              <p className="text-sm text-muted-foreground mb-6">Enter your email to receive password reset instructions</p>
              
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="glass-input w-full pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground rounded-xl"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setForgotPassword(false)}
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Back to Sign In
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {isLogin ? "Sign in to access your dashboard" : "Register to start tracking your smart meters"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="glass-input w-full pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground rounded-xl"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="glass-input w-full pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground rounded-xl"
                      />
                    </div>
                  </>
                )}
                
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="glass-input w-full pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground rounded-xl"
                    required
                  />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="glass-input w-full pl-12 pr-12 py-3.5 text-sm text-foreground placeholder:text-muted-foreground rounded-xl"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border" />
                      <span className="text-xs text-muted-foreground">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span className="text-primary hover:underline">
                    {isLogin ? "Sign up" : "Sign in"}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>© 2026 MeterTrack. Enterprise GPS Tracking Solution</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
