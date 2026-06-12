import type { CV, CVSection } from "@/lib/cv-types";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

function ContactList({ p, className = "", iconColor }: { p: CV["personal"]; className?: string; iconColor?: string }) {
  const items: { icon: typeof Mail; value: string; ltr?: boolean }[] = [];
  if (p.email) items.push({ icon: Mail, value: p.email, ltr: true });
  if (p.phone) items.push({ icon: Phone, value: p.phone, ltr: true });
  if (p.location) items.push({ icon: MapPin, value: p.location });
  if (p.website) items.push({ icon: Globe, value: p.website, ltr: true });
  return (
    <>
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <span key={i} className={`inline-flex items-center gap-1.5 ${className}`}>
            <Icon className="size-3.5 shrink-0" style={{ color: iconColor ?? "currentColor" }} strokeWidth={1.75} />
            <span dir={it.ltr ? "ltr" : undefined}>{it.value}</span>
          </span>
        );
      })}
    </>
  );
}

interface Props {
  cv: CV;
}

function SectionBody({ s }: { s: CVSection }) {
  if (s.type === "summary" || s.type === "custom") {
    return <p className="whitespace-pre-wrap leading-relaxed text-[13px] text-stone-700">{s.text}</p>;
  }
  if (s.type === "experience") {
    return (
      <div className="space-y-3">
        {s.experiences?.map((e) => (
          <div key={e.id}>
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="font-bold text-[13.5px] text-stone-900">{e.title}</h4>
              <span className="text-[11px] text-stone-500 shrink-0">{e.period}</span>
            </div>
            <div className="text-[12px] text-stone-600 mb-1">{e.company}</div>
            {e.description && <p className="text-[12.5px] leading-relaxed text-stone-700 whitespace-pre-wrap">{e.description}</p>}
          </div>
        ))}
      </div>
    );
  }
  if (s.type === "education") {
    return (
      <div className="space-y-3">
        {s.educations?.map((e) => (
          <div key={e.id}>
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="font-bold text-[13.5px] text-stone-900">{e.degree}</h4>
              <span className="text-[11px] text-stone-500 shrink-0">{e.period}</span>
            </div>
            <div className="text-[12px] text-stone-600 mb-1">{e.school}</div>
            {e.description && <p className="text-[12.5px] leading-relaxed text-stone-700">{e.description}</p>}
          </div>
        ))}
      </div>
    );
  }
  if (s.type === "projects") {
    return (
      <div className="space-y-3">
        {s.projects?.map((p) => (
          <div key={p.id}>
            <h4 className="font-bold text-[13.5px] text-stone-900">{p.name}</h4>
            {p.link && <div className="text-[11px] text-stone-500 ltr-text">{p.link}</div>}
            <p className="text-[12.5px] leading-relaxed text-stone-700">{p.description}</p>
          </div>
        ))}
      </div>
    );
  }
  // skills / languages / certificates
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12.5px] text-stone-700">
      {s.items?.map((i) => (
        <li key={i.id} className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-current opacity-60" />
          <span>{i.text}</span>
        </li>
      ))}
    </ul>
  );
}

