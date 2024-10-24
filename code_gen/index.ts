import OpenAI from "openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import fetch from "node-fetch";
import { parseDocs } from "./parsedocs";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function removeFirstAndLastLine(text: string): string {
  const lines = text.split("\n");
  return lines.length > 2 ? lines.slice(1, -1).join("\n") : "";
}

async function uploadFile(filePath: string) {
  const fileStream = fs.createReadStream(filePath);
  const file = await openai.files.create({
    file: fileStream,
    purpose: "assistants",
  });
  return file.id;
}

function loadInstructions(): string {
  const filePath = path.join(__dirname, "prompt.md");
  return fs.readFileSync(filePath, "utf-8");
}

async function getOrCreateAssistant(): Promise<string> {
  const filePath = path.join(os.tmpdir(), "assistant-id2323o.txt");

  if (fs.existsSync(filePath)) return fs.readFileSync(filePath, "utf-8");

  const instructions = loadInstructions();
  const assistant = await openai.beta.assistants.create({
    model: "gpt-4o",
    description: "API Documentation Assistant",
    tools: [{ type: "file_search" }],
    name: "API Assistant",
    instructions,
  });

  fs.writeFileSync(filePath, assistant.id, "utf-8");
  return assistant.id;
}

function saveExtractedContent(content: string): void {
  const filePath = path.join(__dirname, `generated-connector-${Date.now()}.ts`);
  fs.writeFileSync(filePath, content, "utf-8");
}

async function extractContent(fileId: string, assistantId: string) {
  const thread = await openai.beta.threads.create();
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    attachments: [{ file_id: fileId, tools: [{ type: "file_search" }] }],
    content: "Use this file.",
  });

  const run = await openai.beta.threads.runs.createAndPoll(
    thread.id,
    { assistant_id: assistantId },
    { timeout: 60000 },
  );
  if (run.status !== "completed") throw new Error(`Run failed: ${run.status}`);

  const messages = await openai.beta.threads.messages.list(thread.id);
  if (messages.data[0].content[0].type === "text") {
    const extractedContent = messages.data[0].content[0].text.value;
    saveExtractedContent(removeFirstAndLastLine(extractedContent));
    return extractedContent;
  }
}

async function main(): Promise<void> {
  await parseDocs();
  try {
    const fileId = await uploadFile(
      path.join(__dirname, "extracted-api-docs.md"),
    );
    const assistantId = await getOrCreateAssistant();
    await extractContent(fileId, assistantId);
  } catch (error: any) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
