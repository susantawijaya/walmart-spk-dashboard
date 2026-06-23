import { spawn } from "node:child_process";
import path from "node:path";

const port = 3099;
const baseUrl = `http://127.0.0.1:${port}`;
const nextBinary = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);
const server = spawn(process.execPath, [nextBinary, "start", "-p", String(port)], {
  cwd: process.cwd(),
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
server.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

async function waitUntilReady(): Promise<void> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Server berhenti sebelum siap.\n${output}`);
    }
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Server masih memulai.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server tidak siap dalam 30 detik.\n${output}`);
}

const routes = [
  ["/", "Command Center Penjualan Walmart"],
  ["/spk", "Decision Studio AHP–TOPSIS"],
  ["/business-questions", "Questions yang Mendukung Keputusan"],
  ["/dataset", "Dataset Walmart Sales"],
  ["/dokumentasi", "Sitemap dan UML Use Case"],
  ["/kredit", "Kredit Dataset dan Aset"],
] as const;

try {
  await waitUntilReady();
  for (const [route, expectedText] of routes) {
    const response = await fetch(`${baseUrl}${route}`);
    const html = await response.text();
    if (!response.ok || !html.includes(expectedText)) {
      throw new Error(`Smoke test gagal untuk ${route} (status ${response.status}).`);
    }
    console.log(`OK ${route}`);
  }
  console.log("Smoke test enam halaman berhasil.");
} finally {
  server.kill("SIGTERM");
}
