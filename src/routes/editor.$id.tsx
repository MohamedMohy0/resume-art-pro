import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { CV, TemplateId } from "@/lib/cv-types";
import { TEMPLATE_OPTIONS } from "@/lib/cv-types";
import { loadOne, upsert } from "@/lib/cv-storage";
import { CVPreview } from "@/components/cv/CVPreview";
import { SectionsEditor } from "@/components/cv/SectionsEditor";
import { exportElementToPdf } from "@/lib/cv-export";
import { ArrowRight, Download, Save, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/editor/$id")({
  head: () => ({ meta: [{ title: "تعديل السيرة الذاتية" }] }),
  component: Editor,
});

const ACCENT_COLORS = ["#8b7355", "#0c2340", "#064e3b", "#9b4423", "#4f46e5", "#be123c", "#0f766e", "#1e293b"];

function Editor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [cv, setCv] = useState<CV | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = loadOne(id);
    if (!loaded) {
      toast.error("السيرة غير موجودة");
      navigate({ to: "/" });
      return;
    }
    setCv(loaded);
  }, [id, navigate]);

  // autosave
  useEffect(() => {
    if (!cv) return;
    const t = setTimeout(() => {
      upsert(cv);
      setSaving(true);
      setTimeout(() => setSaving(false), 800);
    }, 600);
    return () => clearTimeout(t);
  }, [cv]);

  if (!cv) return null;

  const update = (next: Partial<CV>) => setCv({ ...cv, ...next });
  const updatePersonal = (next: Partial<CV["personal"]>) =>
    setCv({ ...cv, personal: { ...cv.personal, ...next } });

  const handleExport = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      await exportElementToPdf(previewRef.current, `${cv.name || "cv"}.pdf`);
      toast.success("تم تصدير الـ PDF");
    } catch (e) {
      console.error(e);
      toast.error("تعذر التصدير");
    } finally {
      setExporting(false);
    }
  };

  const onPhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => updatePersonal({ photo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="ghost" size="icon">
              <Link to="/"><ArrowRight className="size-4" /></Link>
            </Button>
            <Input
              value={cv.name}
              onChange={(e) => update({ name: e.target.value })}
              className="font-semibold max-w-xs border-transparent shadow-none focus-visible:border-input bg-transparent"
            />
            {saving && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Check className="size-3" /> محفوظ
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { upsert(cv); toast.success("تم الحفظ"); }}>
              <Save className="size-4 ml-1" /> حفظ
            </Button>
            <Button onClick={handleExport} disabled={exporting}>
              <Download className="size-4 ml-1" />
              {exporting ? "...جاري التصدير" : "تصدير PDF"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
        {/* LEFT: editor controls */}
        <div className="space-y-4">
          <Tabs defaultValue="content">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="content">المحتوى</TabsTrigger>
              <TabsTrigger value="personal">المعلومات</TabsTrigger>
              <TabsTrigger value="design">التصميم</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-3 mt-4">
              <Card className="p-4 space-y-3">
                <div>
                  <Label className="mb-1.5 block">الاسم الكامل</Label>
                  <Input value={cv.personal.fullName} onChange={(e) => updatePersonal({ fullName: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block">المسمى الوظيفي</Label>
                  <Input value={cv.personal.jobTitle} onChange={(e) => updatePersonal({ jobTitle: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1.5 block">البريد الإلكتروني</Label>
                    <Input dir="ltr" value={cv.personal.email} onChange={(e) => updatePersonal({ email: e.target.value })} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">الجوال</Label>
                    <Input dir="ltr" value={cv.personal.phone} onChange={(e) => updatePersonal({ phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block">الموقع</Label>
                  <Input value={cv.personal.location} onChange={(e) => updatePersonal({ location: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block">الموقع الإلكتروني</Label>
                  <Input dir="ltr" value={cv.personal.website} onChange={(e) => updatePersonal({ website: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block">الصورة الشخصية</Label>
                  <div className="flex items-center gap-3">
                    {cv.personal.photo && (
                      <img src={cv.personal.photo} alt="" className="size-14 rounded-full object-cover border" />
                    )}
                    <Input type="file" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onPhotoUpload(f);
                    }} />
                    {cv.personal.photo && (
                      <Button size="sm" variant="ghost" onClick={() => updatePersonal({ photo: "" })}>إزالة</Button>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="mt-4">
              <SectionsEditor cv={cv} onChange={setCv} />
            </TabsContent>

            <TabsContent value="design" className="mt-4 space-y-4">
              <Card className="p-4">
                <Label className="mb-3 block font-semibold">القالب</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATE_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => update({ template: t.id as TemplateId })}
                      className={`text-right p-3 rounded-lg border-2 transition ${
                        cv.template === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <Label className="mb-3 block font-semibold">اللون الأساسي</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => update({ accentColor: c })}
                      className={`size-9 rounded-full border-2 transition ${
                        cv.accentColor === c ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ background: c }}
                      aria-label={c}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">لون مخصص:</Label>
                  <input
                    type="color"
                    value={cv.accentColor}
                    onChange={(e) => update({ accentColor: e.target.value })}
                    className="size-9 rounded border border-border cursor-pointer"
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT: preview */}
        <div className="overflow-auto">
          <div className="bg-stone-200/60 rounded-xl p-4 inline-block min-w-full">
            <div className="origin-top mx-auto shadow-2xl" style={{ width: 794 }}>
  <div
    ref={previewRef}
    dir="rtl"
    style={{
      backgroundColor: "#ffffff",
      color: "#000000",
      fontFamily: "'Cairo', 'Tajawal', system-ui, sans-serif",
    }}
  >
    <CVPreview cv={cv} />
  </div>
</div>
          </div>
        </div>
      </div>
    </div>
  );
}
