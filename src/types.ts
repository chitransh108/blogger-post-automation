export interface BlogPostMetrics {
  views: number;
  shares: number;
  seoScore: number;
  keywordDensity: string;
  gscImpressions: number;
}

export interface BlogPost {
  id: string;
  topic: string;
  status: "Idea" | "Queued" | "Generated" | "Images Pending" | "Ready" | "Published";
  title?: string;
  metaDescription?: string;
  labels?: string;
  featuredImagePrompt?: string;
  featuredImageUrl?: string;
  sectionImagePrompts?: string[];
  sectionImageUrls?: string[];
  articleHtml?: string;
  faqHtml?: string;
  takeawaysHtml?: string;
  bloggerPostId?: string;
  bloggerUrl?: string;
  publishedAt?: string;
  createdBy?: string;
  metrics?: BlogPostMetrics;
}

export interface SeoAuditCheck {
  name: string;
  passed: boolean;
  desc: string;
  impact: "High" | "Medium" | "Low";
}

export interface SeoAuditResult {
  score: number;
  wordCount: number;
  h2Count: number;
  h3Count: number;
  keywordMatches: number;
  checks: SeoAuditCheck[];
}
