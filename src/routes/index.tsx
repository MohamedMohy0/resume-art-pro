import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CV } from "@/lib/cv-types";
import { createBlank, loadAll, remove, upsert } from "@/lib/cv-storage";
import { FileText, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "صانع السيرة الذاتية بالعربية" },
      { name: "description", content: "أنشئ سيرة ذاتية احترافية بالعربية مع 6 قوالب، أقسام مخصصة، إعادة ترتيب بالسحب، وتصدير PDF." },
      { property: "og:title", content: "صانع السيرة الذاتية بالعربية" },
      { property: "og:description", content: "قوالب جميلة، تحكم كامل، حفظ تلقائي، وتصدير PDF عالي الجودة." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState<CV[]>([]);

  useEffect(() => {
    setCvs(loadAll());
  }, []);

  const handleCreate = () => {
    const cv = createBlank();
    upsert(cv);
    navigate({ to: "/editor/$id", params: { id: cv.id } });
  };

  const handleDelete = (id: string) => {
    remove(id);
    setCvs(loadAll());
    toast.success("تم الحذف");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">CV</div>
            <div>
              <h1 className="text-lg font-bold text-foreground">صانع السيرة الذاتية</h1>
              <p className="text-xs text-muted-foreground">بالعربية • تصدير PDF • حفظ تلقائي</p>
            </div>
          </div>
          <Button onClick={handleCreate} size="lg">
            <Plus className="size-4 ml-1" />
            سيرة ذاتية جديدة
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <section className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold text-foreground tracking-tight">سيرتك الذاتية، بأسلوبك</h2>
          <p className="text-muted-foreground mt-3">
            6 قوالب احترافية، إضافة أقسام مخصصة بأسمائها، إعادة ترتيب بالسحب والإفلات، وتصدير PDF بدعم كامل للغة العربية.
          </p>
        </section>

        {cvs.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <FileText className="size-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">لا توجد سير ذاتية بعد</h3>
            <p className="text-sm text-muted-foreground mb-5">ابدأ الآن بإنشاء أول سيرة ذاتية لك.</p>
            <Button onClick={handleCreate}>
              <Plus className="size-4 ml-1" />
              ابدأ الآن
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cvs.map((cv) => (
              <Card key={cv.id} className="p-5 hover:shadow-lg transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div className="size-12 rounded-lg bg-secondary grid place-items-center">
                    <FileText className="size-5 text-secondary-foreground" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-accent text-accent-foreground">
                    {cv.template}
                  </span>
                </div>
                <h3 className="font-bold text-foreground truncate">{cv.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 truncate">{cv.personal.fullName}</p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  آخر تحديث: {new Date(cv.updatedAt).toLocaleDateString("ar-EG")}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button asChild size="sm" className="flex-1">
                    <Link to="/editor/$id" params={{ id: cv.id }}>
                      <Pencil className="size-3.5 ml-1" />
                      فتح
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(cv.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
