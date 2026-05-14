import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, HealthAdvice, TrashLog } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Recycle, LogOut, Wifi, WifiOff, Trash2, BarChart3, Clock, Filter, X, ChevronLeft, ChevronRight, HeartPulse } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";

// --- Constants ---

/** Labels considered recyclable */
const RECYCLE_LABELS = new Set(["recycle"]);

const LABEL_COLORS: Record<string, string> = {
  recycle:     "hsl(152, 56%, 40%)",
  "non-recycle": "hsl(0, 72%, 51%)",
};

const LABEL_NAMES: Record<string, string> = {
  recycle:       "Tái chế",
  "non-recycle": "Không tái chế",
};

/** Map every raw label from the API to its display group */
const toDisplayLabel = (rawLabel: string): string =>
  RECYCLE_LABELS.has(rawLabel) ? "recycle" : "non-recycle";

// --- Helpers ---

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
};

/** yyyy-MM-dd string for <input type="date"> */
const toDateInputValue = (d: Date) => d.toISOString().slice(0, 10);

// --- Component ---

const Index = () => {
  const { logout } = useAuth();
  const { toast } = useToast();

  const [logs, setLogs]       = useState<TrashLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TrashLog | null>(null);
  const [isOnline] = useState(true);
  const [healthAdvice, setHealthAdvice] = useState<HealthAdvice | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceLimit, setAdviceLimit] = useState<number>(logs.length || 200);


  // Date-range filter state
  const today = toDateInputValue(new Date());
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate,   setToDate]   = useState<string>(today);
  const [filterActive, setFilterActive] = useState(false);

  // Category tab: "all" | "recycle" | "non-recycle"
  const [activeTab, setActiveTab] = useState<"all" | "recycle" | "non-recycle">("all");

  // Pagination
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.getTrashLogs(200); // fetch more so client-side filter works
        setLogs(res.data);
      } catch (err: any) {
        toast({ title: "Lỗi tải dữ liệu", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // ---------- Filtering ----------
  const applyFilter = () => { setFilterActive(true); setCurrentPage(1); };
  const clearFilter = () => {
    setFromDate("");
    setToDate(today);
    setFilterActive(false);
    setActiveTab("all");
    setCurrentPage(1);
  };

  const filteredLogs = logs.filter((l) => {
    const logDate = new Date(l.thrownAt);

    // Date-range check
    if (filterActive) {
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (logDate < from) return false;
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (logDate > to) return false;
      }
    }

    // Category tab check
    if (activeTab !== "all" && toDisplayLabel(l.label) !== activeTab) return false;

    return true;
  });
  // ---------- Health Advice ----------
  const fetchHealthAdvice = async () => {
    setAdviceLoading(true);
    try {
      const res = await api.getHealthAdvie();
      setHealthAdvice(res.data);
    } catch (error) {
      toast({ title: "Lỗi khi lấy lời khuyên", description: error.message, variant: "destructive" });
    } finally {
      setAdviceLoading(false);
    }
  };

  useEffect(() => {
    setAdviceLimit(logs.length || 200);
  }, [logs.length]);
  // ---------- Stats ----------
  const todayStr    = new Date().toDateString();
  const todayLogs   = logs.filter((l) => new Date(l.thrownAt).toDateString() === todayStr);

  const labelCounts = filteredLogs.reduce<Record<string, number>>((acc, l) => {
    const dl = toDisplayLabel(l.label);
    acc[dl] = (acc[dl] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(labelCounts).map(([key, value]) => ({
    name:  LABEL_NAMES[key] || key,
    value,
    _key:  key,
  }));

  // ---------- Pagination ----------
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const pagedLogs  = filteredLogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goToPage = (p: number) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  const changeTab = (tab: "all" | "recycle" | "non-recycle") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-foreground/20">
              <Recycle className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight hidden sm:block">Smart Trash Bin</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6 max-w-6xl">
        {/* Status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${isOnline ? "bg-primary/10" : "bg-destructive/10"}`}>
                {isOnline
                  ? <Wifi className="w-6 h-6 text-primary" />
                  : <WifiOff className="w-6 h-6 text-destructive" />}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-primary animate-pulse" : "bg-destructive"}`} />
                  {isOnline ? "Đang hoạt động" : "Mất kết nối"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                <Trash2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hôm nay</p>
                <p className="text-lg font-semibold">{todayLogs.length} lần vứt rác</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang hiển thị</p>
                <p className="text-lg font-semibold">{filteredLogs.length} / {logs.length} lần</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Filter bar ── */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              {/* From date */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Từ ngày</Label>
                <Input
                  type="date"
                  value={fromDate}
                  max={toDate || today}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-40 h-9 text-sm"
                />
              </div>

              {/* To date */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Đến ngày</Label>
                <Input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  max={today}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-40 h-9 text-sm"
                />
              </div>

              {/* Category tabs */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Loại rác</Label>
                <div className="flex rounded-lg border overflow-hidden h-9">
                  {(["all", "recycle", "non-recycle"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => changeTab(tab)}
                      className={`px-3 text-xs font-medium transition-colors border-r last:border-r-0
                        ${activeTab === tab
                          ? "bg-primary text-primary-foreground"
                          : "bg-background hover:bg-muted/60 text-muted-foreground"}`}
                    >
                      {tab === "all"
                        ? "Tất cả"
                        : tab === "recycle"
                        ? "Tái chế"
                        : "Không tái chế"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pb-0.5">
                <Button size="sm" className="h-9 gap-1.5" onClick={applyFilter}>
                  <Filter className="w-3.5 h-3.5" />
                  Lọc
                </Button>
                {(filterActive || activeTab !== "all") && (
                  <Button size="sm" variant="outline" className="h-9 gap-1.5" onClick={clearFilter}>
                    <X className="w-3.5 h-3.5" />
                    Xoá lọc
                  </Button>
                )}
              </div>

              {/* Active filter badge */}
              {filterActive && fromDate && (
                <Badge variant="secondary" className="self-end mb-1 text-xs">
                  {fromDate} → {toDate || "nay"}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart + History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie chart */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Thống kê loại rác</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {pieData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={LABEL_COLORS[entry._key] || `hsl(${i * 90}, 50%, 50%)`}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">Chưa có dữ liệu</p>
                )}
              </CardContent>
            </Card>
            {/* Health Advice */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-primary" />
                  Lời khuyên sức khỏe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Số lần vứt để phân tích</Label>
                    <Input
                      type="number"
                      min={1}
                      value={adviceLimit}
                      onChange={(e) => setAdviceLimit(Number(e.target.value))}
                      className="w-full h-9 text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="h-9 gap-1.5"
                    onClick={fetchHealthAdvice}
                    disabled={adviceLoading}
                  >
                    {adviceLoading
                      ? <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      : <HeartPulse className="w-3.5 h-3.5" />}
                    Lấy lời khuyên
                  </Button>
                </div>

              {healthAdvice ? (
                <div className="space-y-3">
                  <Badge
                    variant="outline"
                    className="text-sm px-3 py-1"
                    style={{ borderColor: "hsl(152, 56%, 40%)", color: "hsl(152, 56%, 40%)" }}
                  >
                    Mức độ: {healthAdvice.level}
                  </Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">{healthAdvice.advice}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Bấm <span className="font-medium text-foreground">Lấy lời khuyên</span> để xem gợi ý sức khỏe.
                </p>
              )}
              </CardContent>
            </Card>
          </div>
          {/* History list */}
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Lịch sử vứt rác
                {filteredLogs.length !== logs.length && (
                  <Badge variant="secondary" className="ml-auto text-xs font-normal">
                    {filteredLogs.length} kết quả
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : filteredLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  {logs.length === 0 ? "Chưa có lịch sử" : "Không có bản ghi phù hợp bộ lọc"}
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {pagedLogs.map((log, i) => {
                      const displayLabel = toDisplayLabel(log.label);
                      return (
                        <button
                          key={i}
                          onClick={() => setSelected(log)}
                          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/60 transition-colors text-left group"
                        >
                          <img
                            src={log.imageUrl}
                            alt={displayLabel}
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                className="text-xs"
                                style={{
                                  backgroundColor: `${LABEL_COLORS[displayLabel] || "hsl(0,0%,50%)"}20`,
                                  color: LABEL_COLORS[displayLabel] || "hsl(0,0%,50%)",
                                  borderColor: LABEL_COLORS[displayLabel] || "hsl(0,0%,50%)",
                                }}
                                variant="outline"
                              >
                                {displayLabel === "recycle" ? "" : ""}
                                {LABEL_NAMES[displayLabel] || displayLabel}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {(log.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{formatTime(log.thrownAt)}</p>
                          </div>
                          <span className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors text-lg">›</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t mt-3">
                      <p className="text-xs text-muted-foreground">
                        Trang {safePage}/{totalPages} · {filteredLogs.length}
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline" size="icon"
                          className="w-8 h-8"
                          disabled={safePage === 1}
                          onClick={() => goToPage(safePage - 1)}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>

                        {/* Page number buttons — show up to 5 pages around current */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                          .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                            acc.push(p);
                            return acc;
                          }, [])
                          .map((item, idx) =>
                            item === "…" ? (
                              <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground">…</span>
                            ) : (
                              <Button
                                key={item}
                                variant={item === safePage ? "default" : "outline"}
                                size="icon"
                                className="w-8 h-8 text-xs"
                                onClick={() => goToPage(item as number)}
                              >
                                {item}
                              </Button>
                            )
                          )}

                        <Button
                          variant="outline" size="icon"
                          className="w-8 h-8"
                          disabled={safePage === totalPages}
                          onClick={() => goToPage(safePage + 1)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Chi tiết phân loại</DialogTitle>
          </DialogHeader>
          {selected && (() => {
            const displayLabel = toDisplayLabel(selected.label);
            return (
              <div className="space-y-4">
                <img
                  src={selected.imageUrl}
                  alt={displayLabel}
                  className="w-full rounded-xl object-cover max-h-64"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Phân loại</p>
                    <Badge
                      variant="outline"
                      className="text-sm"
                      style={{
                        backgroundColor: `${LABEL_COLORS[displayLabel] || "hsl(0,0%,50%)"}20`,
                        color: LABEL_COLORS[displayLabel] || "hsl(0,0%,50%)",
                        borderColor: LABEL_COLORS[displayLabel] || "hsl(0,0%,50%)",
                      }}
                    >
                      {displayLabel === "recycle" ? "" : ""}
                      {LABEL_NAMES[displayLabel] || displayLabel}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Độ tin cậy AI</p>
                    <p className="text-lg font-semibold text-primary">
                      {(selected.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Thời gian</p>
                  <p className="text-sm font-medium">{formatTime(selected.thrownAt)}</p>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;