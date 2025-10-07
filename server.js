import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({ name: "designcourse", version: "0.1.0" });

server.registerTool(
    "hello_world", {
        title: "Hello World",
        descrption: "Returns a simple Hello World text.",
        inputSchema: {} // input not needed
    },
    asyn () => {
        return { content: [{ type: "text", text: "Hello, World!" }]};
    }
)