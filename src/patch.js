/*
 * Patch NPM dependencies after package installation.
 */

const path = require("path");
const files = require("./files");

// Patch GitHub Markdown CSS (Highlight.js compatibility + tweaks)
const githubPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "github-markdown-css",
  "github-markdown.css"
);
files.readAllText(githubPath).then(css => {
  css = css
    .replace(/\.markdown-body/g, "body")
    .replace(/(list-style-type: lower-.*;)/g, "/* $1 */")
    .replace("\n  padding: 16px;\n}", "\n  padding: 16px !important;\n}");
  return files.writeAllText(githubPath, css);
});