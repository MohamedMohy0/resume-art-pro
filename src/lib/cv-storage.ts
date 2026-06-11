import { nanoid } from "nanoid";
import type { CV, CVSection, SectionType } from "./cv-types";

const KEY = "cvs:v1";

export function loadAll(): CV[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CV[];
  } catch {
    return [];
  }
}

export function saveAll(cvs: CV[]) {
  localStorage.setItem(KEY, JSON.stringify(cvs));
}

export function loadOne(id: string): CV | null {
  return loadAll().find((c) => c.id === id) ?? null;
}

export function upsert(cv: CV) {
  const all = loadAll();
  const idx = all.findIndex((c) => c.id === cv.id);
  cv.updatedAt = Date.now();
  if (idx === -1) all.unshift(cv);
  else all[idx] = cv;
  saveAll(all);
}

export function remove(id: string) {
  saveAll(loadAll().filter((c) => c.id !== id));
}

export function createBlank(): CV {
  return {
    id: nanoid(8),
    name: "سيرة ذاتية جديدة",
    template: "modern",
    accentColor: "#8b7355",
    personal: {
      fullName: "اسمك الكامل",
      jobTitle: "المسمى الوظيفي",
      email: "name@example.com",
      phone: "+966 5x xxx xxxx",
      location: "المدينة، الدولة",
      website: "",
      photo: "",
    },
    sections: [
      makeSection("summary", "نبذة عني"),
      makeSection("experience", "الخبرات العملية"),
      makeSection("education", "التعليم"),
      makeSection("skills", "المهارات"),
      makeSection("languages", "اللغات"),
    ],
    updatedAt: Date.now(),
  };
}

export function makeSection(type: SectionType, title: string): CVSection {
  const base: CVSection = { id: nanoid(6), type, title };
  switch (type) {
    case "summary":
      return { ...base, text: "اكتب نبذة موجزة عن خبراتك وأهدافك المهنية هنا." };
    case "experience":
      return {
        ...base,
        experiences: [
          {
            id: nanoid(6),
            title: "مسمى الوظيفة",
            company: "اسم الشركة",
            period: "2022 - الآن",
            description: "وصف موجز عن الإنجازات والمسؤوليات.",
          },
        ],
      };
    case "education":
      return {
        ...base,
        educations: [
          {
            id: nanoid(6),
            degree: "بكالوريوس في ...",
            school: "اسم الجامعة",
            period: "2018 - 2022",
            description: "",
          },
        ],
      };
    case "skills":
      return {
        ...base,
        items: [
          { id: nanoid(6), text: "مهارة 1" },
          { id: nanoid(6), text: "مهارة 2" },
        ],
      };
    case "languages":
      return {
        ...base,
        items: [
          { id: nanoid(6), text: "العربية - لغة أم" },
          { id: nanoid(6), text: "English - Professional" },
        ],
      };
    case "certificates":
      return { ...base, items: [{ id: nanoid(6), text: "اسم الشهادة - الجهة - السنة" }] };
    case "projects":
      return {
        ...base,
        projects: [
          { id: nanoid(6), name: "اسم المشروع", link: "", description: "وصف المشروع." },
        ],
      };
    case "custom":
      return { ...base, text: "محتوى القسم المخصص." };
  }
}
