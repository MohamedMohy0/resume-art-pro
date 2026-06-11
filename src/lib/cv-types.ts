export type SectionType =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "projects"
  | "certificates"
  | "custom";

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  period: string;
  description: string;
}

export interface SimpleItem {
  id: string;
  text: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  link: string;
  description: string;
}

export interface CVSection {
  id: string;
  type: SectionType;
  title: string;
  // content shape depends on type
  text?: string; // summary, custom
  experiences?: ExperienceItem[];
  educations?: EducationItem[];
  items?: SimpleItem[]; // skills, languages, certificates
  projects?: ProjectItem[];
}

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  photo: string; // dataURL
}

export type TemplateId =
  | "classic"
  | "modern"
  | "elegant"
  | "minimal"
  | "bold"
  | "creative";

export interface CV {
  id: string;
  name: string;
  template: TemplateId;
  accentColor: string;
  personal: PersonalInfo;
  sections: CVSection[];
  updatedAt: number;
}

export const TEMPLATE_OPTIONS: { id: TemplateId; name: string; desc: string }[] = [
  { id: "classic", name: "كلاسيكي", desc: "تقليدي مع عمود جانبي" },
  { id: "modern", name: "عصري", desc: "رأس ملون وتخطيط نظيف" },
  { id: "elegant", name: "أنيق", desc: "خطوط ناعمة وفواصل دقيقة" },
  { id: "minimal", name: "بسيط", desc: "أقل عناصر وأقصى وضوح" },
  { id: "bold", name: "جريء", desc: "ألوان قوية وعناوين بارزة" },
  { id: "creative", name: "إبداعي", desc: "تصميم غير تقليدي" },
];
