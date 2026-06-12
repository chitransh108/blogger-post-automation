import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "posts_db.json");

// Parse JSON and URL-encoded bodies with large limits for blog content
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Helper to lazy-initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured in Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Initial seeding data if database does not exist
const initialSeedData = [
  {
    id: "post_001",
    topic: "WiredByApun OS: Revolutionizing Solo Content Automation in 2026",
    status: "Published",
    title: "How wiredByApun OS Solves Content Automation for Modern Solo Bloggers",
    metaDescription: "Explore how WiredByApun OS bridges Google Sheets, Apps Script, and Gemini AI into an all-in-one publishing machine directly targeting Blogger sites in 2026.",
    labels: "Productivity, SEO, Content OS, Blogger, AI Automation",
    featuredImagePrompt: "A futuristic ultra-modern neon-lit solo blogger's control room with holographic dashboards, sleek keyboards, and charts, minimal vector graphic style, premium tech design, vibrant cyan and copper accents.",
    featuredImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    sectionImagePrompts: [
      "Sleek visual representation of structured data flow from Google Sheets to a server database, glowing paths.",
      "Minimalist, functional UI dashboard showcasing keyword SEO traffic spikes and post analytics charts."
    ],
    sectionImageUrls: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"
    ],
    articleHtml: `<p>In the rapidly accelerating landscape of digital media, solo content creators face a persistent bottleneck: standard digital marketing stacks are fragmented. Bloggers find themselves shuffling tabs between keyword planners, AI draft generators, markdown editors, image designers, and visual dashboard interfaces just to push a single post live.</p>
<h2>The Solo Blogger Bottleneck: Fragmentation</h2>
<p>This is where a dedicated system like <strong>WiredByApun Content OS</strong> steps in. Overcoming fragmentation isn't about using larger, heavier enterprise subscription tools. It is about architectural harmony. By weaving custom client databases with high-speed AI generators and direct CMS endpoint integration, the solo blogging operation transitions from manual labor into a systematic content refinery.</p>
<p>With direct-to-Blogger API pipelines, articles skip the manual copy-paste cycles. Metadata like labels, direct canonical references, SEO slugs, and customizable visual prompts are kept in sync, ensuring that each post is optimally structured for search engines before hitting the server index.</p>`,
    faqHtml: `<h3>Frequently Asked Questions</h3>
<h4>Is WiredByApun Content OS compatible with Google Sheets?</h4>
<p>Yes, the system is fully designed to sync directly with Google Sheets and Google Apps Script utilizing the direct API integrations provided.</p>
<h4>Can I update published posts?</h4>
<p>Absolutely. The built-in sync architecture tracks the unique Blogger Post ID, enabling instant one-click revisions and republishes directly from your central operational panel.</p>`,
    takeawaysHtml: `<ul>
<li><strong>Universal Synchronization:</strong> Consolidate idea CRM, visual generators, and meta tracking into a single ecosystem.</li>
<li><strong>SEO Dominance:</strong> Auto-optimize layout, word length, and HTML heading density prior to posting.</li>
<li><strong>Blogger API Mastery:</strong> Publish as draft or live post with automated label injection and Blogger CDN host mapping.</li>
</ul>`,
    bloggerPostId: "8734910239102231",
    bloggerUrl: "https://wiredbyapun-demo.blogspot.com/2026/06/how-wiredbyapun-os-solves-content-automation.html",
    publishedAt: "2026-06-11T14:30:00.000Z",
    createdBy: "chitranshranjan178@gmail.com",
    metrics: {
      views: 1240,
      shares: 42,
      seoScore: 92,
      keywordDensity: "2.4%",
      gscImpressions: 8900
    }
  },
  {
    id: "post_002",
    topic: "Tailwind CSS v4.0 Layout Masterclass",
    status: "Images Pending",
    title: "Mastering Tailwind CSS v4.0: High-Performance CSS Architecture",
    metaDescription: "Dive deep into the new performance improvements, Rust compilation model, and customized theme engine directives of Tailwind CSS v4.0 for elite web design.",
    labels: "WebDesign, TailwindCSS, Frontend, WebDev",
    featuredImagePrompt: "A sleek, geometric abstract design with glowing lines resembling interlocking CSS stylesheets and speed vectors, dark futuristic grid background, glowing indigo and teal neon, tech-art vector, elegant.",
    featuredImageUrl: "",
    sectionImagePrompts: [
      "Visual diagram comparing CSS bundle sizes, ultra-minimal modern flat bar chart design.",
      "An editor layout showcasing code snippets with syntax highlighting inside a gorgeous frame."
    ],
    sectionImageUrls: ["", ""],
    articleHtml: `<p>Tailwind CSS v4.0 introduces the brand-new <strong>@tailwindcss/vite</strong> integration, featuring a Rust-based engine that compiles styles up to 10x faster than traditional PostCSS processors. It drops standard configuration files in favor of direct CSS imports and dynamic CSS-based theme variables.</p>
<h2>The Power of the Rust-Powered CSS Compiler</h2>
<p>For modern UI engineering, this is a revolutionary leap. Traditional styling chains add valuable milliseconds of hot reloads to complex applications. By streamlining custom '@theme' directives directly into standard CSS, layout developers can configure custom colors, fonts, and responsive Breakpoints smoothly inside a single global stylesheet.</p>`,
    faqHtml: `<h3>Frequently Asked Questions</h3>
<h4>Do I still need tailwind.config.js in Tailwind CSS v4.0?</h4>
<p>No, Tailwind v4.0 completely eliminates 'tailwind.config.js'. Config is now styled through standard CSS '@theme' directives right in your entry CSS file.</p>`,
    takeawaysHtml: `<ul>
<li><strong>10x Compilation Speed:</strong> Empower layouts through faster build processes.</li>
<li><strong>CSS-First Theme Config:</strong> Declare tokens and utility rules using CSS syntax directly.</li>
</ul>`,
    bloggerPostId: "",
    bloggerUrl: "",
    publishedAt: "",
    createdBy: "chitranshranjan178@gmail.com",
    metrics: {
      views: 0,
      shares: 0,
      seoScore: 88,
      keywordDensity: "1.8%",
      gscImpressions: 0
    }
  },
  {
    id: "post_003",
    topic: "Why We Built a Custom Content OS Instead of Using WordPress",
    status: "Idea",
    title: "",
    metaDescription: "",
    labels: "",
    featuredImagePrompt: "",
    featuredImageUrl: "",
    sectionImagePrompts: [],
    sectionImageUrls: [],
    articleHtml: "",
    faqHtml: "",
    takeawaysHtml: "",
    bloggerPostId: "",
    bloggerUrl: "",
    publishedAt: "",
    createdBy: "chitranshranjan178@gmail.com",
    metrics: {
      views: 0,
      shares: 0,
      seoScore: 0,
      keywordDensity: "0.0%",
      gscImpressions: 0
    }
  },
  {
    id: "post_004",
    topic: "10 SEO Rules Every Emerging Blogger Must Master",
    status: "Ready",
    title: "10 Non-Negotiable SEO Rules for High-Traffic Blogging in 2026",
    metaDescription: "Boost your search position with these 10 non-negotiable SEO techniques, detailing structural HTML layout, keyword densities, meta attributes, and page speed index optimizations.",
    labels: "SEO, Marketing, ContentOS, Growth",
    featuredImagePrompt: "A clean modern vector illustration showing a glowing search bar with golden trophies, rockets, and growing analytics bars emerging gracefully, beige off-white minimal desktop styling.",
    featuredImageUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=1200&q=80",
    sectionImagePrompts: ["Minimal graphic comparing organic search versus paid keywords, pastel green tone."],
    sectionImageUrls: ["https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80"],
    articleHtml: `<p>SEO is no longer just about repeating keywords in your headers. Today's search engines evaluate complete layout structure, visual availability indicators, and interactive semantics. Creating a highly searchable article requires strict discipline across heading nesting, semantic paragraph breaks, and proper custom meta indexing.</p>
<h2>1. Intent-Match Typography & Spacing</h2>
<p>Each heading must reflect a natural conversational inquiry. Nesting h2, h3, and paragraph tags cleanly maintains optimal structural clarity, enabling index crawlers to index contents instantly. Furthermore, providing compact FAQs with high-intent keywords increases rich snippet placements on search results page feeds.</p>`,
    faqHtml: `<h3>SEO Frequently Asked Questions</h3>
<h4>Does heading layout density truly affect keyword positioning?</h4>
<p>Absolutely. Well-nested, semantically correct headers guide crawler indexing pipelines smoothly, increasing rich snippet visibility on modern search interfaces.</p>`,
    takeawaysHtml: `<ul>
<li><strong>Semantic Hierarchies:</strong> Maintain proper heading nesting levels cleanly throughout blocks.</li>
<li><strong>High-Intent FAQ blocks:</strong> Maximize target search queries directly in specialized sections.</li>
</ul>`,
    bloggerPostId: "",
    bloggerUrl: "",
    publishedAt: "",
    createdBy: "chitranshranjan178@gmail.com",
    metrics: {
      views: 0,
      shares: 0,
      seoScore: 94,
      keywordDensity: "2.8%",
      gscImpressions: 0
    }
  }
];

