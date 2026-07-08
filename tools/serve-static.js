const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 5173);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const decoded = decodeURIComponent(url.pathname);
  const cleanPath = decoded === "/" ? "/index.html" : decoded;
  const filePath = path.normalize(path.join(root, cleanPath));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream"
    });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Suzume static site running at http://localhost:${port}`);
  console.log("Press Ctrl+C to stop.");
});
