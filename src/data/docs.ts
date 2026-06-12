export const PRD_DOCUMENT = `# Product Requirements Document (PRD)

## 1. Executive Summary & Vision
"WiredByApun Content OS" is an all-in-one content CRM, production pipeline, and automated publishing system designed to streamline Blogger websites. Currently, solo bloggers work across multiple disconnected applications (Google Sheets, Markdown tools, image prompt engines, SEO optimization rules, and direct CMS admin panels). WiredByApun Content OS consolidates this workflow into a single operational slate. By linking lightweight local databases with Gemini AI and Blogger API REST endpoints, the OS empowers bloggers to manage dozens of optimized posts per month from a single browser dashboard.

## 2. Core Operational Modules
*   **Module 1: Content Pipeline CRM:** Topic database tracker showing progress states: Idea → Queued → Generated → Images Pending → Ready → Published.
*   **Module 2: AI Creation Engine (Gemini API):** Automates metadata structure generation, writing fully complete, semantic-rich layouts, FAQs, meta tags, and image prompts.
*   **Module 3: Real-Time SEO Auditor:** Checks HTML blocks against standard SEO criteria (heading nested layers, keyword density trackers, bold elements, word length indicators).
*   **Module 4: Automated Image Management:** Generates optimized artistic prompt inputs, tracks current media task states, and embeds active CDN image URLs.
*   **Module 5: Blogger rest-sync engine:** Interacts via Google REST endpoints to post layouts as live posts or draft states with associated labels.
*   **Module 6: Sheets Sync Engine (Google Apps Script):** Generates active copy-ready triggers to synchronise CRM data columns directly to custom spreadsheet grids.

## 3. Product Features & User Stories
| Feature ID | Scope | Description | Priority |
| :--- | :--- | :--- | :--- |
| **F-01** | CRM Board | visual Trello style status tracker enabling swift stage progression transitions. | P0 |
| **F-02** | AI Generator | Lazy initialized standard server-side calling structure to write deep semantic Blogger-ready posts. | P0 |
| **F-03** | SEO Auditor | Scrapes HTML elements to evaluate keyword scores, heading layout balances, and word totals. | P1 |
| **F-04** | GAS Syncer | Live copying console containing dynamic Google Sheets code models with custom toolbar items. | P1 |
| **F-05** | Traffic Analytics| Simulated graphs mapping Google Search Console and GA trends. | P2 |

## 4. Technical Specifications & Integrations
*   **Language:** React v19, TypeScript v5.8, Express v4.21, Tailwind CSS v4.
*   **Open API Model:** \`gemini-3.5-flash\` for high-speed content generation and strict JSON parsing.
*   **Storage Models:** File-cached JSON databases with automated CRUD handlers.
*   **Direct CMS Integrations:** Google Blogger REST API (V3 endpoints).
`;

export const ARCHITECTURE_DOCUMENT = `# System Architecture & API Integration Design

## 1. System Topology Map

\`\`\`
                                  +---------------------------------------+
                                  |         Google Spreadsheet UI         |
                                  |      (Google Sheets + Apps Script)    |
                                  +------------------+--------------------+
                                                     |
                                                     | Bi-Directional Sync
                                                     v
+------------------------+        +------------------+--------------------+
|  Blogger CMS Platform | <------+  WiredByApun Content OS Dashboard     |
|   (Blogger API v3)     |        |      (Vite + React 19 Client UI)      |
+------------------------+        +------------------+--------------------+
                                                     |
                                                     | Express API Endpoints
                                                     v
                                  +------------------+--------------------+
                                  |        Express Node.js Server         |
                                  |       (Gemini SDK / Caching DB)       |
                                  +------------------+--------------------+
                                                     |
                                                     | Secured Proxy Channels
                                                     v
                                  +------------------+--------------------+
                                  |         Google Gemini API v1         |
                                  |        (gemini-3.5-flash Model)       |
                                  +---------------------------------------+
\`\`\`

## 2. API Schema Details
### 2.1 Gemini API JSON Generation Schema
*   **Endpoint:** Configured via official \`@google/genai\` Node client library.
*   **Response Scheme (Type.OBJECT Parameters):**
    *   \`title\`: STRING (SEO Clickworthy optimized target title, max 60 char)
    *   \`metaDescription\`: STRING (High intent metadata block, 130-160 char)
    *   \`labels\`: STRING (Comma separated tags)
    *   \`featuredImagePrompt\`: STRING (Detailed layout description)
    *   \`sectionImagePrompts\`: ARRAY of STRINGS (Individual segment illustrations)
    *   \`articleHtml\`: STRING (Pristine, non-enclosed semantic HTML markup)
    *   \`faqHtml\`: STRING (FAQ sections with nested structures)
    *   \`takeawaysHtml\`: STRING (Active list elements)

### 2.2 Blogger API REST Post Schema (v3)
*   **Endpoint:** \`POST https://www.googleapis.com/blogger/v3/blogs/{blogId}/posts\`
*   **Payload Template:**
\`\`\`json
{
  "kind": "blogger#post",
  "blog": { "id": "YOUR_BLOG_ID" },
  "title": "Optimized SEO Post Title",
  "content": "<div>Featured Image URL and Complete Article/FAQs HTML</div>",
  "labels": ["SEO", "Marketing", "Growth"],
  "status": "DRAFT" // or "LIVE"
}
\`\`\`
`;