// Read database
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSeedData, null, 2));
      return initialSeedData;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return initialSeedData;
  }
}

// Write database
function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

// Ensure DB file exists on startup
readDb();

// API Endpoints for Content CRM
app.get("/api/ideas", (req, res) => {
  const data = readDb();
  res.json(data);
});

app.post("/api/ideas", (req, res) => {
  const data = readDb();
  const newPost = {
    id: `post_${Date.now()}`,
    topic: req.body.topic || "Untitled Idea",
    status: req.body.status || "Idea",
    title: req.body.title || "",
    metaDescription: req.body.metaDescription || "",
    labels: req.body.labels || "",
    featuredImagePrompt: req.body.featuredImagePrompt || "",
    featuredImageUrl: req.body.featuredImageUrl || "",
    sectionImagePrompts: req.body.sectionImagePrompts || [],
    sectionImageUrls: req.body.sectionImageUrls || [],
    articleHtml: req.body.articleHtml || "",
    faqHtml: req.body.faqHtml || "",
    takeawaysHtml: req.body.takeawaysHtml || "",
    bloggerPostId: req.body.bloggerPostId || "",
    bloggerUrl: req.body.bloggerUrl || "",
    publishedAt: req.body.publishedAt || "",
    createdBy: req.body.createdBy || "solo_blogger@example.com",
    metrics: req.body.metrics || {
      views: 0,
      shares: 0,
      seoScore: 0,
      keywordDensity: "0.0%",
      gscImpressions: 0,
    },
  };
  data.push(newPost);
  writeDb(data);
  res.status(201).json(newPost);
});

