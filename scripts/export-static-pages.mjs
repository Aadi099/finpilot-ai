import { cp, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = path.join(root, "dist");
const clientRoot = path.join(distRoot, "client");
const serverEntry = pathToFileURL(path.join(distRoot, "server", "index.js"));

const routes = ["/", "/accounts", "/quick-entry", "/transactions", "/sign-in"];

async function copyClientAssetsToOutputRoot() {
  const entries = await readdir(clientRoot);

  await Promise.all(
    entries.map((entry) =>
      cp(path.join(clientRoot, entry), path.join(distRoot, entry), {
        force: true,
        recursive: true,
      }),
    ),
  );
}

async function fetchAsset(request) {
  const url = new URL(request.url);
  const filePath = path.join(distRoot, decodeURIComponent(url.pathname));

  try {
    const file = await readFile(filePath);
    return new Response(file);
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

async function renderRoute(worker, route) {
  const response = await worker.fetch(
    new Request(`https://finpilot-ai.pages.dev${route}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: fetchAsset },
      IMAGES: undefined,
    },
    {
      passThroughOnException() {},
      waitUntil() {},
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to render ${route}: ${response.status}`);
  }

  const html = await response.text();
  const targetDirectory =
    route === "/" ? distRoot : path.join(distRoot, route.replace(/^\//, ""));

  await mkdir(targetDirectory, { recursive: true });
  await writeFile(path.join(targetDirectory, "index.html"), html);
}

async function writePagesFallback() {
  await writeFile(path.join(distRoot, "_redirects"), "/* /index.html 200\n");
}

await copyClientAssetsToOutputRoot();

const { default: worker } = await import(`${serverEntry.href}?exported=${Date.now()}`);
await Promise.all(routes.map((route) => renderRoute(worker, route)));
await writePagesFallback();

const indexStats = await stat(path.join(distRoot, "index.html"));
console.log(`Exported ${routes.length} routes. Root HTML: ${indexStats.size} bytes.`);
