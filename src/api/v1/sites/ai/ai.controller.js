"use strict";

const { createOpenAI } = require("@ai-sdk/openai");
const { streamText, tool, convertToModelMessages, stepCountIs } = require("ai");
const { z } = require("zod");
const cheerio = require("cheerio");
const db = require("../../../../config/db");
const logger = require("../../../../utils/logger");
const publicDocs = require("../../public/public.docs");
const env = require("../../../../config/env");

// Instantiate a custom OpenAI provider instance using environment variables
// Supports GitHub Models (models.inference.ai.azure.com), Ollama, OpenRouter, etc.
const customOpenAI = createOpenAI({
  baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1",
  apiKey: process.env.AI_API_KEY || "dummy-key-for-local",
  compatibility: "compatible", // Important for non-OpenAI endpoints like GitHub Models
  fetch: async (url, options) => {
    // ── Workaround for Vercel AI SDK bug ──────────────────────────────────
    // The SDK strips `"type": "object"` from parameterless tool schemas,
    // which causes Azure OpenAI / GitHub Models to crash with:
    // "schema must be a JSON Schema of 'type: \"object\"', got 'type: \"None\"'"
    if (options.body) {
      try {
        const body = JSON.parse(options.body);
        if (body.tools && Array.isArray(body.tools)) {
          body.tools.forEach((t) => {
            if (t.function && t.function.parameters) {
              t.function.parameters.type = "object";
            }
          });
          options.body = JSON.stringify(body);
        }
      } catch (err) {
        // Ignore JSON parse errors and send body as-is
      }
    }
    return fetch(url, options);
  },
});

