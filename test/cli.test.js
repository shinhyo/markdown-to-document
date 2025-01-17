import fsp from "fs/promises";
import util from "util";
import childProcess from "child_process";
import { assert } from "chai";

import * as files from "../src/files.js";
import { buildPath } from "./util.js";

const exec = util.promisify(childProcess.exec);
const cli = buildPath("src/cli.js");

describe("CLI", () => {
  describe("mdtodoc", () => {
    it("should fail without argument", async () => {
      try {
        await exec(`node ${cli}`);
        assert.fail();
      } catch (e) {
        assert.isOk(e);
        assert.equal(e.code, 1);
        assert.isEmpty(e.stdout);
        assert.include(e.stderr.toString(), "missing required argument");
      }
    });
  });

  describe("mdtodoc -h/--help", () => {
    it("should display help (-h)", async () => {
      const { stdout } = await exec(`node ${cli} -h`);
      assert.include(stdout.toString(), "Usage");
    });
    it("should display help (--help)", async () => {
      const { stdout } = await exec(`node ${cli} --help`);
      assert.include(stdout.toString(), "Usage");
    });
  });

  describe("mdtodoc -V/--version", () => {
    it("should output the version number (-V)", async () => {
      const { stdout } = await exec(`node ${cli} -V`);
      assert.match(stdout.toString(), /[0-9]+\.[0-9]+\.[0-9]+/g);
    });
    it("should output the version number (--version)", async () => {
      const { stdout } = await exec(`node ${cli} --version`);
      assert.match(stdout.toString(), /[0-9]+\.[0-9]+\.[0-9]+/g);
    });
  });

  describe("mdtodoc doc.md", () => {
    it("should compile a Markdown file", async () => {
      const src = buildPath("CHANGELOG.md");
      const dst = buildPath("CHANGELOG.html");
      const { stdout } = await exec(`node ${cli} ${src}`);
      assert.include(stdout.toString(), "CHANGELOG.html");
      assert.isTrue(await files.exists(dst));
      await fsp.unlink(dst);
    });
    it("should handle errors", async () => {
      const src = buildPath("LICENSE");
      try {
        await exec(`node ${cli} ${src}`);
        assert.fail();
      } catch (e) {
        assert.isOk(e);
        assert.equal(e.code, 1);
        assert.isEmpty(e.stdout);
        assert.include(e.stderr.toString(), "Error:");
      }
    });
  });

  describe("mdtodoc doc.md --watch", () => {
    it("should watch a Markdown file", async () => {
      const src = buildPath("CHANGELOG.md");
      try {
        await exec(`node ${cli} ${src} --watch`, { timeout: 3000 });
        assert.fail();
      } catch (e) {
        assert.include(e.stdout.toString(), "[watch]");
      }
    });
  });
});