function PersonalHeader({ cv, variant }: { cv: CV; variant: "block" | "side" | "minimal" | "banner" }) {
  const { personal: p, accentColor: c } = cv;
  if (variant === "banner") {
    return (
      <div className="px-10 py-8 text-white" style={{ background: c }}>
        <div className="flex items-center gap-5">
          {p.photo && <img src={p.photo} alt="" className="size-24 rounded-full object-cover border-4 border-white/30" />}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{p.fullName}</h1>
            <div className="text-base opacity-90 mt-1">{p.jobTitle}</div>
            <div className="text-xs opacity-90 mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <ContactList p={p} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (variant === "minimal") {
    return (
      <div className="px-10 pt-10 pb-6 border-b border-stone-200">
        <h1 className="text-3xl font-bold text-stone-900">{p.fullName}</h1>
        <div className="text-sm text-stone-600 mt-1">{p.jobTitle}</div>
        <div className="text-[11px] text-stone-500 mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <ContactList p={p} />
        </div>
      </div>
    );
  }
  if (variant === "side") return null; // handled in template
  // block
  return (
    <div className="px-10 pt-10 pb-6 text-center" style={{ borderBottom: `3px solid ${c}` }}>
      {p.photo && <img src={p.photo} alt="" className="size-24 rounded-full object-cover mx-auto mb-3" />}
      <h1 className="text-3xl font-bold" style={{ color: c }}>{p.fullName}</h1>
      <div className="text-sm text-stone-600 mt-1">{p.jobTitle}</div>
      <div className="text-[11px] text-stone-500 mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
        <ContactList p={p} />
      </div>
    </div>
  );
}

function SectionTitle({ title, color, variant = "underline" }: { title: string; color: string; variant?: "underline" | "block" | "dot" | "ribbon" }) {
  if (variant === "block") {
    return (
      <h3 className="text-[13px] font-bold uppercase tracking-wider px-3 py-1.5 rounded text-white mb-3" style={{ background: color }}>{title}</h3>
    );
  }
  if (variant === "dot") {
    return (
      <h3 className="text-[14px] font-bold mb-3 flex items-center gap-2 text-stone-900">
        <span className="size-2 rounded-full" style={{ background: color }} />
        {title}
      </h3>
    );
  }
  if (variant === "ribbon") {
    return (
      <h3 className="text-[13px] font-extrabold mb-3 inline-block pr-3 pl-6 py-1 text-white" style={{ background: color, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%)" }}>{title}</h3>
    );
  }
  return (
    <h3 className="text-[13px] font-bold uppercase tracking-wider mb-3 pb-1 border-b-2" style={{ color, borderColor: color }}>{title}</h3>
  );
}

export function CVPreview({ cv }: Props) {
  const c = cv.accentColor;
  const t = cv.template;

  // SIDEBAR templates: classic, creative
  if (t === "classic" || t === "creative") {
    const isCreative = t === "creative";
    return (
      <div className="bg-white text-stone-900 flex min-h-[1123px]" style={{ width: 794 }}>
        <aside className="w-[34%] p-7 text-white" style={{ background: isCreative ? `linear-gradient(160deg, ${c}, #1c1814)` : c }}>
          {cv.personal.photo && (
            <img src={cv.personal.photo} alt="" className="size-28 rounded-full object-cover mx-auto mb-4 border-4 border-white/30" />
          )}
          <h1 className="text-2xl font-extrabold text-center">{cv.personal.fullName}</h1>
          <div className="text-sm text-center opacity-90 mt-1 mb-6">{cv.personal.jobTitle}</div>

          <div className="space-y-1.5 text-[12px] opacity-95 flex flex-col items-start">
            <ContactList p={cv.personal} />
          </div>

          <div className="mt-6 space-y-5">
            {cv.sections.filter((s) => ["skills", "languages", "certificates"].includes(s.type)).map((s) => (
              <div key={s.id}>
                <h3 className="text-[12px] font-bold uppercase tracking-wider mb-2 pb-1 border-b border-white/30">{s.title}</h3>
                <ul className="space-y-1 text-[12px]">
                  {s.items?.map((i) => <li key={i.id}>• {i.text}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </aside>
        <main className="flex-1 p-8 space-y-5">
          {cv.sections.filter((s) => !["skills", "languages", "certificates"].includes(s.type)).map((s) => (
            <section key={s.id}>
              <SectionTitle title={s.title} color={c} variant={isCreative ? "dot" : "underline"} />
              <SectionBody s={s} />
            </section>
          ))}
        </main>
      </div>
    );
  }

  // MODERN: top banner
  if (t === "modern") {
    return (
      <div className="bg-white text-stone-900" style={{ width: 794, minHeight: 1123 }}>
        <PersonalHeader cv={cv} variant="banner" />
        <div className="p-8 space-y-5">
          {cv.sections.map((s) => (
            <section key={s.id}>
              <SectionTitle title={s.title} color={c} variant="underline" />
              <SectionBody s={s} />
            </section>
          ))}
        </div>
      </div>
    );
  }

  // ELEGANT: centered header
  if (t === "elegant") {
    return (
      <div className="bg-white text-stone-900" style={{ width: 794, minHeight: 1123 }}>
        <PersonalHeader cv={cv} variant="block" />
        <div className="p-8 grid grid-cols-2 gap-6">
          {cv.sections.map((s) => (
            <section key={s.id} className={["summary", "experience", "education"].includes(s.type) ? "col-span-2" : ""}>
              <SectionTitle title={s.title} color={c} variant="underline" />
              <SectionBody s={s} />
            </section>
          ))}
        </div>
      </div>
    );
  }

  // MINIMAL
  if (t === "minimal") {
    return (
      <div className="bg-white text-stone-900" style={{ width: 794, minHeight: 1123 }}>
        <PersonalHeader cv={cv} variant="minimal" />
        <div className="p-10 space-y-6">
          {cv.sections.map((s) => (
            <section key={s.id}>
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-3">{s.title}</h3>
              <SectionBody s={s} />
            </section>
          ))}
        </div>
      </div>
    );
  }

  // BOLD
  return (
    <div className="bg-white text-stone-900" style={{ width: 794, minHeight: 1123 }}>
      <div className="px-10 py-10" style={{ background: c }}>
        <h1 className="text-5xl font-black text-white">{cv.personal.fullName}</h1>
        <div className="text-lg text-white/90 mt-2">{cv.personal.jobTitle}</div>
      </div>
      <div className="px-10 py-3 bg-stone-900 text-white text-[12px] flex flex-wrap gap-x-5">
        {cv.personal.email && <span>{cv.personal.email}</span>}
        {cv.personal.phone && <span dir="ltr">{cv.personal.phone}</span>}
        {cv.personal.location && <span>{cv.personal.location}</span>}
        {cv.personal.website && <span dir="ltr">{cv.personal.website}</span>}
      </div>
      <div className="p-8 space-y-5">
        {cv.sections.map((s) => (
          <section key={s.id}>
            <SectionTitle title={s.title} color={c} variant="ribbon" />
            <SectionBody s={s} />
          </section>
        ))}
      </div>
    </div>
  );
}