export const SCHEMA_DOCUMENT = `# Database & Spreadsheet Column Mapping Schema

## 1. Local Database Schema (\`posts_db.json\`)
The client applet stores posts structures in an optimized local database model containing direct CMS binding definitions:

| Field Name | Type | Description |
| :--- | :--- | :--- |
| **id** | string | Unique primary key identifying the post record. |
| **topic** | string | Initial blog post idea described by user. |
| **status** | enum | State tracker: Idea, Queued, Generated, Images Pending, Ready, Published. |
| **title** | string | High intent generated SEO-ready title. |
| **metaDescription** | string | Search engine meta search fragment. |
| **labels** | string | Comma-separated labels used during publication. |
| **featuredImagePrompt** | string | Specific text details supporting picture generation. |
| **featuredImageUrl** | string | Active image url pointing to a host or Blogger CDN. |
| **sectionImagePrompts**| string[] | Image details for dividing sections. |
| **sectionImageUrls** | string[] | Array of hosted block reference images. |
| **articleHtml** | string | Fully drafted, semantic-styled content block. |
| **faqHtml** | string | FAQs code segment. |
| **takeawaysHtml** | string | Highlighted final lesson lists. |
| **bloggerPostId** | string | Remote Blogger Unique Identifier returned upon success. |
| **bloggerUrl** | string | Real, clickable blog URL pointing to the active post. |
| **publishedAt** | timestamp| Universal time identifier showing post dates. |

## 2. Google Sheets Schema Design
For solo bloggers to manage content easily, we establish a standardized spreadsheet schema mapping exactly to the dashboard:

1.  **Column A [CRM_Post_ID]:** Key matching local cache.
2.  **Column B [Topic/Idea Title]:** User idea baseline.
3.  **Column C [Status]:** Idea, Queued, Images Pending, Ready, Published.
4.  **Column D [SEO Meta Title]:** Target text block.
5.  **Column E [SEO Meta Description]:** Clipped search description.
6.  **Column F [Labels (Tags)]:** Comma-separated keywords.
7.  **Column G [Featured Image URL]:** Direct image hosting address.
8.  **Column H [Blogger Post ID]:** Unique identifier returning from API.
9.  **Column I [Blogger Post URL]:** Final live URL address.
10. **Column J [Last Edited Timestamp]:** Date tracking.
`;

export const ROADMAP_DOCUMENT = `# Workflow Plan, Risks & Future Core Engineering

## 1. Flow Diagram Workflow

\`\`\`
 [ Idea Entry ]  ==> [ Trigger AI Generation ] ==> [ SEO Verification Checks ]
       ||                                                     ||
       vv                                                     vv
 [ Queued Status ]                                   [ Ready / Draft Status ]
       ||                                                     ||
       vv                                                     vv
 [ Media Prompt Generation ]                          [ Run direct Blogger Publish ]
       ||                                                     ||
       vv                                                     vv
 [ Push URLs to Images Panel ]                        [ Sync ID to Sheets Columns ]
\`\`\`

## 2. Comprehensive Implementation Roadmap
*   **Phase 1: Local Core OS MVP (Now Operating):** Deploy fully cohesive full-stack React dashboards syncing directly to local DB caching files with integrated live SEO score auditors and Blogger publication payload mocks.
*   **Phase 2: Apps Script Integration:** Establish Sheet menu bindings and install direct Blogger API REST triggers to bypass standard CORS bottlenecks using sheet prompts.
*   **Phase 3: Image Automation Hooks:** Integrate DALL-E or Imagen APIs to generate image assets directly from prompts in a single click, and automatically host them on Cloudinary.
*   **Phase 4: GSC & Analytics Sync:** Query real Google Search Console metrics, highlighting older posts with falling rank indices and auto-triggering "AI Content Refresh" actions.

## 3. Threat Assessment & Mitigations
*   **Risk 1: Token Limit Outages on Large Articles:**
    *   *Mitigation:* Split huge topics into segmented chapters, calling Gemini sequentially inside specialized content frames to keep outputs reliable.
*   **Risk 2: GSheets API Sync Delays / Lockups:**
    *   *Mitigation:* Use lightweight JSON post methods from GSheets script directly to local dashboards rather than loading heavy spreadsheets during creation processes.
*   **Risk 3: Blogger API authentication / OAuth issues:**
    *   *Mitigation:* Provide direct text fallback exports! In case the Blogger API token expires, the blogger can copy-paste the Blogger-ready HTML file output with a single button.
`;
