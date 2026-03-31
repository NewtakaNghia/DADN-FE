import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Recycle, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await api.login({ email: email.trim(), password });
      const token = typeof res === "string" ? res : res.token;
      login(token, res.user);
      navigate("/");
    } catch (err: any) {
      toast({ title: "Đăng nhập thất bại", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-primary p-12">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-foreground/20 mb-4">
            <Recycle className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground tracking-tight">
            Smart Trash Bin
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Hệ thống phân loại rác thông minh sử dụng AI. Theo dõi và quản lý thùng rác từ xa một cách dễ dàng.
          </p>
          <div className="flex gap-8 pt-4">
            {["AI Phân loại", "Theo dõi 24/7", "Thống kê chi tiết"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-primary-foreground/90 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary-foreground/60" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <Card className="w-full max-w-md border-0 shadow-none lg:shadow-none">
          <CardHeader className="text-center space-y-2 pb-8">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                <Recycle className="w-7 h-7 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Đăng nhập</CardTitle>
            <CardDescription>Nhập thông tin để truy cập hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Đang xử lý...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Đăng nhập
                  </span>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Đăng ký ngay
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
