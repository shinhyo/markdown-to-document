/*
 * hooks.js
 *
 * Global test hooks
 */

import axios from "axios";
import fs from "fs/promises";
import { buildDataPath, buildPath } from "./util.js";

/*
 * Create a copy of README.md for use as input test file but with cached images
 * (downloaded to local files) to avoid too many web requests during test cases.
 */
before(async () => {
  const input = await fs.readFile(buildPath("README.md"), { encoding: "utf8" });
  const images = {};
  const output = input.replace(/!\[([^\]]+)]\((https:[^)]+)\)/g, (m, text, url) => {
    images[url] = `./img/${(Math.random() + 1).toString(36).substring(7)}.svg`;
    return `![${text}](${images[url]})`;
  });
  await fs.mkdir(buildDataPath("img"), { recursive: true });
  for (let url of Object.keys(images)) {
    const res = await axios.get(url, { responseType: "blob" });
    await fs.writeFile(buildDataPath(images[url]), res.data);
  }
  await fs.writeFile(buildDataPath("README.md"), output, { encoding: "utf8" });
});

/*
 * Remove generated files.
 */
after(async () => {
  await fs.rm(buildDataPath("img"), { recursive: true });
  await fs.rm(buildDataPath("README.md"));
});
