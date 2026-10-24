import fs from "node:fs";

const src = fs.readFileSync("frontend/src/mockData.ts", "utf8");

function extract(name) {
  const start = src.indexOf(`export const ${name}`);
  const eq = src.indexOf("=", start);
  const bracket = src.indexOf("[", eq);
  let depth = 0;
  let quote = null;
  for (let i = bracket; i < src.length; i++) {
    const char = src[i];
    if (quote) {
      if (char === "\\") {
        i += 1;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "[" || char === "{") depth += 1;
    if (char === "]" || char === "}") {
      depth -= 1;
      if (depth === 0) return src.slice(bracket, i + 1);
    }
  }
  throw new Error(`missing ${name}`);
}

const names = ["TERMS", "INITIAL_KNOWN", "AUTHORS", "PATH", "PLACEMENT"];
const body = names.map((name) => `export const ${name} = ${extract(name)};\n`).join("\n");
fs.writeFileSync("backend/src/glossary.js", body);
console.log("glossary bytes", body.length);