app.put("/api/ideas/:id", (req, res) => {
  const data = readDb();
  const index = data.findIndex((item: any) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Post item not found." });
  }
  
  data[index] = {
    ...data[index],
    ...req.body,
  };
  writeDb(data);
  res.json(data[index]);
});

app.delete("/api/ideas/:id", (req, res) => {
  let data = readDb();
  const initialLen = data.length;
  data = data.filter((item: any) => item.id !== req.params.id);
  if (data.length === initialLen) {
    return res.status(404).json({ error: "Post item not found." });
  }
  writeDb(data);
  res.json({ message: "Successfully deleted topic.", id: req.params.id });
});

// AI modules calling the official server-side @google/genai SDK
app.post("/api/generate", async (req, res) => {
  const { topic, keywords, tone } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "A topic parameter is required to generate content." });
  }

  const promptKeywords = keywords ? `Focus keywords: ${keywords}` : "Focus keywords: Automatically align with high-intent search terms for this topic.";
  const promptTone = tone || "Expert and engaging Professional Digital Marketer";

  try {
    const ai = getGeminiClient();
    
    const targetPrompt = `
You are an expert SEO Content Strategist and Copywriter. Create a complete, high-quality Blogger-ready blog post payload for this topic:
Topic: "${topic}"
Tone: ${promptTone}
${promptKeywords}

You MUST output your response in STRICTURE JSON format. Ensure all strings are escaped correctly. The JSON schema must strictly contain these exact fields:
1. "title": An eye-catching, high-click-through-rate, optimized SEO title (under 60 characters).
2. "metaDescription": A powerful, engaging search snippet meta description (140-160 characters) with a clear call-to-action.
3. "labels": A string of comma-separated relevant tags (comma-separated, e.g., "AI, Marketing, Coding, WebDev") appropriate for Blogger labels.
4. "featuredImagePrompt": A professional, high-fidelity, detailed image generation prompt (for models like Midjourney, Imagen, or DALL-E) to create a matching featured image. Design it to be clean, abstract-tech, or editorial styled, bypassing generic illustrations.
5. "sectionImagePrompts": An array of exactly 2 separate image generation prompts to serve as section breaks.
6. "articleHtml": Deep, high-value, extensive body content formatted in standard, beautiful semantic HTML blocks (using tags like <p>, <h2>, <h3>, <strong>). Integrate sub-headings naturally. DO NOT wrap the whole result in general body/html structure. Ensure excellent structural readability with a length of at least 800 words.
7. "faqHtml": An active FAQ section using <h3> and <p> containing exactly 2 highly searchable questions and concise answers.
8. "takeawaysHtml": A <ul> list of 3 high-impact, actionable final key takeaways inside standard HTML lists.

Format your full output exclusively as a valid JSON object matching the JSON response schema. Let the AI output be exactly this JSON and nothing else.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: targetPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            labels: { type: Type.STRING },
            featuredImagePrompt: { type: Type.STRING },
            sectionImagePrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            articleHtml: { type: Type.STRING },
            faqHtml: { type: Type.STRING },
            takeawaysHtml: { type: Type.STRING }
          },
          required: [
            "title",
            "metaDescription",
            "labels",
            "featuredImagePrompt",
            "sectionImagePrompts",
            "articleHtml",
            "faqHtml",
            "takeawaysHtml"
          ]
        },
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Received empty content generation response from Gemini.");
    }

    try {
      const parsedData = JSON.parse(outputText.trim());
      res.json(parsedData);
    } catch (parseError) {
      console.error("JSON Parsing failed. Output was:", outputText);
      res.status(500).json({
        error: "Failed to parse generated system payload as strict JSON structure.",
        rawOutput: outputText
      });
    }

  } catch (error: any) {
    console.error("Gemini content generation failed:", error);
    res.status(500).json({
      error: error.message || "An internal error occurred during content generation.",
      needsApiKey: !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY"
    });
  }
});

// Image prompt generation and editing helper
app.post("/api/generate-image-prompts", async (req, res) => {
  const { topic } = req.body;
  try {
    const ai = getGeminiClient();
    const prompt = `Based on this blog topic: "${topic}", write a professional, highly detailed, visually descriptive prompt to generate a stunning featured image. The image should be rich, high-contrast, modern, editorial style, containing specific suggestions for camera angle, lighting, background elements, and rendering quality.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ prompt: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SEO Auditor Module
app.post("/api/analyze-seo", (req, res) => {
  const { title, metaDescription, articleHtml, keywords } = req.body;
  
  if (!articleHtml) {
    return res.status(400).json({ error: "Article HTML is required for SEO auditing." });
  }

  const keywordList = keywords ? keywords.split(",").map((k: string) => k.trim().toLowerCase()) : [];
  
  // Quick algorithmic SEO evaluation
  let wordCount = articleHtml.replace(/<[^>]*>/g, "").split(/\s+/).length;
  let titleLen = title ? title.length : 0;
  let descLen = metaDescription ? metaDescription.length : 0;
  
  let keywordMatches = 0;
  keywordList.forEach((kw: string) => {
    if (kw && articleHtml.toLowerCase().includes(kw)) {
      keywordMatches++;
    }
  });

  const h2Count = (articleHtml.match(/<h2/g) || []).length;
  const h3Count = (articleHtml.match(/<h3/g) || []).length;
  const strongCount = (articleHtml.match(/<strong/g) || []).length;
  
  // Calculate distinct checks
  const checks = [
    { name: "Word Count Checker", passed: wordCount >= 700, desc: `Current length is ${wordCount} words. Target is >= 700.`, impact: "High" },
    { name: "SEO Title Length", passed: titleLen >= 35 && titleLen <= 65, desc: `Current length is ${titleLen} characters. Target is 40-60.`, impact: "High" },
    { name: "Meta Description Length", passed: descLen >= 120 && descLen <= 165, desc: `Current length is ${descLen} characters. Target is 130-160.`, impact: "Medium" },
    { name: "Heading Hierarchy Nested", passed: h2Count >= 2 && h3Count >= 1, desc: `We detected ${h2Count} <h2> headings and ${h3Count} <h3> headings.`, impact: "Medium" },
    { name: "Keyword Presence", passed: keywordList.length === 0 || keywordMatches > 0, desc: `Matched ${keywordMatches} of ${keywordList.length} specified focus keywords.`, impact: "High" },
    { name: "Typography Formatting Directives", passed: strongCount >= 3, desc: `Found ${strongCount} bold tags for structural emphasis.`, impact: "Low" }
  ];

  const passedCount = checks.filter(c => c.passed).length;
  const rawScore = Math.round((passedCount / checks.length) * 100);
  
  res.json({
    score: rawScore,
    wordCount,
    h2Count,
    h3Count,
    keywordMatches,
    checks
  });
});

// App Script Code Export Endpoints for users to paste into Google Apps Script
app.get("/api/export-gas", (req, res) => {
  const gasCode = `/**
 * WiredByApun Content OS - Google Sheets Sync & publishing Script
 * Place this code inside your Google Sheets Extensions -> Apps Script editor.
 *
 * This script establishes a bi-directional synchronization bridge between:
 * 1. Your Google Sheets Dashboard
 * 2. WiredByApun Content OS APIs
 * 3. Blogger API v3 Endpoint
 */

const BLOGGER_API_KEY = "YOUR_BLOGGER_API_KEY"; // Enter in Apps Script Project Properties
const BLOG_ID = "YOUR_BLOGGER_BLOG_ID"; // Enter your unique Blog ID
const APP_URL = "${process.env.APP_URL || "https://your-custom-content-os.run.app"}";

// Setup custom menus inside Google Sheets UI
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("WiredByApun OS")
    .addItem("Initialize Sheet Schema", "initializeSheetSchema")
    .addSeparator()
    .addItem("Sync Topics from CRM Panel", "syncFromContentOS")
    .addItem("Generate Selected Idea (AI)", "triggerAICreation")
    .addItem("Publish Selected Draft to Blogger", "publishToBlogger")
    .addSeparator()
    .addItem("Configure Credentials", "showConfigDialog")
    .addToUi();
}

/**
 * Creates the official Google Sheets layout mapping the CRM structure.
 */
function initializeSheetSchema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Blogging_CRM");
  if (!sheet) {
    sheet = ss.insertSheet("Blogging_CRM");
  } else {
    sheet.clear();
  }

  // Schema Columns
  const headers = [
    "CRM_Post_ID", 
    "Topic/Idea Title", 
    "Status", 
    "SEO Meta Title", 
    "SEO Meta Description", 
    "Labels (Tags)", 
    "Featured Image URL", 
    "Blogger Post ID", 
    "Blogger Post URL",
    "Last Edited Timestamp"
  ];

  sheet.getRange(1, 1, 1, headers.length)
       .setValues([headers])
       .setFontStyle("italic")
       .setFontWeight("bold")
       .setBackground("#0F172A")
       .setFontColor("#FFFFFF")
       .setHorizontalAlignment("center");
  
  sheet.setFrozenRows(1);
  
  // Add some initial placeholder rows
  const initialRow = ["post_gs_001", "How AI Automation Boosts Blogger SEO in 2026", "Idea", "", "", "", "", "", "", ""];
  sheet.appendRow(initialRow);
  
  SpreadsheetApp.getUi().alert("WiredByApun Sheet Schema initialized successfully!");
}

/**
 * Synchronize Google Sheets data into WiredByApun central pipeline
 */
function syncFromContentOS() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Blogging_CRM");
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Error: Please run 'Initialize Sheet Schema' action first.");
    return;
  }
  
  const response = UrlFetchApp.fetch(APP_URL + "/api/ideas");
  const posts = JSON.parse(response.getContentText());
  
  // Clear everything except headers
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  
  posts.forEach(function(post) {
    sheet.appendRow([
      post.id,
      post.topic,
      post.status,
      post.title || "",
      post.metaDescription || "",
      post.labels || "",
      post.featuredImageUrl || "",
      post.bloggerPostId || "",
      post.bloggerUrl || "",
      post.publishedAt || ""
    ]);
  });
  
  SpreadsheetApp.getUi().alert("Successfully synced " + posts.length + " posts from Content OS!");
}

/**
 * Triggers the remote system to execute Gemini generation for the active row topic
 */
function triggerAICreation() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const activeRow = sheet.getActiveCell().getRow();
  if (activeRow < 2) {
    SpreadsheetApp.getUi().alert("Please select a cell containing a valid Idea row first.");
    return;
  }
  
  const idValue = sheet.getRange(activeRow, 1).getValue();
  const topicValue = sheet.getRange(activeRow, 2).getValue();
  
  if (!topicValue) {
    SpreadsheetApp.getUi().alert("Empty Topic name. Cannot trigger generation.");
    return;
  }
  
  const payload = {
    topic: topicValue,
    tone: "Expert and engaging Professional Digital Marketer",
    keywords: ""
  };
  
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(APP_URL + "/api/generate", options);
  const result = JSON.parse(response.getContentText());
  
  if (result.error) {
    SpreadsheetApp.getUi().alert("AI Generation Error: " + result.error);
    return;
  }
  
  // Insert newly generated values into sheet
  sheet.getRange(activeRow, 3).setValue("Ready");
  sheet.getRange(activeRow, 4).setValue(result.title);
  sheet.getRange(activeRow, 5).setValue(result.metaDescription);
  sheet.getRange(activeRow, 6).setValue(result.labels);
  
  SpreadsheetApp.getUi().alert("AI Article generated! Status set to Ready. Check WiredByApun Content OS dashboard to review full HTML blocks.");
}

/**
 * Calls standard Blogger API v3 REST services to create/publish a post
 */
function publishToBlogger() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const activeRow = sheet.getActiveCell().getRow();
  if (activeRow < 2) {
    SpreadsheetApp.getUi().alert("Select a valid row containing a 'Ready' state post first.");
    return;
  }
  
  const status = sheet.getRange(activeRow, 3).getValue();
  if (status !== "Ready" && status !== "Images Pending") {
    const confirm = Browser.msgBox("Warning", "This row status is currently '" + status + "'. Do you still want to proceed with publishing?", Browser.Buttons.YES_NO);
    if (confirm === "no") return;
  }
  
  const title = sheet.getRange(activeRow, 4).getValue();
  const meta = sheet.getRange(activeRow, 5).getValue();
  const labelsStr = sheet.getRange(activeRow, 6).getValue();
  const featuredImg = sheet.getRange(activeRow, 7).getValue();
  
  if (!title) {
    SpreadsheetApp.getUi().alert("No Title found in columns. Run AI generation first.");
    return;
  }
  
  const url = "https://www.googleapis.com/blogger/v3/blogs/" + BLOG_ID + "/posts?key=" + BLOGGER_API_KEY;
  
  // Build direct HTML composition combining metadata
  let fullBodyHtml = "";
  if (featuredImg) {
    fullBodyHtml += '<div style="text-align: center; margin-bottom: 24px;"><img src="' + featuredImg + '" alt="' + title + '" style="max-width:100%; height:auto; border-radius:8px;" /></div>';
  }
  
  // Simulated visual query content injection placeholder (gets complete content from server)
  const postId = sheet.getRange(activeRow, 1).getValue();
  const contentResponse = UrlFetchApp.fetch(APP_URL + "/api/ideas");
  const posts = JSON.parse(contentResponse.getContentText());
  const match = posts.find(function(p) { return p.id === postId; });
  
  let articleBody = match ? match.articleHtml : "<p>Default content body sync failure. Please review dashboard server variables.</p>";
  if (match && match.faqHtml) articleBody += "<br/>" + match.faqHtml;
  if (match && match.takeawaysHtml) articleBody += "<br/><h3>Key Takeaways</h3>" + match.takeawaysHtml;
  
  fullBodyHtml += articleBody;
  
  const labelsArray = labelsStr ? labelsStr.split(",").map(function(item) { return item.trim(); }) : [];
  
  const postPayload = {
    kind: "blogger#post",
    blog: { id: BLOG_ID },
    title: title,
    content: fullBodyHtml,
    labels: labelsArray
  };
  
  const options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(postPayload),
    muteHttpExceptions: true
  };
  
  const res = UrlFetchApp.fetch(url, options);
  const responseData = JSON.parse(res.getContentText());
  
  if (responseData.error) {
    SpreadsheetApp.getUi().alert("Blogger API Error: " + responseData.error.message);
    return;
  }
  
  // Update state rows back to sheets with Live Blogger identifiers
  sheet.getRange(activeRow, 3).setValue("Published");
  sheet.getRange(activeRow, 8).setValue(responseData.id);
  sheet.getRange(activeRow, 9).setValue(responseData.url);
  sheet.getRange(activeRow, 10).setValue(new Date().toISOString());
  
  SpreadsheetApp.getUi().alert("Successfully published! Post ID: " + responseData.id + "\\nPost URL: " + responseData.url);
}
`;
  res.setHeader("Content-Type", "text/plain");
  res.send(gasCode);
});

// Post action publication simulator that returns realistic, pristine Blogger v3 responses
app.post("/api/simulate-publish", (req, res) => {
  const { id, isDraft } = req.body;
  const data = readDb();
  const matchedIndex = data.findIndex((item: any) => item.id === id);
  if (matchedIndex === -1) {
    return res.status(404).json({ error: "Post item not found in database CRM records." });
  }

  const match = data[matchedIndex];
  const mockId = Math.floor(Math.random() * 9000000000000000) + 1000000000000000;
  const slug = match.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const mockUrl = `https://wiredbyapun-demo.blogspot.com/2026/06/${slug}.html`;

  match.status = "Published";
  match.bloggerPostId = String(mockId);
  match.bloggerUrl = mockUrl;
  match.publishedAt = new Date().toISOString();
  match.metrics = {
    views: Math.floor(Math.random() * 45) + 5,
    shares: 0,
    seoScore: match.metrics.seoScore || 85,
    keywordDensity: match.metrics.keywordDensity || "2.1%",
    gscImpressions: Math.floor(Math.random() * 150) + 20,
  };

  data[matchedIndex] = match;
  writeDb(data);

  res.json({
    kind: "blogger#post",
    id: String(mockId),
    blog: {
      id: "772592031920391"
    },
    published: match.publishedAt,
    updated: match.publishedAt,
    url: mockUrl,
    selfLink: `https://www.googleapis.com/blogger/v3/blogs/772592031920391/posts/${mockId}`,
    title: match.title || match.topic,
    content: `<div>${match.articleHtml}${match.faqHtml}</div>`,
    author: {
      id: "user_001",
      displayName: "Solo Blogger Admin",
      url: "https://profiles.google.com/testblogger"
    },
    replies: {
      totalItems: "0",
      selfLink: `https://www.googleapis.com/blogger/v3/blogs/772592031920391/posts/${mockId}/comments`
    },
    labels: match.labels ? match.labels.split(",").map((l: string) => l.trim()) : [],
    status: isDraft ? "draft" : "LIVE"
  });
});

// Configure Vite or Static Assets middleware depending on the environment mode

if (process.env.NODE_ENV !== "production") {
  const setupDevServer = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  };
  setupDevServer();
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`WiredByApun Content OS backend running on http://0.0.0.0:${PORT}`);
});
