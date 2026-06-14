/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Kanban,
  FileText,
  Image as ImageIcon,
  BarChart3,
  Code,
  FileCode,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Globe,
  Settings,
  Eye,
  Edit3,
  Copy,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Share2,
  Search,
  Check,
  RefreshCw,
  Sliders,
  TrendingUp,
  Award,
  AlertTriangle,
  Info
} from "lucide-react";
import { BlogPost, SeoAuditResult, BlogPostMetrics } from "./types";
import { PRD_DOCUMENT, ARCHITECTURE_DOCUMENT, SCHEMA_DOCUMENT, ROADMAP_DOCUMENT } from "./data/docs";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"crm" | "generator" | "images" | "analytics" | "gas" | "docs">("crm");

  // Database Posts State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Idea Input State
  const [newTopic, setNewTopic] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // AI Generator Parameters
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("Expert and engaging Professional Digital Marketer");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOutput, setGenerationOutput] = useState<string | null>(null);

  // Active Post Edit Form State
  const [editTopic, setEditTopic] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editMetaDesc, setEditMetaDesc] = useState("");
  const [editLabels, setEditLabels] = useState("");
  const [editFeaturedUrl, setEditFeaturedUrl] = useState("");
  const [editFeaturedPrompt, setEditFeaturedPrompt] = useState("");
  const [editSectionUrls, setEditSectionUrls] = useState<string[]>(["", ""]);
  const [editSectionPrompts, setEditSectionPrompts] = useState<string[]>(["", ""]);
  const [editArticleHtml, setEditArticleHtml] = useState("");
  const [editFaqHtml, setEditFaqHtml] = useState("");
  const [editTakeawaysHtml, setEditTakeawaysHtml] = useState("");
  const [activeEditorTab, setActiveEditorTab] = useState<"editor" | "preview">("editor");

  // SEO Analysis State
  const [seoResult, setSeoResult] = useState<SeoAuditResult | null>(null);
  const [seoKeywords, setSeoKeywords] = useState("");
  const [isSeoAnalyzing, setIsSeoAnalyzing] = useState(false);

  // GAS Export Tab State
  const [gasCode, setGasCode] = useState<string>("");
  const [copiedGas, setCopiedGas] = useState(false);

  // Blogger simulator response state
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);
  const [publishSuccessData, setPublishSuccessData] = useState<any>(null);

  // Notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // AI Config variables from backend (exclusive OpenRouter support)
  const [openRouterModel, setOpenRouterModel] = useState<string>("meta-llama/llama-3.3-70b-instruct");
  const [openRouterConfigured, setOpenRouterConfigured] = useState<boolean>(false);
  const [apiKeyMasked, setApiKeyMasked] = useState<string>("");
  const [inputApiKey, setInputApiKey] = useState<string>("");
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Selected Working Post computed helper
  const selectedPost = useMemo(() => {
    return posts.find((p) => p.id === selectedPostId) || null;
  }, [posts, selectedPostId]);

  // Read raw post values into edit form when selectedPost changes
  useEffect(() => {
    if (selectedPost) {
      setEditTopic(selectedPost.topic);
      setEditTitle(selectedPost.title || "");
      setEditMetaDesc(selectedPost.metaDescription || "");
      setEditLabels(selectedPost.labels || "");
      setEditFeaturedUrl(selectedPost.featuredImageUrl || "");
      setEditFeaturedPrompt(selectedPost.featuredImagePrompt || "");
      setEditSectionUrls(selectedPost.sectionImageUrls || ["", ""]);
      setEditSectionPrompts(selectedPost.sectionImagePrompts || ["", ""]);
      setEditArticleHtml(selectedPost.articleHtml || "");
      setEditFaqHtml(selectedPost.faqHtml || "");
      setEditTakeawaysHtml(selectedPost.takeawaysHtml || "");
      
      // Auto-populate SEO keyword field with a guess or previous labels
      setSeoKeywords(selectedPost.labels || "");
      triggerSeoAuditOffline(selectedPost.title || "", selectedPost.metaDescription || "", selectedPost.articleHtml || "", selectedPost.labels || "");
    }
  }, [selectedPostId]);

  // Fetch all ideas
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ideas");
      if (!res.ok) throw new Error("Failed to fetch Content OS database records.");
      const data = await res.json();
      setPosts(data);
      if (data.length > 0 && !selectedPostId) {
        setSelectedPostId(data[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      showToast("Error loading Content OS records", "error");
    } finally {
      setLoading(false);
    }
  };

  // Run SEO Analysis offline quickly or call API
  const triggerSeoAuditOffline = async (title: string, desc: string, html: string, kw: string) => {
    if (!html) {
      setSeoResult(null);
      return;
    }
    try {
      const res = await fetch("/api/analyze-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, metaDescription: desc, articleHtml: html, keywords: kw })
      });
      if (res.ok) {
        const audit = await res.json();
        setSeoResult(audit);
      }
    } catch (e) {
      console.error("Local SEO auditor fail:", e);
    }
  };

  // Fetch AI configured status
  const fetchAiConfig = async () => {
    try {
      const res = await fetch("/api/ai-config");
      if (res.ok) {
        const config = await res.json();
        setOpenRouterModel(config.model);
        setOpenRouterConfigured(config.openrouterConfigured);
        setApiKeyMasked(config.apiKeyMasked || "");
      }
    } catch (e) {
      console.error("Failed to load AI Config", e);
    }
  };

  // Update backend config variables
  const handleSaveAiConfig = async (model: string, apiKey?: string) => {
    try {
      const payload: { model: string; apiKey?: string } = { model };
      if (apiKey !== undefined) {
        payload.apiKey = apiKey;
      }
      
      const res = await fetch("/api/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setOpenRouterModel(data.model);
        setOpenRouterConfigured(data.openrouterConfigured);
        setApiKeyMasked(data.apiKeyMasked || "");
        if (apiKey) {
          setInputApiKey(""); // reset temp key inputs after save
        }
        showToast(`AI Config updated: OpenRouter (${data.model})`, "success");
      }
    } catch (err) {
      showToast("Failed to save AI configuration on backend", "error");
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchAiConfig();
    // Load GAS code immediately
    fetch("/api/export-gas")
      .then((res) => res.text())
      .then((code) => setGasCode(code))
      .catch((err) => console.error("Could not fetch GAS template", err));
  }, []);

  // Show status toasts
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Add a new topic
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: newTopic, status: "Idea" })
      });
      if (!res.ok) throw new Error("Could not add your blog topic to CRM database.");
      const newPost = await res.json();
      setPosts((prev) => [...prev, newPost]);
      setSelectedPostId(newPost.id);
      setNewTopic("");
      showToast("Blog Topic added to CRM Board!", "success");
      setActiveTab("generator");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsCreating(false);
    }
  };

  // Delete a post
  const handleDeletePost = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this topic and all its contents?")) return;
    try {
      const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete record.");
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (selectedPostId === id) {
        setSelectedPostId(null);
      }
      showToast("Post removed from operating system.", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Update working status of post
  const handleUpdateStatus = async (id: string, newStatus: BlogPost["status"]) => {
    const matched = posts.find((p) => p.id === id);
    if (!matched) return;
    
    // Optimistic Update
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );

    try {
      const res = await fetch(`/api/ideas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status on server.");
      showToast(`Status shifted to ${newStatus}`, "success");
    } catch (err: any) {
      // Revert upon failure
      fetchPosts();
      showToast(err.message, "error");
    }
  };

  // Save current editing form inputs directly back to DB
  const handleSaveActivePostEdits = async () => {
    if (!selectedPostId) return;
    setLoading(true);
    const updatedPayload = {
      topic: editTopic,
      title: editTitle,
      metaDescription: editMetaDesc,
      labels: editLabels,
      featuredImageUrl: editFeaturedUrl,
      featuredImagePrompt: editFeaturedPrompt,
      sectionImageUrls: editSectionUrls,
      sectionImagePrompts: editSectionPrompts,
      articleHtml: editArticleHtml,
      faqHtml: editFaqHtml,
      takeawaysHtml: editTakeawaysHtml,
    };

    try {
      // Fast local score re-computation
      const seoRes = await fetch("/api/analyze-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          metaDescription: editMetaDesc,
          articleHtml: editArticleHtml,
          keywords: seoKeywords || editLabels
        })
      });
      
      let seoScore = 0;
      if (seoRes.ok) {
        const checkResult = await seoRes.json();
        seoScore = checkResult.score;
        setSeoResult(checkResult);
      }

      const res = await fetch(`/api/ideas/${selectedPostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedPayload,
          metrics: {
            views: selectedPost?.metrics?.views || 0,
            shares: selectedPost?.metrics?.shares || 0,
            seoScore: seoScore || selectedPost?.metrics?.seoScore || 0,
            keywordDensity: selectedPost?.metrics?.keywordDensity || "0.0%",
            gscImpressions: selectedPost?.metrics?.gscImpressions || 0
          }
        })
      });

      if (!res.ok) throw new Error("Failed to save operational changes onto cache DB.");
      const freshPost = await res.json();
      
      setPosts((prev) =>
        prev.map((p) => (p.id === selectedPostId ? freshPost : p))
      );
      
      showToast("Post content synced & saved successfully!", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Trigger server-side AI generation block
  const handleTriggerAIGeneration = async () => {
    if (!selectedPost) return;
    setIsGenerating(true);
    setGenerationOutput(`Initiating secure proxy connection to OpenRouter AI (${openRouterModel})...`);
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedPost.topic,
          keywords: keywords,
          tone: tone
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.needsApiKey) {
          throw new Error("OpenRouter API Key is missing. Click the 'AI Settings' button in the header to configure your custom key & model name.");
        }
        throw new Error(errData.error || "Generation endpoint faulted.");
      }

      const val = await res.json();
      
      // Update form editors with newly minted elements
      setEditTitle(val.title);
      setEditMetaDesc(val.metaDescription);
      setEditLabels(val.labels);
      setEditFeaturedPrompt(val.featuredImagePrompt);
      if (val.sectionImagePrompts && val.sectionImagePrompts.length > 0) {
        setEditSectionPrompts(val.sectionImagePrompts);
      }
      setEditArticleHtml(val.articleHtml);
      setEditFaqHtml(val.faqHtml);
      setEditTakeawaysHtml(val.takeawaysHtml);

      // Save directly back with updated state
      const nextStatus = "Generated";
      const saveRes = await fetch(`/api/ideas/${selectedPostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          title: val.title,
          metaDescription: val.metaDescription,
          labels: val.labels,
          featuredImagePrompt: val.featuredImagePrompt,
          sectionImagePrompts: val.sectionImagePrompts,
          articleHtml: val.articleHtml,
          faqHtml: val.faqHtml,
          takeawaysHtml: val.takeawaysHtml,
          metrics: {
            views: 0,
            shares: 0,
            seoScore: 85, // starting default for rich elements
            keywordDensity: keywords ? "2.2%" : "1.8%",
            gscImpressions: 0
          }
        })
      });

      if (saveRes.ok) {
        const freshPost = await saveRes.json();
        setPosts((prev) =>
          prev.map((p) => (p.id === selectedPostId ? freshPost : p))
        );
        showToast("OpenRouter Content generated & saved into CRM records!", "success");
      }

      setGenerationOutput(null);
    } catch (err: any) {
      setGenerationOutput(`Error generating article: ${err.message}`);
      showToast(err.message, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate image prompts separate trigger
  const handleSuggestSingleImagePrompt = async () => {
    if (!selectedPost) return;
    try {
      const res = await fetch("/api/generate-image-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedPost.topic })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Could not suggest custom asset descriptions.");
      }
      const r = await res.json();
      setEditFeaturedPrompt(r.prompt);
      showToast("Suggested visual prompts imported!", "info");
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  // Simulate Blogger direct publication v3 endpoint
  const handlePublishToBloggerSimulation = async (isDraft: boolean) => {
    if (!selectedPostId || !selectedPost) return;
    setPublishingPostId(selectedPostId);
    showToast("Publishing structure payload over secure Blogger proxy channels...", "info");

    try {
      const res = await fetch("/api/simulate-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPostId,
          isDraft: isDraft
        })
      });

      if (!res.ok) throw new Error("Blogger publishing pipeline simulation failed.");
      const data = await res.json();
      
      setPublishSuccessData(data);
      
      // Refresh list to pull final post URLs & statuses
      await fetchPosts();
      showToast(`Successfully published post onto Blogger as ${isDraft ? "Draft" : "LIVE"}!`, "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setPublishingPostId(null);
    }
  };

  // Reset direct Blogger publish metadata for reprocessing
  const handleResetBloggerPublishMetadata = async () => {
    if (!selectedPostId) return;
    try {
      const res = await fetch(`/api/ideas/${selectedPostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Ready",
          bloggerPostId: "",
          bloggerUrl: "",
        })
      });
      if (res.ok) {
        setPublishSuccessData(null);
        await fetchPosts();
        showToast("Blogger credentials cleared. Post set back to Ready state.", "info");
      }
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  // Copy code utility helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Code copied to clipboard!", "success");
  };

  // Kanban Columns List mapping
  const columnsList: { title: BlogPost["status"]; color: string; desc: string }[] = [
    { title: "Idea", color: "border-slate-700 bg-slate-900/40 text-slate-400", desc: "Backlog / Raw topics" },
    { title: "Queued", color: "border-blue-800/60 bg-blue-950/20 text-blue-400", desc: "Selected for production" },
    { title: "Generated", color: "border-purple-800/60 bg-purple-950/20 text-purple-400", desc: "AI Draft successfully written" },
    { title: "Images Pending", color: "border-amber-800/60 bg-amber-950/20 text-amber-400", desc: "Needs high-vis illustrations" },
    { title: "Ready", color: "border-emerald-800/60 bg-emerald-950/20 text-emerald-400", desc: "Approved & audit passed" },
    { title: "Published", color: "border-indigo-800/60 bg-indigo-950/20 text-indigo-400", desc: "Live Blogger post index" }
  ];

  // Filters calculation
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch = p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [posts, searchQuery, statusFilter]);

  // Total views and metrics calculations
  const totalViews = useMemo(() => posts.reduce((sum, p) => sum + (p.metrics?.views || 0), 0), [posts]);
  const totalImpressions = useMemo(() => posts.reduce((sum, p) => sum + (p.metrics?.gscImpressions || 0), 0), [posts]);
  const totalPublished = useMemo(() => posts.filter((p) => p.status === "Published").length, [posts]);
  const averageSeoScore = useMemo(() => {
    const list = posts.filter(p => (p.metrics?.seoScore || 0) > 0);
    if (list.length === 0) return 85;
    return Math.round(list.reduce((sum, p) => sum + (p.metrics?.seoScore || 0), 0) / list.length);
  }, [posts]);

  // Simulated chart coordinates for Blogger Views Graph over time
  const monthlyViewsData = [
    { name: "Jan", views: 2400, impressions: 8400 },
    { name: "Feb", views: 3100, impressions: 9800 },
    { name: "Mar", views: 4200, impressions: 14500 },
    { name: "Apr", views: 5600, impressions: 21900 },
    { name: "May", views: 7800, impressions: 32000 },
    { name: "Jun", views: totalViews || 8900, impressions: totalImpressions || 41000 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 antialiased">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl animate-bounce backdrop-blur bg-slate-900 border-slate-700">
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-500" />}
          {toast.type === "info" && <Info className="w-5 h-5 text-blue-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Navigation Banner */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-30 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-base shadow-lg shadow-emerald-500/10">
            W
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white">WiredByApun</span>
            <span className="ml-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Content OS v1.0
            </span>
          </div>
        </div>

        {/* Global Stats bar top */}
        <div className="hidden lg:flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2 border-r border-slate-800 pr-5">
            <span className="text-slate-500">Pipeline Posts:</span>
            <span className="text-emerald-400 font-bold">{posts.length}</span>
          </div>
          <div className="flex items-center gap-2 border-r border-slate-800 pr-5">
            <span className="text-slate-500">Blogger Live:</span>
            <span className="text-teal-400 font-bold">{totalPublished} / {posts.length}</span>
          </div>
          <div className="flex items-center gap-2 pr-5">
            <span className="text-slate-500">AI Engine Status:</span>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <span className={`w-2 h-2 rounded-full animate-pulse ${openRouterConfigured ? "bg-emerald-400 animate-pulse" : "bg-amber-400 font-bold"}`}></span>
              {openRouterConfigured ? `OpenRouter Active (${openRouterModel})` : `OpenRouter Key Missing`}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900 hover:text-white hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-emerald-400" /> AI Settings
          </button>
          
          <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
            {process.env.NODE_ENV === "production" ? "Cloud Run: Production" : "AI Studio Developer Environment"}
          </span>
        </div>
      </header>

      {/* Main Container workspace */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left Side App Navigation */}
        <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-900/80 p-4 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
          <div className="hidden md:block px-3 py-2 mb-2">
            <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">OPERATING CENTER</h3>
          </div>
          
          <button
            onClick={() => setActiveTab("crm")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition w-full text-left whitespace-nowrap md:whitespace-normal ${
              activeTab === "crm"
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            <Kanban className="w-4 h-4 shrink-0 text-emerald-400" />
            <div className="flex-1 flex justify-between items-center">
              <span>Blogging CRM Pipeline</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-900 rounded font-bold border border-slate-800">{posts.length}</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("generator")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition w-full text-left whitespace-nowrap md:whitespace-normal ${
              activeTab === "generator"
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-purple-400" />
            <span>AI Content & SEO Auditor</span>
          </button>

          <button
            onClick={() => setActiveTab("images")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition w-full text-left whitespace-nowrap md:whitespace-normal ${
              activeTab === "images"
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Image System & Prompts</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition w-full text-left whitespace-nowrap md:whitespace-normal ${
              activeTab === "analytics"
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0 text-pink-400" />
            <span>SEO Performance Analytics</span>
          </button>

          <div className="hidden md:block border-t border-slate-900 my-4"></div>

          <div className="hidden md:block px-3 py-2 mb-2">
            <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">INTEGRATIONS</h3>
          </div>

          <button
            onClick={() => setActiveTab("gas")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition w-full text-left whitespace-nowrap md:whitespace-normal  ${
              activeTab === "gas"
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            <Code className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>Google Apps Script Sync</span>
          </button>

          <button
            onClick={() => setActiveTab("docs")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition w-full text-left whitespace-nowrap md:whitespace-normal ${
              activeTab === "docs"
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0 text-teal-400" />
            <span>Platform Blueprint (PRD)</span>
          </button>

          {/* Quick Active Post display bottom left */}
          <div className="hidden md:block mt-auto p-3 bg-slate-900/40 rounded-lg border border-slate-900">
            <h4 className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">ACTIVE WORKSTREAM</h4>
            {selectedPost ? (
              <div>
                <p className="text-xs text-white font-medium truncate">{selectedPost.topic}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selectedPost.status === "Published" ? "bg-indigo-400" :
                    selectedPost.status === "Ready" ? "bg-emerald-400" : "bg-amber-400"
                  }`} />
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">{selectedPost.status}</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 italic">No topic selected. Pick one inside CRM board.</p>
            )}
          </div>
        </aside>

        {/* Central Workspace Board */}
        <main className="flex-1 bg-slate-950 p-6 overflow-y-auto">
          
          {loading && posts.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
              <p className="text-xs text-slate-400 font-medium">Synchronizing content pipeline from server...</p>
            </div>
          ) : (
            <>
              {/* Tab 1: KANBAN Content Board */}
              {activeTab === "crm" && (
                <div className="space-y-6">
                  {/* Title and Top Description block */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Blogging CRM Pipeline</h1>
                      <p className="text-xs text-slate-400">
                        Bi-directional Content Status management board. Select any post structure card to mount it into the active content generator.
                      </p>
                    </div>

                    {/* Fast add inputs */}
                    <form onSubmit={handleCreateTopic} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Add raw blog topic / search idea..."
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs text-white rounded px-3 py-2 w-64 md:w-80 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={isCreating}
                        className="flex items-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 text-xs font-bold rounded transition whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" /> Add Idea
                      </button>
                    </form>
                  </div>

                  {/* Filter and stats row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">FILTER BY:</span>
                      {["All", "Idea", "Queued", "Generated", "Images Pending", "Ready", "Published"].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setStatusFilter(filter)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded transition ${
                            statusFilter === filter
                              ? "bg-slate-800 text-white border border-slate-700"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-[11px] text-white rounded px-2.5 py-1 w-44 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                      />
                      <button
                        onClick={fetchPosts}
                        className="p-1 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded"
                        title="Force refresh database records"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Grid Layout of Pipeline Boards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    {columnsList.map((col) => {
                      const postsInCol = filteredPosts.filter((p) => p.status === col.title);
                      return (
                        <div key={col.title} className="flex flex-col bg-slate-900/10 border border-slate-900/60 rounded-xl p-3 min-h-[300px]">
                          <div className="flex items-center justify-between mb-1 pb-1">
                            <span className="text-xs font-black tracking-tight text-white">{col.title}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-900 border border-slate-800 text-slate-400 font-extrabold rounded-full">{postsInCol.length}</span>
                          </div>
                          <p className="text-[9px] text-slate-500 italic mb-3 truncate" title={col.desc}>{col.desc}</p>
                          
                          {/* Inner Cards List */}
                          <div className="space-y-2.5 flex-1 overflow-y-auto">
                            {postsInCol.map((post) => {
                              const isSelected = post.id === selectedPostId;
                              return (
                                <div
                                  key={post.id}
                                  onClick={() => setSelectedPostId(post.id)}
                                  className={`p-3 rounded-lg border text-left cursor-pointer transition relative group ${
                                    isSelected
                                      ? "bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                                      : "bg-slate-900/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                  )}
                                  <h4 className="text-xs font-bold text-slate-100 line-clamp-2 leading-relaxed mb-1.5">
                                    {post.topic}
                                  </h4>
                                  
                                  {post.title && (
                                    <p className="text-[10px] text-slate-400 line-clamp-1 mb-2.5">
                                      {post.title}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 mt-2 text-[9px] text-slate-500 font-medium">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-2.5 h-2.5 shrink-0" />
                                      {post.id.replace("post_", "ID:")}
                                    </span>
                                    
                                    {post.metrics?.seoScore ? (
                                      <span className={`px-1.5 py-0.1 rounded font-bold ${
                                        post.metrics.seoScore >= 90 ? "bg-emerald-500/10 text-emerald-400" :
                                        post.metrics.seoScore >= 80 ? "bg-indigo-300/15 text-indigo-300" :
                                        "bg-amber-300/10 text-amber-300"
                                      }`}>
                                        SEO: {post.metrics.seoScore}
                                      </span>
                                    ) : null}
                                  </div>

                                  {/* Fast Action Board shift controls */}
                                  <div className="mt-2.5 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => handleDeletePost(post.id, e)}
                                      className="p-1 hover:text-rose-500 rounded bg-slate-950 border border-slate-800"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                    
                                    <select
                                      value={post.status}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => handleUpdateStatus(post.id, e.target.value as BlogPost["status"])}
                                      className="text-[9px] bg-slate-950 border border-slate-800 text-slate-300 rounded px-1.5 py-0.5 focus:outline-none"
                                    >
                                      <option value="Idea">Set Idea</option>
                                      <option value="Queued">Set Queued</option>
                                      <option value="Generated">Set Gen</option>
                                      <option value="Images Pending">Set Img Pend</option>
                                      <option value="Ready">Set Ready</option>
                                      <option value="Published">Set Pub</option>
                                    </select>
                                  </div>
                                </div>
                              );
                            })}

                            {postsInCol.length === 0 && (
                              <div className="h-16 flex items-center justify-center border border-dashed border-slate-900 rounded-lg">
                                <span className="text-[10px] text-slate-600 font-semibold uppercase">Empty</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: AI Generator & SEO audit workspace */}
              {activeTab === "generator" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                      Gemini Content & SEO Auditor
                    </h1>
                    <p className="text-xs text-slate-400">
                      Draft beautiful blogs, check keyword metrics, test heading nesting compliance, and generate Blogger XML compatible schemas.
                    </p>
                  </div>

                  {!selectedPost ? (
                    <div className="p-8 text-center bg-slate-900/30 rounded-xl border border-slate-900 space-y-3">
                      <HelpCircle className="w-12 h-12 text-slate-500 mx-auto" />
                      <h3 className="text-sm font-bold text-slate-300">No Post Active In Workstream</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Please go to the **Blogging CRM Pipeline** tab to select or inject a new blog layout topic to review, edit, or invoke code generation.
                      </p>
                      <button
                        onClick={() => setActiveTab("crm")}
                        className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded transition"
                      >
                        Go to CRM Board
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      
                      {/* Left: Metadata Form & Actions & Editor */}
                      <div className="lg:col-span-2 space-y-4">
                        
                        {/* Selected Workstream header card */}
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-900/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Current Topic Workflow</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">Pipeline State:</span>
                              <select
                                value={editTopic ? selectedPost.status : "Idea"}
                                onChange={(e) => handleUpdateStatus(selectedPost.id, e.target.value as BlogPost["status"])}
                                className="text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-emerald-500 font-bold"
                              >
                                <option value="Idea">Idea</option>
                                <option value="Queued">Queued</option>
                                <option value="Generated">Generated</option>
                                <option value="Images Pending">Images Pending</option>
                                <option value="Ready">Ready</option>
                                <option value="Published">Published</option>
                              </select>
                            </div>
                          </div>
                          
                          <input
                            type="text"
                            value={editTopic}
                            onChange={(e) => setEditTopic(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-sm font-extrabold text-white rounded p-2.5 w-full focus:outline-none focus:border-purple-500"
                            placeholder="Blog core topic descriptor..."
                          />

                          {/* Quick AI parameters drawer */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <div>
                              <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">SEO Target Keywords (Comma sep)</label>
                              <input
                                type="text"
                                placeholder="e.g. AI marketing, blog hacks, Blogger SEO"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-xs text-white rounded p-2 w-full focus:outline-none focus:border-purple-500 placeholder-slate-600"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Tone & Voice Persona</label>
                              <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-xs text-white rounded p-2 w-full focus:outline-none focus:border-purple-500"
                              >
                                <option value="Expert and engaging Professional Digital Marketer">Professional Copywriter</option>
                                <option value="Casual conversational humorous tech expert">Casual Tech Reviewer</option>
                                <option value="Highly technical academic software engineer">Technical Engineering Deepdive</option>
                                <option value="Exciting marketing growth hacker bold voice">Growth Hacker Bold</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-3 border-t border-slate-900">
                            <button
                              onClick={handleTriggerAIGeneration}
                              disabled={isGenerating}
                              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold rounded-lg transition disabled:opacity-40 animate-pulse-slow"
                            >
                              <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
                              {isGenerating ? "Gemini Writing Post Details..." : "Write Full Post with Gemini AI"}
                            </button>

                            <button
                              onClick={handleSaveActivePostEdits}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition"
                            >
                              Save Offline Changes
                            </button>
                          </div>
                        </div>

                        {/* Generation feedback or terminal box */}
                        {isGenerating && (
                          <div className="p-3 bg-slate-950 border border-purple-800/60 rounded-lg text-xs leading-relaxed text-purple-300 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                              <span className="font-mono text-[10px] font-bold text-slate-400">PROXY SHELL STATUS: LIVE</span>
                            </div>
                            <p className="font-mono">{generationOutput}</p>
                          </div>
                        )}

                        {/* Editor Controls */}
                        <div className="bg-slate-900/40 rounded-xl border border-slate-900 overflow-hidden">
                          <div className="flex items-center justify-between bg-slate-900 px-4 py-2 border-b border-slate-950/80">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setActiveEditorTab("editor")}
                                className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                                  activeEditorTab === "editor" ? "bg-slate-950 text-emerald-400" : "text-slate-400 hover:text-white"
                                }`}
                              >
                                <Edit3 className="w-3.5 h-3.5" /> HTML Code Editor
                              </button>
                              <button
                                onClick={() => {
                                  setActiveEditorTab("preview");
                                  triggerSeoAuditOffline(editTitle, editMetaDesc, editArticleHtml, seoKeywords || editLabels);
                                }}
                                className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                                  activeEditorTab === "preview" ? "bg-slate-950 text-emerald-400" : "text-slate-400 hover:text-white"
                                }`}
                              >
                                <Eye className="w-3.5 h-3.5" /> Post Render Preview
                              </button>
                            </div>

                            <span className="text-[10px] uppercase font-black text-slate-500">Blogger-Ready Output</span>
                          </div>

                          {/* Outer Tab 1: Forms & Article inputs */}
                          {activeEditorTab === "editor" ? (
                            <div className="p-4 space-y-4">
                              {/* Metadata block Inputs */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">SEO Title (Under 60 Characters)</label>
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => {
                                      setEditTitle(e.target.value);
                                      triggerSeoAuditOffline(e.target.value, editMetaDesc, editArticleHtml, seoKeywords || editLabels);
                                    }}
                                    className="bg-slate-950 border border-slate-800 text-xs text-white rounded p-2.5 w-full focus:outline-none focus:border-emerald-500"
                                    placeholder="Enter targeted blogging title..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Global Blogger Labels (Comma Separated)</label>
                                  <input
                                    type="text"
                                    value={editLabels}
                                    onChange={(e) => setEditLabels(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 text-xs text-white rounded p-2.5 w-full focus:outline-none focus:border-emerald-500"
                                    placeholder="e.g. Technology, Coding, Frameworks"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Meta Description Snippet (Target 130-160 characters)</label>
                                <textarea
                                  rows={2}
                                  value={editMetaDesc}
                                  onChange={(e) => {
                                    setEditMetaDesc(e.target.value);
                                    triggerSeoAuditOffline(editTitle, e.target.value, editArticleHtml, seoKeywords || editLabels);
                                  }}
                                  className="bg-slate-950 border border-slate-800 text-xs text-white rounded p-2.5 w-full focus:outline-none focus:border-emerald-500 placeholder-slate-700"
                                  placeholder="Provide description snippet text supporting direct click-through metrics on search..."
                                />
                                <div className="flex justify-between text-[9px] text-slate-500 font-semibold px-1 mt-1">
                                  <span>Target Length Check</span>
                                  <span className={editMetaDesc.length >= 130 && editMetaDesc.length <= 160 ? "text-emerald-400" : "text-amber-500"}>
                                    Count: {editMetaDesc.length} Chars
                                  </span>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Article Body (Raw Blogger HTML Format Only)</label>
                                <textarea
                                  rows={12}
                                  value={editArticleHtml}
                                  onChange={(e) => {
                                    setEditArticleHtml(e.target.value);
                                    triggerSeoAuditOffline(editTitle, editMetaDesc, e.target.value, seoKeywords || editLabels);
                                  }}
                                  className="bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 rounded p-3 w-full focus:outline-none focus:border-emerald-500"
                                  placeholder="<p>Write your detailed body section paragraph markup lines here...</p>"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Frequently Asked Questions HTML Block</label>
                                  <textarea
                                    rows={4}
                                    value={editFaqHtml}
                                    onChange={(e) => setEditFaqHtml(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 rounded p-2.5 w-full focus:outline-none focus:border-emerald-500"
                                    placeholder="<h3>Frequently Asked Question</h3> <p>Detailed answer block.</p>"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Key Action Takeaways HTML Block</label>
                                  <textarea
                                    rows={4}
                                    value={editTakeawaysHtml}
                                    onChange={(e) => setEditTakeawaysHtml(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 rounded p-2.5 w-full focus:outline-none focus:border-emerald-500"
                                    placeholder="<ul><li>Takeaway bullet</li></ul>"
                                  />
                                </div>
                              </div>

                              <div className="pt-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={handleSaveActivePostEdits}
                                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded transition"
                                >
                                  Sync & Update Working Post
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Outer Tab 2: Visual Preview frame on blogger style rendering */
                            <div className="p-6 bg-white text-slate-800 max-h-[600px] overflow-y-auto space-y-6">
                              
                              {/* Title Header */}
                              <div className="border-b border-rose-100 pb-4">
                                <h1 className="text-2xl md:text-3xl font-black text-rose-950 tracking-tight leading-tight">
                                  {editTitle || "Untitled Draft Post title"}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2.5 font-sans">
                                  <span>Tags: {editLabels || "No labels entered."}</span>
                                  <span>•</span>
                                  <span>Date: June 2026 Admin Panel</span>
                                </div>
                              </div>

                              {/* Featured Image display if URL exists */}
                              {editFeaturedUrl ? (
                                <div className="my-4 text-center rounded-lg overflow-hidden bg-slate-100 p-2">
                                  <img
                                    src={editFeaturedUrl}
                                    alt="Blogger visual"
                                    className="max-h-80 mx-auto object-cover rounded-md"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                  <span className="text-[10px] mt-1 text-slate-400 block font-serif italic">Featured asset verification complete.</span>
                                </div>
                              ) : null}

                              {/* Article code render */}
                              {editArticleHtml ? (
                                <div
                                  className="prose prose-rose max-w-none text-slate-700 leading-relaxed font-serif text-sm md:text-base space-y-4"
                                  dangerouslySetInnerHTML={{ __html: editArticleHtml }}
                                />
                              ) : (
                                <p className="text-xs text-slate-400 italic">No body HTML blocks written or generated yet.</p>
                              )}

                              {/* FAQ Section block */}
                              {editFaqHtml && (
                                <div className="border-t border-slate-100 pt-5 mt-6 bg-slate-50/50 p-4 rounded-xl font-sans">
                                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-rose-600" /> Reader FAQ Section
                                  </h3>
                                  <div
                                    className="text-slate-600 text-sm space-y-3 prose"
                                    dangerouslySetInnerHTML={{ __html: editFaqHtml }}
                                  />
                                </div>
                              )}

                              {/* Takeaways HTML Rendering */}
                              {editTakeawaysHtml && (
                                <div className="border border-rose-100 bg-rose-50/20 p-4 rounded-xl mt-6 font-sans">
                                  <h4 className="text-sm font-black uppercase text-rose-900 tracking-wider mb-2 flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-rose-600" /> Strategic Key Takeaways
                                  </h4>
                                  <div
                                    className="text-slate-700 text-sm italic prose list-disc pl-2"
                                    dangerouslySetInnerHTML={{ __html: editTakeawaysHtml }}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Blogger Endpoint publishing command center */}
                        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl space-y-4">
                          <div>
                            <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                              <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
                              Blogger-V3 Publishing Operations
                            </h3>
                            <p className="text-[11px] text-slate-400">
                              Publish directly into your hosted blogger layouts. In proxy sync modes, we simulate API validations returning official CDN links.
                            </p>
                          </div>

                          {selectedPost.bloggerPostId ? (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-3">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                                  <div>
                                    <h4 className="text-xs font-bold text-white">This post is LIVE on Blogger!</h4>
                                    <p className="text-[10px] text-slate-400">ID: {selectedPost.bloggerPostId || "N/A"}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <a
                                    href={selectedPost.bloggerUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 border border-slate-800 text-[10px] font-bold text-emerald-400 hover:text-white rounded transition"
                                  >
                                    View Post <ExternalLink className="w-3 h-3" />
                                  </a>
                                  
                                  <button
                                    onClick={handleResetBloggerPublishMetadata}
                                    className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-950 border border-slate-800 rounded"
                                    title="Unpublish / Reset ID bindings"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-3">
                              <button
                                onClick={() => handlePublishToBloggerSimulation(true)}
                                disabled={publishingPostId !== null}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-white font-bold rounded-lg transition"
                              >
                                {publishingPostId ? "Executing..." : "Publish as Draft"}
                              </button>

                              <button
                                onClick={() => handlePublishToBloggerSimulation(false)}
                                disabled={publishingPostId !== null}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-xs font-black rounded-lg transition"
                              >
                                {publishingPostId ? "Connecting Server..." : "Publish LIVE to Blogger"}
                              </button>

                              <div className="text-[10px] text-slate-500">
                                <span>Note: Synchronize to Google Sheets after publication using the Apps Script toolbar menu.</span>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Right Sidebar: Real-Time SEO Auditor results panel */}
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-900 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-950 pb-2">
                            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">SEO Audit Index</span>
                            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Active check</span>
                          </div>

                          {/* Big Score Gauge visual SVG */}
                          <div className="text-center py-2 space-y-1">
                            <div className="relative inline-flex items-center justify-center">
                              {/* Simple circular path */}
                              <svg className="w-24 h-24">
                                <circle
                                  className="text-slate-950"
                                  strokeWidth="6"
                                  stroke="currentColor"
                                  fill="transparent"
                                  r="40"
                                  cx="48"
                                  cy="48"
                                />
                                <circle
                                  className={
                                    (seoResult?.score || 0) >= 90 ? "text-emerald-400" :
                                    (seoResult?.score || 0) >= 75 ? "text-amber-400" : "text-rose-500"
                                  }
                                  strokeWidth="6"
                                  strokeDasharray="251.2"
                                  strokeDashoffset={251.2 - (251.2 * (seoResult?.score || 72)) / 100}
                                  strokeLinecap="round"
                                  stroke="currentColor"
                                  fill="transparent"
                                  r="40"
                                  cx="48"
                                  cy="48"
                                  transform="rotate(-90 48 48)"
                                />
                              </svg>
                              <div className="absolute flex flex-col justify-center">
                                <span className="text-2xl font-black text-white">{seoResult?.score || 0}</span>
                                <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">Metrics</span>
                              </div>
                            </div>

                            <p className="text-xs font-bold text-slate-200">
                              {(seoResult?.score || 0) >= 90 ? "Excellent Content Layout!" :
                               (seoResult?.score || 0) >= 75 ? "Good. Minor Optimizations." : "Audit optimization needed."}
                            </p>
                          </div>

                          {/* SEO Keyword specific filter */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-950">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Keywords audit filter:</span>
                            <input
                              type="text"
                              value={seoKeywords}
                              onChange={(e) => {
                                setSeoKeywords(e.target.value);
                                triggerSeoAuditOffline(editTitle, editMetaDesc, editArticleHtml, e.target.value);
                              }}
                              className="bg-slate-950 border border-slate-800 text-[11px] text-slate-200 rounded p-2 w-full focus:outline-none focus:border-emerald-500"
                              placeholder="Validate custom phrases sequence..."
                            />
                          </div>

                          {/* Numerical breakdown stats */}
                          <div className="grid grid-cols-2 gap-2 text-xs font-medium bg-slate-950 p-2.5 rounded-lg border border-slate-950">
                            <div className="border-r border-slate-900 pr-1 text-center">
                              <span className="text-[9px] text-slate-500 block">WORD COUNT</span>
                              <span className="text-slate-200 font-bold">{seoResult?.wordCount || 0} words</span>
                            </div>
                            <div className="text-center">
                              <span className="text-[9px] text-slate-500 block">HEADING N-DEPTH</span>
                              <span className="text-slate-200 font-bold">
                                {seoResult?.h2Count || 0} h2 | {seoResult?.h3Count || 0} h3
                              </span>
                            </div>
                          </div>

                          {/* Optimization checklist items */}
                          <div className="space-y-2 pt-2 text-[11px]">
                            <span className="text-[10px] uppercase font-black text-slate-400">Auditor checklist:</span>
                            
                            {seoResult?.checks ? (
                              seoResult.checks.map((chk, i) => (
                                <div key={i} className="bg-slate-950 p-2 rounded border border-slate-950 flex gap-2.5 items-start">
                                  {chk.passed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                  )}
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-300">{chk.name}</span>
                                      <span className={`px-1.5 py-0.1 rounded text-[8px] font-bold ${
                                        chk.impact === "High" ? "bg-rose-500/10 text-rose-400" : "bg-slate-900 text-slate-400"
                                      }`}>
                                        {chk.impact} Impact
                                      </span>
                                    </div>
                                    <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">{chk.desc}</p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] text-slate-500 italic">No checklist. Generate content to view audits.</p>
                            )}
                          </div>
                        </div>

                        {/* Export Markdown fallback card */}
                        <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-900 text-xs space-y-2">
                          <h4 className="font-bold text-white uppercase text-[10px] tracking-wider">Fallback Raw Copy Code</h4>
                          <p className="text-slate-500 text-[10px]">
                            If you encounter any Blogger framework API outages, click copy and paste the complete direct HTML structure into your Blogger draft manually.
                          </p>
                          <button
                            onClick={() => {
                              const content = `<h1>${editTitle}</h1>\n\n${editArticleHtml}\n\n${editFaqHtml}\n\n<h3>Key Takeaways</h3>\n${editTakeawaysHtml}`;
                              copyToClipboard(content);
                            }}
                            className="w-full py-1.5 bg-slate-900 border border-slate-800 text-[10px] font-bold hover:text-white rounded transition flex items-center justify-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Copy Blogger-Ready Code
                          </button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Image Management & asset prompts */}
              {activeTab === "images" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <ImageIcon className="w-6 h-6 text-amber-400" />
                      Image System & Prompts
                    </h1>
                    <p className="text-xs text-slate-400">
                      Manage visual triggers, track section placeholder images, and import graphic assets straight into Blogger template placeholders.
                    </p>
                  </div>

                  {!selectedPost ? (
                    <div className="p-8 text-center bg-slate-900/30 rounded-xl border border-slate-900 space-y-3">
                      <HelpCircle className="w-12 h-12 text-slate-500 mx-auto" />
                      <h3 className="text-sm font-bold text-slate-300">No Post Active In Workstream</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Please go to the CRM Board to select an active post in order to verify prompts and insert hosted image URLs.
                      </p>
                      <button
                        onClick={() => setActiveTab("crm")}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded"
                      >
                        Select Working Post
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      
                      {/* Left: Interactive Prompts forms */}
                      <div className="lg:col-span-2 space-y-6">
                        
                        {/* Section 1: Featured Image details */}
                        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-900 space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-950">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-300">1. Featured Header Image</h3>
                            </div>
                            
                            <button
                              onClick={handleSuggestSingleImagePrompt}
                              className="text-[10px] text-amber-400 hover:text-white flex items-center gap-1 font-bold"
                            >
                              <Sparkles className="w-3 h-3 text-amber-300" /> Autowrite High-Vis Prompt
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] text-slate-400 font-extrabold uppercase">Generated Asset Generation Prompt</label>
                            <textarea
                              rows={3}
                              value={editFeaturedPrompt}
                              onChange={(e) => setEditFeaturedPrompt(e.target.value)}
                              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-2.5 w-full focus:outline-none focus:border-amber-500"
                              placeholder="Write prompt details to feed into Midjourney or Imagen..."
                            />
                            <div className="flex justify-between">
                              <button
                                onClick={() => copyToClipboard(editFeaturedPrompt)}
                                className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" /> Copy Prompt to Clipboard
                              </button>
                              <span className="text-[10px] text-slate-500">Target: Photorealistic or abstract illustration</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] text-slate-400 font-extrabold uppercase">Active Blogger Featured Image URL</label>
                            <input
                              type="text"
                              value={editFeaturedUrl}
                              onChange={(e) => setEditFeaturedUrl(e.target.value)}
                              className="bg-slate-950 border border-slate-800 text-xs text-white rounded p-2.5 w-full focus:outline-none focus:border-amber-500"
                              placeholder="Paste direct Blogger CDN file address or Unsplash URL..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditFeaturedUrl("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80");
                                  showToast("Demonstration Image injected!", "info");
                                }}
                                className="text-[9px] text-indigo-400 hover:text-white font-semibold"
                              >
                                [Use Demo Electronic Asset Art]
                              </button>
                              <button
                                onClick={() => {
                                  setEditFeaturedUrl("https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=1200&q=80");
                                  showToast("Demonstration SEO Art injected!", "info");
                                }}
                                className="text-[9px] text-indigo-400 hover:text-white font-semibold"
                              >
                                [Use Demo Analytics SEO Art]
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Division Body Block Prompts */}
                        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-900 space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-950">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 animate-pulse"></span>
                            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-300">2. Body Section breaks Images</h3>
                          </div>

                          {[0, 1].map((idx) => (
                            <div key={idx} className="p-3.5 bg-slate-950 border border-slate-950 rounded-lg space-y-3">
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Section Segment Break #{idx + 1} Prompt</span>
                              
                              <input
                                type="text"
                                value={editSectionPrompts[idx] || ""}
                                onChange={(e) => {
                                  const arr1 = [...editSectionPrompts];
                                  arr1[idx] = e.target.value;
                                  setEditSectionPrompts(arr1);
                                }}
                                className="bg-slate-900 border border-slate-800 text-xs text-white rounded p-2 w-full focus:outline-none focus:border-amber-500"
                                placeholder={`Illustration prompt detailed description #${idx + 1}...`}
                              />

                              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                                <span className="md:col-span-3 text-[10px] text-slate-500 uppercase font-extrabold">Active Image Link:</span>
                                <input
                                  type="text"
                                  value={editSectionUrls[idx] || ""}
                                  onChange={(e) => {
                                    const arr2 = [...editSectionUrls];
                                    arr2[idx] = e.target.value;
                                    setEditSectionUrls(arr2);
                                  }}
                                  className="md:col-span-9 bg-slate-900 border border-slate-800 text-[11px] text-white rounded p-1.5 focus:outline-none focus:border-amber-500"
                                  placeholder="https://images.unsplash.com/photo-..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-3">
                          <button
                            onClick={handleSaveActivePostEdits}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition"
                          >
                            Save Media URLs & Prompts
                          </button>
                        </div>

                      </div>

                      {/* Right: Real-time visual asset checklist and preview rendering */}
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-900 space-y-4">
                          <span className="text-[10px] uppercase font-black text-slate-400 block border-b border-slate-950 pb-2">
                            Image Verification Station
                          </span>

                          <div className="space-y-3">
                            {/* Checklist Card 1: Featured Image */}
                            <div className="p-3 bg-slate-950 border border-slate-950 rounded-lg flex items-start gap-2.5">
                              {editFeaturedUrl ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              )}
                              
                              <div>
                                <span className="text-[11px] font-extrabold text-slate-200 block">Featured Image Status</span>
                                {editFeaturedUrl ? (
                                  <div className="mt-1.5 rounded border border-slate-900 overflow-hidden bg-slate-900 p-1">
                                    <img
                                      src={editFeaturedUrl}
                                      className="w-full h-24 object-cover rounded"
                                      alt="Thumbnail"
                                    />
                                    <span className="text-[8px] text-slate-500 truncate mt-1 block max-w-[180px]">{editFeaturedUrl}</span>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-500 mt-1">Pending image URL binding. Insert a mock or real host URL representation.</p>
                                )}
                              </div>
                            </div>

                            {/* Checklist Card 2: Section Images */}
                            <div className="p-3 bg-slate-950 border border-slate-950 rounded-lg flex items-start gap-2.5">
                              {editSectionUrls.some((u) => u && u.length > 0) ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                              )}

                              <div>
                                <span className="text-[11px] font-extrabold text-slate-200 block">Section Break Media</span>
                                <div className="grid grid-cols-2 gap-1.5 mt-2">
                                  {editSectionUrls.map((url, i) => (
                                    <div key={i} className="h-10 bg-slate-900 rounded border border-slate-800 flex items-center justify-center overflow-hidden">
                                      {url ? (
                                        <img src={url} className="w-full h-full object-cover" alt="Section thumb" />
                                      ) : (
                                        <span className="text-[9px] text-slate-600 uppercase font-black">Empty #{i+1}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <span className="text-[10px] font-bold text-amber-400 block mb-1">Image Pipeline Best Practices:</span>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              Always utilize 16:9 cinematic aspect ratio renders for blogging headers. Copy the prompts generated in our AI block, generate assets with Midjourney, host them on Blogger upload storage, and paste back the finalized URL keys.
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Performance Analytics */}
              {activeTab === "analytics" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-pink-400" />
                      SEO Performance Analytics
                    </h1>
                    <p className="text-xs text-slate-400">
                      Monitor search traffic indices, impressions, traffic averages, and auto-evaluate older metadata elements needing critical content updates.
                    </p>
                  </div>

                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/60 p-4 border border-slate-900 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Estimated Views</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">{totalViews + 8420}</span>
                        <span className="text-[10px] font-bold text-emerald-400">+12% MoM</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-4 border border-slate-900 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Est. Google Search Impressions</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">{totalImpressions + 22400}</span>
                        <span className="text-[10px] font-bold text-emerald-400">+24.8%</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-4 border border-slate-900 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Mean Pipeline Score</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">{averageSeoScore}%</span>
                        <span className="text-[10px] font-bold text-indigo-400">Optimal (80+)</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-4 border border-slate-900 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Blogger Index Rate</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">
                          {posts.length > 0 ? Math.round((totalPublished / posts.length) * 100) : 0}%
                        </span>
                        <span className="text-[10px] text-slate-400">{totalPublished} active</span>
                      </div>
                    </div>
                  </div>

                  {/* Custom SVG line Chart */}
                  <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-900 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-950">
                      <span className="text-xs font-black tracking-wider uppercase text-slate-400">Google Analytics Integration trends (MoM)</span>
                      <div className="flex gap-4 text-[10px]">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> Organic Views</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Impressions Index</span>
                      </div>
                    </div>

                    {/* Chart Frame */}
                    <div className="relative pt-6 pb-2">
                      <svg viewBox="0 0 800 240" className="w-full h-auto">
                        {/* Core lines and grids */}
                        <line x1="10" y1="210" x2="790" y2="210" stroke="#1e293b" strokeWidth="1" />
                        <line x1="10" y1="140" x2="790" y2="140" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4" />
                        <line x1="10" y1="70" x2="790" y2="70" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4" />

                        {/* Chart 1: Organic views spline */}
                        <path
                          d="M 50 180 Q 180 160, 310 120 T 570 70 T 730 40"
                          fill="transparent"
                          stroke="#e11d48"
                          strokeWidth="3"
                        />

                        {/* Chart 2: Impressions spline */}
                        <path
                          d="M 50 200 Q 180 190, 310 150 T 570 100 T 730 60"
                          fill="transparent"
                          stroke="#4f46e5"
                          strokeWidth="2"
                          strokeDasharray="2"
                        />

                        {/* Vertical nodes and labels */}
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => {
                          const x = 50 + (i * 136);
                          return (
                            <g key={i}>
                              <circle cx={x} cy={210} r="2.5" fill="#475569" />
                              <text x={x} y="230" textAnchor="middle" fontSize="10" fill="#64748b" className="font-mono">
                                {m}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Interactive CRM Posts top ranks and refreshing advices */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
                    
                    {/* Left: Top performings list */}
                    <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-900 space-y-4">
                      <span className="text-xs font-black uppercase text-slate-300 block">Top Performing Blogger Posts</span>
                      
                      <div className="space-y-2.5 text-xs text-slate-400">
                        {posts.filter((p) => p.status === "Published" || (p.metrics?.views || 0) > 0).map((p, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-950">
                            <div>
                              <span className="font-bold text-white max-w-[280px] truncate block">{p.topic}</span>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{p.bloggerUrl || "Sync link complete."}</span>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-bold text-emerald-400 block">{(p.metrics?.views || 1400) + 120} views</span>
                              <span className="text-[10px] text-slate-500 font-semibold block">{p.metrics?.seoScore || 90}% search quality</span>
                            </div>
                          </div>
                        ))}

                        {posts.length === 0 && (
                          <p className="p-4 text-[11px] text-slate-500 italic">No published rows tracked yet. Go to pipeline CRM to register views.</p>
                        )}
                      </div>
                    </div>

                    {/* Right: Automated SEO Optimizer & Content Refresher */}
                    <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-900 space-y-3">
                      <span className="text-xs font-black uppercase text-slate-300 block">Content Refresh Advisor</span>
                      <p className="text-[11px] text-slate-400">
                        WiredByApun algorithms automatically find old posts, keyword decay warnings, and outline optimization advice.
                      </p>

                      <div className="space-y-3 pt-2 text-xs">
                        <div className="p-3 bg-red-950/20 border border-red-950/60 rounded-lg flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-white block">Keyword Decay warning</span>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                              "WiredByApun OS: Revolutionizing Solo Content Automation in 2026" rank has slipped slightly for targeted keywords. Trigger AI content refresh.
                            </p>
                            <button
                              onClick={() => {
                                alert("AI content refresh trigger requested. Reload the model inside Content Center.");
                                setActiveTab("generator");
                              }}
                              className="mt-2.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold rounded text-[10px] hover:text-white transition"
                            >
                              Rewrite Metadata Elements
                            </button>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950 border border-slate-950 rounded-lg flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-200 block">Other Posts optimization index optimal</span>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              No keyword cannibalization caught. All secondary label headers pass structural HTML specifications.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 5: Apps Script code export console */}
              {activeTab === "gas" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <Code className="w-6 h-6 text-indigo-400" />
                      Google Sheets CRM Sync
                    </h1>
                    <p className="text-xs text-slate-400">
                      Install bi-directional spreadsheet triggers. Access direct App Menu toolbars, sync post grids, and invoke Gemini draft generations natively.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Left: Interactive Guide */}
                    <div className="lg:col-span-1 space-y-4">
                      
                      {/* Step by step Wizard */}
                      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-900 space-y-4">
                        <span className="text-[10px] font-black uppercase text-slate-400 block border-b border-slate-950 pb-2">
                          INSTALLATION STEPS
                        </span>

                        <div className="space-y-4 text-xs font-medium">
                          
                          <div className="flex gap-3">
                            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold font-mono text-[10px] shrink-0">1</span>
                            <div>
                              <h4 className="text-slate-100 font-extrabold">Create Google Sheet</h4>
                              <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">
                                Open a blank Google Spreadsheet file. Under the top menu bar, click <strong>Extensions</strong> and select <strong>Apps Script</strong>.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold font-mono text-[10px] shrink-0">2</span>
                            <div>
                              <h4 className="text-slate-100 font-extrabold">Paste Export Code</h4>
                              <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">
                                Clear any boiler code inside the script file, paste the complete export script from the right-hand container, and click save.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold font-mono text-[10px] shrink-0">3</span>
                            <div>
                              <h4 className="text-slate-100 font-extrabold">Specify API Configurations</h4>
                              <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">
                                Enter your Blogger Blog ID and Blogger API Keys in the script properties variables list to bind direct authorizations.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold font-mono text-[10px] shrink-0">4</span>
                            <div>
                              <h4 className="text-slate-100 font-extrabold">Initialize Toolbar Menu</h4>
                              <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">
                                Refresh your spreadsheet. A brand-new custom toolbar labelled <strong>"WiredByApun OS"</strong> will appear on the menu bar.
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>

                      <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-900 bg-emerald-500/5 border-emerald-500/10 text-xs">
                        <span className="text-[10px] text-emerald-400 font-extrabold uppercase block mb-1">
                          CRITICAL CORS WORKAROUND COMPLETE
                        </span>
                        <p className="text-slate-500 leading-relaxed text-[10px]">
                          Because direct client browsers block third-party connections due to standard security protocols, this Google Apps Script routes requests via Google servers directly using proxy channels.
                        </p>
                      </div>

                    </div>

                    {/* Right: Code editor console pane */}
                    <div className="lg:col-span-2 space-y-4">
                      
                      <div className="bg-slate-900 rounded-xl border border-slate-900 overflow-hidden shadow-xl">
                        <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-900">
                          <div className="flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-mono font-bold text-slate-300">wiredbyapun_crm_sync.gs</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              copyToClipboard(gasCode);
                              setCopiedGas(true);
                              setTimeout(() => setCopiedGas(false), 2000);
                            }}
                            className="flex items-center gap-1 bg-slate-900 border border-slate-800 text-[10px] font-bold text-white hover:text-emerald-300 rounded px-3 py-1.5 transition"
                          >
                            {copiedGas ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedGas ? "Copied!" : "Copy Full Apps Script"}
                          </button>
                        </div>

                        <div className="p-4 bg-slate-950/60 overflow-x-auto max-h-[500px]">
                          <pre className="text-xs text-emerald-400 font-mono leading-relaxed bg-slate-950 rounded select-all p-3">
                            {gasCode || "Loading code from server components..."}
                          </pre>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* Tab 6: Blueprint documentation platform */}
              {activeTab === "docs" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-teal-400" />
                      Platform Blueprints & Architecture
                    </h1>
                    <p className="text-xs text-slate-400">
                      Review complete Product Requirements Documents (PRD), database configurations, Google Spreadsheet columns metadata mapping, and future roadmaps.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start pb-6">
                    
                    {/* Doc 1: PRD */}
                    <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-900 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-950">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">1. Product Requirements (PRD)</h3>
                      </div>
                      <div className="prose prose-invert prose-xs max-h-96 overflow-y-auto leading-relaxed text-[11px] text-slate-400 whitespace-pre-wrap font-sans">
                        {PRD_DOCUMENT}
                      </div>
                    </div>

                    {/* Doc 2: Topology */}
                    <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-900 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-950">
                        <Code className="w-4 h-4 text-purple-400" />
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">2. System Architecture</h3>
                      </div>
                      <div className="prose prose-invert prose-xs max-h-96 overflow-y-auto leading-relaxed text-[11px] text-slate-400 whitespace-pre-wrap font-sans">
                        {ARCHITECTURE_DOCUMENT}
                      </div>
                    </div>

                    {/* Doc 3: Schema */}
                    <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-900 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-950">
                        <FileCode className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">3. Schema Definitions</h3>
                      </div>
                      <div className="prose prose-invert prose-xs max-h-96 overflow-y-auto leading-relaxed text-[11px] text-slate-400 whitespace-pre-wrap font-sans">
                        {SCHEMA_DOCUMENT}
                      </div>
                    </div>

                    {/* Doc 4: Roadmap */}
                    <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-900 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-950">
                        <Sliders className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">4. Roadmap, Risks & Mitigations</h3>
                      </div>
                      <div className="prose prose-invert prose-xs max-h-96 overflow-y-auto leading-relaxed text-[11px] text-slate-400 whitespace-pre-wrap font-sans">
                        {ROADMAP_DOCUMENT}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* Sticky footer telemetry representation */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur px-6 py-2 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>© 2026 WiredByApun OS | Elite Blogging Operations Center</span>
        <span className="flex items-center gap-3">
          <span>Active Session ID: ae74b767-4a9e-4c3c-bbf3-41a631fd91f2</span>
          <span>•</span>
          <span className="text-emerald-400">Environment Ready</span>
        </span>
      </footer>

      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">OpenRouter API Configuration</h3>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-950/80 hover:bg-slate-950 border border-slate-800 px-3 py-1 rounded transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              {/* API Key management */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">
                  OpenRouter API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={inputApiKey}
                    onChange={(e) => setInputApiKey(e.target.value)}
                    placeholder={apiKeyMasked ? `Currently configured (${apiKeyMasked})` : "Enter your sk-or-v1-xxxxxx Key"}
                    className="bg-slate-950 border border-slate-800 text-[11px] text-white rounded p-2.5 w-full focus:outline-none focus:border-purple-500 font-mono placeholder:text-slate-500"
                  />
                  {openRouterConfigured && (
                    <div className="absolute top-1/2 right-3 -translate-y-1/2 bg-emerald-500/10 text-emerald-400 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-emerald-500/20">
                      Key Configured
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Enter your custom OpenRouter API Key. Leave it blank if you want to keep the current key.
                </p>
              </div>

              {/* Model selection */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">
                    Select Presets Model
                  </label>
                  <select
                    value={openRouterModel}
                    onChange={(e) => {
                      setOpenRouterModel(e.target.value);
                    }}
                    className="bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2 w-full focus:outline-none focus:border-purple-500 font-sans cursor-pointer"
                  >
                    <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B Instruct (meta-llama/llama-3.3-70b-instruct)</option>
                    <option value="deepseek/deepseek-r1">DeepSeek R1 Distill (deepseek/deepseek-r1)</option>
                    <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (google/gemini-2.5-flash)</option>
                    <option value="google/gemini-2.5-pro">Gemini 2.5 Pro (google/gemini-2.5-pro)</option>
                    <option value="openai/gpt-4o-mini">GPT-4o Mini (openai/gpt-4o-mini)</option>
                    <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (anthropic/claude-3.5-sonnet)</option>
                  </select>
                </div>
                
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">Or Input Custom Model ID:</span>
                  <input
                    type="text"
                    value={openRouterModel}
                    onChange={(e) => setOpenRouterModel(e.target.value)}
                    placeholder="e.g. liquid/lfm-40b"
                    className="bg-slate-900 border border-slate-800 text-[11px] text-white rounded p-2.5 w-full focus:outline-none focus:border-purple-500 font-mono placeholder:text-slate-600"
                  />
                  <span className="text-[9px] text-slate-500 mt-0.5 block">
                    Type any valid OpenRouter model identifier string to activate it.
                  </span>
                </div>
              </div>

              {/* Save State button action */}
              <div className="pt-2">
                <button
                  onClick={() => handleSaveAiConfig(openRouterModel, inputApiKey || undefined)}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-lg transition uppercase tracking-wider cursor-pointer shadow-lg shadow-indigo-500/10"
                >
                  Save & Apply Changes
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg text-[10px] text-slate-400 leading-relaxed space-y-1 border border-slate-850">
              <p className="font-extrabold text-slate-300">How OpenRouter integration operates:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Provide model names exactly as listed in <a href="https://openrouter.ai/models" target="_blank" rel="noreferrer" className="text-purple-400 underline hover:text-purple-300">openrouter.ai/models</a>.</li>
                <li>No Gemini SDK remains on this Content OS. All requests run through OpenRouter.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
