const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");

const required = [
  "assets/styles.css",
  "assets/app.js"
];

for (const rel of required) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing wired asset: ${rel}`);
  }
}

const ids = [
  "bgc",
  "loading",
  "lpct",
  "lbar",
  "abtn",
  "awav",
  "navd",
  "dimov",
  "dimc",
  "chovl",
  "land",
  "map",
  "chars",
  "story",
  "door",
  "cine",
  "end",
  "sceneCanvas",
  "chnav",
  "endc"
];

for (const id of ids) {
  if (!html.includes(`id="${id}"`)) {
    throw new Error(`Missing required DOM id: ${id}`);
  }
}

const app = fs.readFileSync(path.join(root, "assets", "app.js"), "utf8");
const handlers = [
  "beginJ",
  "closeChar",
  "closeDim",
  "handleDoorClick",
  "hidePop",
  "nextCh",
  "openChar",
  "prevCh",
  "replay",
  "scrollTo1",
  "showPop"
];

for (const handler of handlers) {
  if (!app.includes(handler)) {
    throw new Error(`Missing handler wiring: ${handler}`);
  }
}

const eventAttributes = html.matchAll(/\son[a-z]+="([^"]*)"/g);
for (const match of eventAttributes) {
  const source = match[1]
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
  try {
    // Compiles inline event snippets without executing browser behavior.
    new Function(source);
  } catch (error) {
    throw new Error(`Inline handler does not compile: ${source}\n${error.message}`);
  }
}

console.log("Static wiring check passed.");
