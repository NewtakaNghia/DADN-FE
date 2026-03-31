import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Recycle, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Lỗi", description: "Mật khẩu phải có ít nhất 6 ký tự", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.register({ fullName: fullName.trim(), email: email.trim(), password });
      toast({ title: "Thành công", description: "Đăng ký thành công! Vui lòng đăng nhập." });
      navigate("/login");
    } catch (err: any) {
      toast({ title: "Đăng ký thất bại", description: err.message, variant: "destructive" });
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
            Tham gia hệ thống phân loại rác thông minh. Bảo vệ môi trường cùng công nghệ AI tiên tiến.
          </p>
          <div className="flex gap-8 pt-4">
            {["Miễn phí", "Dễ sử dụng", "An toàn"].map((t) => (
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
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardHeader className="text-center space-y-2 pb-8">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                <Recycle className="w-7 h-7 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
            <CardDescription>Điền thông tin để đăng ký tài khoản mới</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
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
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <UserPlus className="w-4 h-4" />
                    Đăng ký
                  </span>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