const chat = async (req, res, next) => {
  try {
    const { messages } = req.body;
    const { siteId } = req.params;

    // ── Validate input ──────────────────────────────────────────────────────
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'No messages provided. Send a JSON body with a "messages" array.',
      });
    }

    // ── Validate site ───────────────────────────────────────────────────────
    const site = await db("sites").where({ id: siteId }).first();
    if (!site) {
      return res
        .status(404)
        .json({ success: false, message: "Site not found" });
    }

    const modelName = process.env.AI_MODEL || "gpt-4o";
    const backendUrl = env.apiUrl;
    const backendOrigin = backendUrl.replace(/\/api\/v1\/?$/, "");
    const siteViewerUrl = env.siteViewerUrl;

    logger.info("AI chat request", {
      siteId,
      model: modelName,
      messageCount: messages.length,
    });

    // ── Convert UI messages to model format ──────────────────────────────
    let modelMessages;
    try {
      modelMessages = await convertToModelMessages(messages);
    } catch (conversionErr) {
      logger.error("Failed to convert UI messages to model format", {
        error: conversionErr.message,
      });
      return res.status(400).json({
        success: false,
        message:
          "Invalid message format. Could not convert messages for the AI model.",
      });
    }

    // ── Stream ───────────────────────────────────────────────────────────
    const result = streamText({
      model: customOpenAI.chat(modelName),
      system: `You are an AI assistant for a website builder called SigmaBuilder.
You help users manage their site "${site.name}" (slug: ${site.slug}). You ALWAYS respond in the same language the user writes in.

CRITICAL RULES:
1. SEPARATION OF CONCERNS: When creating a page with create_page, you MUST STRICTLY separate HTML, CSS, and JS. Do NOT use inline styles or <style> tags in the HTML. Put all styling in the "css" parameter and all logic in the "js" parameter.
2. COMPLETE & WELL-DESIGNED PAGES: Generate fully fleshed-out, complete pages. Include all necessary sections (e.g., header, hero, features, footer) that make a page look professional. Do not generate simple or barebones pages. Ensure modern, premium aesthetics with responsive layouts.
3. REQUIRED PARAMETERS: The "slug" parameter is REQUIRED and must be a URL-safe string like "about-us" or "blog". NEVER leave it empty. The "html" parameter MUST contain the complete structure.
4. After calling any tool, you MUST write a text response summarizing what you did.
5. Use get_pages first to understand what pages already exist before creating new ones.
6. DELETION CONFIRMATION: Before using the delete_page tool, you MUST explicitly ask the user for confirmation in chat. Only proceed with delete_page if the user says yes.
7. MODULE CONTEXT: Use get_site_modules to discover what features the user has active and what public endpoints you can fetch from in your JS code.
8. ABSOLUTE API URLS: When you write JS code that fetches data from the API, you MUST use absolute URLs and append "?preview=true" to bypass draft restrictions. The backend origin is "${backendOrigin}". For example, use fetch('${backendOrigin}/api/v1/public/sites/${site.slug}/modules/blog/posts?preview=true') instead of relative paths.
9. DETAIL PAGES & QUERY PARAMS: Whenever you generate a list of items (e.g., blog posts, portfolio items) and include a "Read more" button, that button MUST link to a separate detail page. You must CREATE that separate detail page using create_page. IMPORTANT: Pages CANNOT have nested slugs (do NOT use slugs like "blog/post"). Detail pages must have flat slugs (e.g., "post"). In the detail page's JS code, read the identifier from the URL query parameters (e.g. \`new URLSearchParams(window.location.search).get('slug')\`) to fetch the specific item.
10. SITE VIEWER & LINKS: The base URL to view the published site is "${siteViewerUrl}/${site.slug}". A link to a specific page on the site MUST be structured as "${siteViewerUrl}/${site.slug}/{pageSlug}" (or just "/{pageSlug}" for internal links if the router handles it). For example, a link to a detail page with slug "post" should be "${siteViewerUrl}/${site.slug}/post?slug=my-post", NEVER just "/post?slug=my-post".
11. HOME PAGE: Use the set_home_page tool to mark a specific page as the main index of the site. This is CRITICAL when the user asks you to create a site or pages from scratch (i.e. when there were no pages before): you MUST automatically decide which of the newly created pages should be the home page and set it using this tool.
12. PAGE PUBLISHING: When a user asks to publish pages, use publish_all_pages to publish all at once, or publish_page for individual pages.
13. BE PROACTIVE: Do NOT ask for permission or confirmation for non-destructive actions (creating, editing, publishing, setting home). Just DO IT. Only ask for confirmation before DELETING pages. If the user asks you to build something, build everything completely in one go — all pages, set home, publish — without stopping to ask.

      Example of a good create_page call:
      - slug: "about-us"
      - title: "About Us"
      - html: "<div class='about-page'><section class='hero-section'><h1>About Us</h1><p>Welcome to our company...</p><button id='action-btn' class='primary-btn'>Learn More</button></section></div>"
      - css: ".about-page { font-family: 'Inter', system-ui, sans-serif; color: #333; } .hero-section { max-width: 1200px; margin: 0 auto; padding: 80px 20px; text-align: center; } .primary-btn { background-color: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; } .primary-btn:hover { background-color: #0056b3; }"
      - js: "document.getElementById('action-btn').addEventListener('click', () => alert('Welcome!'));"`,
      messages: modelMessages,
      stopWhen: stepCountIs(5),

      // ── Lifecycle callbacks for logging ────────────────────────────────
      experimental_onToolCallStart: (event) => {
        logger.info(`Tool call started: ${event.toolName ?? "unknown"}`, {
          toolCallId: event.toolCallId,
          toolName: event.toolName,
          args: event.args,
        });
      },
      experimental_onToolCallFinish: (event) => {
        if (event.success) {
          logger.info(`Tool call finished: ${event.toolName ?? "unknown"}`, {
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            output: event.output,
          });
        } else {
          logger.error(`Tool call failed: ${event.toolName ?? "unknown"}`, {
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            error: event.error,
          });
        }
      },
      onStepFinish: (event) => {
        const toolNames =
          event.toolCalls?.map((tc) => tc.toolName ?? tc.type).join(", ") ||
          "none";
        logger.debug("Step finished", {
          stepType: event.stepType,
          finishReason: event.finishReason,
          tools: toolNames,
          toolCallCount: event.toolCalls?.length ?? 0,
          textLength: event.text?.length ?? 0,
        });
      },
      onFinish: ({ text, usage, finishReason, steps }) => {
        logger.info("AI stream finished", {
          finishReason,
          totalSteps: steps?.length ?? 0,
          textLength: text?.length ?? 0,
          usage,
        });
      },
      onError: ({ error }) => {
        logger.error("AI stream error", {
          message: error?.message ?? String(error),
          name: error?.name,
        });
      },

      // ── Tools ──────────────────────────────────────────────────────────
      tools: {
        get_pages: tool({
          description:
            "Get a list of all pages for the current site, including their basic info.",
          parameters: z.object({
            run: z
              .boolean()
              .describe("Always set this to true to execute the tool."),
          }),
          execute: async () => {
            const pages = await db("pages")
              .select("id", "slug", "title", "status", "is_home", "created_at")
              .where({ site_id: siteId });
            return pages;
          },
        }),
        set_home_page: tool({
          description: "Set a specific page as the home page (index) of the site. You can provide either the page ID or the page slug.",
          parameters: z.object({
            pageId: z.string().optional().describe("The UUID of the page to set as home."),
            slug: z.string().optional().describe("The slug of the page to set as home (alternative to pageId).")
          }),
          execute: async (args) => {
            try {
              let page;
              if (args.pageId) {
                page = await db("pages").where({ site_id: siteId, id: args.pageId }).first();
              } else if (args.slug) {
                page = await db("pages").where({ site_id: siteId, slug: args.slug }).first();
              }
              if (!page) return { success: false, error: `Page not found. Received args: ${JSON.stringify(args)}` };
              await db.transaction(async (trx) => {
                await trx("pages").where({ site_id: siteId }).update({ is_home: false });
                await trx("pages").where({ site_id: siteId, id: page.id }).update({ is_home: true });
              });
              return { success: true, message: `Home page set to "${page.title}" (slug: ${page.slug}).` };
            } catch (err) {
              return { success: false, error: err.message };
            }
          }
        }),
        search_page_content: tool({
          description:
            "Search for content within the site pages. Returns truncated snippets of HTML/CSS/JS.",
          parameters: z.object({
            query: z
              .string()
              .describe("The keyword or concept to search for in pages"),
          }),
          execute: async ({ query }) => {
            const pages = await db("pages")
              .select("id", "slug", "title", "html", "css")
              .where({ site_id: siteId })
              .andWhere(function () {
                this.where("html", "ilike", `%${query}%`)
                  .orWhere("css", "ilike", `%${query}%`)
                  .orWhere("title", "ilike", `%${query}%`)
                  .orWhere("slug", "ilike", `%${query}%`);
              });

            return pages.map((page) => {
              const $ = cheerio.load(page.html || "");
              const cleanText = $("body").text().replace(/\s+/g, " ").trim();
              const snippet =
                cleanText.length > 500
                  ? cleanText.substring(0, 500) + "..."
                  : cleanText;
              return {
                id: page.id,
                slug: page.slug,
                title: page.title,
                contentSnippet: snippet,
              };
            });
          },
        }),
        get_page_content: tool({
          description:
            "Get the full HTML, CSS, and JS content of a specific page by its slug.",
          parameters: z.object({
            slug: z.string().describe("The slug of the page to retrieve."),
          }),
          execute: async ({ slug }) => {
            const page = await db("pages")
              .where({ site_id: siteId, slug })
              .first();
            if (!page) {
              return { success: false, error: "Page not found." };
            }
            return {
              success: true,
              data: {
                id: page.id,
                slug: page.slug,
                title: page.title,
                html: page.html,
                css: page.css,
                js: page.js,
              }
            };
          },
        }),
        create_page: tool({
          description:
            'Create a new page in the site. The slug must be a non-empty URL-safe string like "about-us" or "blog".',
          parameters: z.object({
            slug: z
              .string()
              .min(1)
              .describe(
                'REQUIRED. The URL path for the page (e.g. "about-us"). Must not be empty.',
              ),
            title: z
              .string()
              .min(1)
              .describe(
                "REQUIRED. The display title of the page. Must not be empty.",
              ),
            html: z
              .string()
              .optional()
              .describe("The HTML content for the page"),
            css: z.string().optional().describe("The CSS styles for the page"),
            js: z
              .string()
              .optional()
              .describe("The Javascript code for the page"),
          }),
          execute: async ({ slug, title, html = "", css = "", js = "" }) => {
            // Validate slug is not empty or whitespace-only
            const cleanSlug = slug
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-|-$/g, "");
            if (!cleanSlug) {
              return {
                success: false,
                error:
                  'Slug cannot be empty. Provide a valid URL path like "about-us".',
              };
            }
            try {
              const [newPage] = await db("pages")
                .insert({
                  site_id: siteId,
                  slug: cleanSlug,
                  title: title.trim(),
                  html,
                  css,
                  js,
                  status: "draft",
                })
                .returning(["id", "slug", "title"]);
              return { success: true, page: newPage };
            } catch (err) {
              if (err.code === "23505") {
                return {
                  success: false,
                  error: "A page with this slug already exists.",
                };
              }
              return { success: false, error: err.message };
            }
          },
        }),
        edit_page: tool({
          description: 'Edit an existing page. Provide only the fields you want to update (html, css, js, title, slug).',
          parameters: z.object({
            pageId: z.string().describe('The ID of the page to edit.'),
            slug: z.string().optional().describe('New URL path for the page.'),
            title: z.string().optional().describe('New title of the page.'),
            html: z.string().optional().describe('New HTML content.'),
            css: z.string().optional().describe('New CSS content.'),
            js: z.string().optional().describe('New JS content.'),
          }),
          execute: async ({ pageId, slug, title, html, css, js }) => {
            const updateData = {};
            if (slug !== undefined) updateData.slug = slug;
            if (title !== undefined) updateData.title = title;
            if (html !== undefined) updateData.html = html;
            if (css !== undefined) updateData.css = css;
            if (js !== undefined) updateData.js = js;
            
            try {
              const [updatedPage] = await db("pages")
                .where({ site_id: siteId, id: pageId })
                .update(updateData)
                .returning(["id", "slug", "title"]);
              if (!updatedPage) return { success: false, error: 'Page not found' };
              return { success: true, page: updatedPage };
            } catch (err) {
              return { success: false, error: err.message };
            }
          }
        }),
        delete_page: tool({
          description: 'Delete a page from the site. MUST ask the user for confirmation before calling this.',
          parameters: z.object({
            pageId: z.string().describe('The ID of the page to delete.')
          }),
          execute: async ({ pageId }) => {
            try {
              const deletedCount = await db("pages")
                .where({ site_id: siteId, id: pageId })
                .del();
              if (deletedCount === 0) return { success: false, error: 'Page not found' };
              return { success: true, message: 'Page deleted successfully' };
            } catch (err) {
              return { success: false, error: err.message };
            }
          }
        }),
        publish_page: tool({
          description: "Publish a single page by changing its status to 'published'. You can provide either the page ID or the page slug.",
          parameters: z.object({
            pageId: z.string().optional().describe("The UUID of the page to publish."),
            slug: z.string().optional().describe("The slug of the page to publish (alternative to pageId).")
          }),
          execute: async (args) => {
            try {
              let page;
              if (args.pageId) {
                page = await db("pages").where({ site_id: siteId, id: args.pageId }).first();
              } else if (args.slug) {
                page = await db("pages").where({ site_id: siteId, slug: args.slug }).first();
              }
              if (!page) return { success: false, error: `Page not found. Received args: ${JSON.stringify(args)}` };
              const [updatedPage] = await db("pages")
                .where({ site_id: siteId, id: page.id })
                .update({ status: 'public' })
                .returning(["id", "slug", "title", "status"]);
              return { success: true, message: `Page "${updatedPage.title}" published.`, page: updatedPage };
            } catch (err) {
              return { success: false, error: err.message };
            }
          }
        }),
        publish_all_pages: tool({
          description: "Publish ALL pages of the site at once. Use this when the user asks to publish all pages or when creating a site from scratch.",
          parameters: z.object({
            run: z.boolean().describe("Always set this to true to execute the tool.")
          }),
          execute: async () => {
            try {
              const updated = await db("pages")
                .where({ site_id: siteId })
                .update({ status: 'public' });
              return { success: true, message: `${updated} page(s) published successfully.` };
            } catch (err) {
              return { success: false, error: err.message };
            }
          }
        }),
        get_site_modules: tool({
          description:
            "Get the active modules and features for the current site (e.g., blog, portfolio). Returns active modules and their public API routes.",
          parameters: z.object({
            run: z
              .boolean()
              .describe("Always set this to true to execute the tool."),
          }),
          execute: async () => {
            const features = site.features || { modules: {} };
            const activeModules = features.modules || {};
            const context = {
              activeModules: activeModules,
              publicApiRoutes: {}
            };
            
            const docsObj = publicDocs('es'); // AI always sees docs in ES (or EN, doesn't matter much)
            // Mapeamos los endpoints simplificados
            context.publicApiRoutes.core = {
              base: `${backendOrigin}/api/v1/public/sites/${site.slug}`,
              routes: docsObj.core.endpoints.map(ep => ({ method: ep.method, path: `${backendOrigin}${ep.path.replace('{slug}', site.slug)}`, returns: ep.returns }))
            };
            
            if (activeModules.blog && docsObj.blog) {
                context.publicApiRoutes.blog = {
                    base: `${backendOrigin}/api/v1/public/sites/${site.slug}/modules/blog`,
                    routes: docsObj.blog.endpoints.map(ep => ({ method: ep.method, path: `${backendOrigin}${ep.path.replace('{slug}', site.slug)}`, returns: ep.returns }))
                };
            }
            if (activeModules.portfolio && docsObj.portfolio) {
                context.publicApiRoutes.portfolio = {
                    base: `${backendOrigin}/api/v1/public/sites/${site.slug}/modules/portfolio`,
                    routes: docsObj.portfolio.endpoints.map(ep => ({ method: ep.method, path: `${backendOrigin}${ep.path.replace('{slug}', site.slug)}`, returns: ep.returns }))
                };
            }
            return context;
          },
        }),
      },
    });

    result.pipeUIMessageStreamToResponse(res, {
      onError: (error) => {
        logger.error("UI stream serialisation error", {
          message: String(error),
        });
        // Return a user-friendly error message for the client
        return "An error occurred while processing your request. Please try again.";
      },
    });
  } catch (err) {
    // ── Catch-all: handle errors that happen BEFORE streaming starts ────
    logger.error("AI chat controller error", {
      message: err.message,
      name: err.name,
      stack: err.stack,
    });

    // If headers have already been sent (streaming started), we can't send JSON
    if (res.headersSent) {
      return res.end();
    }

    // Provide a user-friendly error depending on error type
    const isModelError =
      err.name === "AI_APICallError" ||
      err.message?.includes("does not support");
    const isInvalidPrompt = err.name === "AI_InvalidPromptError";

    if (isModelError) {
      return res.status(502).json({
        success: false,
        message: `AI model error: ${err.message}. Check that your AI_MODEL supports the required features (tool calling).`,
      });
    }

    if (isInvalidPrompt) {
      return res.status(400).json({
        success: false,
        message: "Invalid prompt format. Please refresh and try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred with the AI service."
          : err.message,
    });
  }
};

module.exports = {
  chat,
};
