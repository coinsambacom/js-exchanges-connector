import OpenAI from "openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import fetch from "node-fetch";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error: ${response.statusText}`);
  return await response.text();
}

function saveToTempFile(content: string): string {
  const tempFilePath = path.join(os.tmpdir(), `page-${Date.now()}.html`);
  fs.writeFileSync(tempFilePath, content, "utf-8");
  return tempFilePath;
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
  const filePath = path.join(__dirname, "prompt_filter_docs.md");
  return fs.readFileSync(filePath, "utf-8");
}

async function getOrCreateAssistant(): Promise<string> {
  const filePath = path.join(os.tmpdir(), "assistant-id-parse-docs3.txt");

  if (fs.existsSync(filePath)) return fs.readFileSync(filePath, "utf-8");

  const instructions = loadInstructions();
  const assistant = await openai.beta.assistants.create({
    model: "gpt-4o-mini",
    description: "API Documentation Assistant",
    tools: [{ type: "file_search" }],
    name: "API Assistant",
    instructions,
  });

  fs.writeFileSync(filePath, assistant.id, "utf-8");
  return assistant.id;
}

function saveExtractedContent(content: string): void {
  const filePath = path.join(__dirname, `extracted-api-docs.md`);
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
    saveExtractedContent(extractedContent);
    return extractedContent;
  }
}

export const parseDocs = async () => {
  const url = process.argv[2];
  if (!url) {
    console.error("Please provide a URL.");
    process.exit(1);
  }

  const pageContent = await fetchPage(url);
  const tempFilePath = saveToTempFile(pageContent);
  const fileId = await uploadFile(tempFilePath);
  const assistantId = await getOrCreateAssistant();
  await extractContent(fileId, assistantId);
};
