import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new McpServer({ name: "designcourse", version: "0.1.0" });

server.registerTool(
    // Tool name, desc, and input schema
    "hello_world", {
        title: "Hello World",
        descrption: "Returns a simple Hello World text.",
        inputSchema: {} // input not needed
    },
    // Tool function
    async () => {
        return { content: [{ type: "text", text: "Hello, World!" }]};
    }
)

server.registerTool(
    // Tool name, desc, and input schema
    "components",
    {
      title: "DesignCourse Components",
      description:
        "Returns a component snippet from ./components/{type}.html. Optionally replaces {{TOKENS}} using props.",
      inputSchema: {
        type: z.enum(["button", "navbar", "confetti"]),
        props: z.record(z.string(), z.any()).optional()
      }
    },

    // Tool function
    async ({ type, props = {} }) => {
      // Get the template path
      const templatePath = path.resolve(__dirname, "components", `${type}.html`);
      // Check if the template exists
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templatePath}`);
      }
      // Read the template file
      let tpl = fs.readFileSync(templatePath, "utf8");
  
      if (Array.isArray(props.links)) {
        const items = props.links.map(l => `<a href="${l.href}" class="nav-link">${l.label}</a>`).join("\n      ");
        props.LINKS = items;
      }
  
      tpl = tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const v = props[key];
        return (v !== undefined && v !== null) ? String(v) : `{{${key}}}`;
      });
  
      return {
        content: [
          { type: "text", text: tpl, mimeType: "text/html", name: `${type}.html` },
          { type: "text", text: "Insert the snippet into your target file at the requested location." }
        ]
      };
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);