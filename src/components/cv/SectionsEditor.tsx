import { useState } from "react";
import { nanoid } from "nanoid";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CV, CVSection, SectionType } from "@/lib/cv-types";
import { makeSection } from "@/lib/cv-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, GripVertical, Plus } from "lucide-react";

interface Props {
  cv: CV;
  onChange: (cv: CV) => void;
}

const SECTION_PRESETS: { type: SectionType; label: string }[] = [
  { type: "summary", label: "نبذة" },
  { type: "experience", label: "خبرات" },
  { type: "education", label: "تعليم" },
  { type: "skills", label: "مهارات" },
  { type: "languages", label: "لغات" },
  { type: "projects", label: "مشاريع" },
  { type: "certificates", label: "شهادات" },
];

export function SectionsEditor({ cv, onChange }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const [customTitle, setCustomTitle] = useState("");

  const update = (sections: CVSection[]) => onChange({ ...cv, sections });

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = cv.sections.findIndex((s) => s.id === active.id);
    const newIndex = cv.sections.findIndex((s) => s.id === over.id);
    update(arrayMove(cv.sections, oldIndex, newIndex));
  };

  const updateSection = (id: string, patch: Partial<CVSection>) => {
    update(cv.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSection = (id: string) => {
    update(cv.sections.filter((s) => s.id !== id));
  };

  const addPreset = (type: SectionType) => {
    const labels: Record<SectionType, string> = {
      summary: "نبذة عني",
      experience: "الخبرات العملية",
      education: "التعليم",
      skills: "المهارات",
      languages: "اللغات",
      projects: "المشاريع",
      certificates: "الشهادات",
      custom: "قسم جديد",
    };
    update([...cv.sections, makeSection(type, labels[type])]);
  };

  const addCustom = () => {
    const title = customTitle.trim();
    if (!title) return;
    update([...cv.sections, makeSection("custom", title)]);
    setCustomTitle("");
  };

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={cv.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {cv.sections.map((s) => (
              <SortableSection
                key={s.id}
                section={s}
                onChange={(patch) => updateSection(s.id, patch)}
                onRemove={() => removeSection(s.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="rounded-lg border border-dashed border-stone-300 p-4 bg-stone-50/50 space-y-3">
        <div className="text-sm font-semibold text-stone-700">إضافة قسم</div>
        <div className="flex flex-wrap gap-2">
          {SECTION_PRESETS.map((p) => (
            <Button key={p.type} size="sm" variant="outline" onClick={() => addPreset(p.type)}>
              <Plus className="size-3 ml-1" />
              {p.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="اسم قسم مخصص (مثال: التطوع، الجوائز...)"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
          />
          <Button onClick={addCustom} disabled={!customTitle.trim()}>
            <Plus className="size-4 ml-1" />
            إضافة
          </Button>
        </div>
      </div>
    </div>
  );
}

function SortableSection({
  section,
  onChange,
  onRemove,
}: {
  section: CVSection;
  onChange: (p: Partial<CVSection>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-stone-100 bg-stone-50/60">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-stone-400 hover:text-stone-700 touch-none"
          aria-label="اسحب لإعادة الترتيب"
        >
          <GripVertical className="size-4" />
        </button>
        <Input
          value={section.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="font-semibold border-transparent shadow-none focus-visible:border-stone-300 bg-transparent"
        />
        <Button size="icon" variant="ghost" onClick={onRemove} aria-label="حذف القسم">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
      <div className="p-3">
        <SectionFields section={section} onChange={onChange} />
      </div>
    </div>
  );
}

function SectionFields({ section, onChange }: { section: CVSection; onChange: (p: Partial<CVSection>) => void }) {
  if (section.type === "summary" || section.type === "custom") {
    return (
      <Textarea
        rows={4}
        value={section.text ?? ""}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="اكتب المحتوى..."
      />
    );
  }

  if (section.type === "experience") {
    const items = section.experiences ?? [];
    return (
      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={it.id} className="rounded border border-stone-200 p-3 space-y-2 bg-stone-50/40">
            <div className="grid grid-cols-2 gap-2">
              <Input value={it.title} placeholder="المسمى الوظيفي" onChange={(e) => {
                const next = [...items]; next[idx] = { ...it, title: e.target.value };
                onChange({ experiences: next });
              }} />
              <Input value={it.company} placeholder="الشركة" onChange={(e) => {
                const next = [...items]; next[idx] = { ...it, company: e.target.value };
                onChange({ experiences: next });
              }} />
            </div>
            <Input value={it.period} placeholder="الفترة (مثال: 2021 - 2024)" onChange={(e) => {
              const next = [...items]; next[idx] = { ...it, period: e.target.value };
              onChange({ experiences: next });
            }} />
            <Textarea rows={3} value={it.description} placeholder="الوصف والإنجازات" onChange={(e) => {
              const next = [...items]; next[idx] = { ...it, description: e.target.value };
              onChange({ experiences: next });
            }} />
            <Button size="sm" variant="ghost" onClick={() => onChange({ experiences: items.filter((_, i) => i !== idx) })}>
              <Trash2 className="size-3 ml-1" /> حذف
            </Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange({
          experiences: [...items, { id: nanoid(6), title: "", company: "", period: "", description: "" }],
        })}>
          <Plus className="size-3 ml-1" /> إضافة خبرة
        </Button>
      </div>
    );
  }

  if (section.type === "education") {
    const items = section.educations ?? [];
    return (
      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={it.id} className="rounded border border-stone-200 p-3 space-y-2 bg-stone-50/40">
            <Input value={it.degree} placeholder="الشهادة / التخصص" onChange={(e) => {
              const next = [...items]; next[idx] = { ...it, degree: e.target.value };
              onChange({ educations: next });
            }} />
            <div className="grid grid-cols-2 gap-2">
              <Input value={it.school} placeholder="الجامعة / المدرسة" onChange={(e) => {
                const next = [...items]; next[idx] = { ...it, school: e.target.value };
                onChange({ educations: next });
              }} />
              <Input value={it.period} placeholder="الفترة" onChange={(e) => {
                const next = [...items]; next[idx] = { ...it, period: e.target.value };
                onChange({ educations: next });
              }} />
            </div>
            <Textarea rows={2} value={it.description} placeholder="وصف اختياري" onChange={(e) => {
              const next = [...items]; next[idx] = { ...it, description: e.target.value };
              onChange({ educations: next });
            }} />
            <Button size="sm" variant="ghost" onClick={() => onChange({ educations: items.filter((_, i) => i !== idx) })}>
              <Trash2 className="size-3 ml-1" /> حذف
            </Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange({
          educations: [...items, { id: nanoid(6), degree: "", school: "", period: "", description: "" }],
        })}>
          <Plus className="size-3 ml-1" /> إضافة
        </Button>
      </div>
    );
  }

  if (section.type === "projects") {
    const items = section.projects ?? [];
    return (
      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={it.id} className="rounded border border-stone-200 p-3 space-y-2 bg-stone-50/40">
            <Input value={it.name} placeholder="اسم المشروع" onChange={(e) => {
              const next = [...items]; next[idx] = { ...it, name: e.target.value };
              onChange({ projects: next });
            }} />
            <Input value={it.link} placeholder="الرابط (اختياري)" dir="ltr" onChange={(e) => {
              const next = [...items]; next[idx] = { ...it, link: e.target.value };
              onChange({ projects: next });
            }} />
            <Textarea rows={2} value={it.description} placeholder="الوصف" onChange={(e) => {
              const next = [...items]; next[idx] = { ...it, description: e.target.value };
              onChange({ projects: next });
            }} />
            <Button size="sm" variant="ghost" onClick={() => onChange({ projects: items.filter((_, i) => i !== idx) })}>
              <Trash2 className="size-3 ml-1" /> حذف
            </Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange({
          projects: [...items, { id: nanoid(6), name: "", link: "", description: "" }],
        })}>
          <Plus className="size-3 ml-1" /> إضافة مشروع
        </Button>
      </div>
    );
  }

  // skills / languages / certificates
  const items = section.items ?? [];
  return (
    <div className="space-y-2">
      {items.map((it, idx) => (
        <div key={it.id} className="flex gap-2">
          <Input value={it.text} onChange={(e) => {
            const next = [...items]; next[idx] = { ...it, text: e.target.value };
            onChange({ items: next });
          }} />
          <Button size="icon" variant="ghost" onClick={() => onChange({ items: items.filter((_, i) => i !== idx) })}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange({ items: [...items, { id: nanoid(6), text: "" }] })}>
        <Plus className="size-3 ml-1" /> إضافة عنصر
      </Button>
    </div>
  );
}
