import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rename, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const repository = "Xenova/distilbert-base-multilingual-cased-ner-hrl";
const revision = "c2a4dbf593c57f47004c5bc2d3770d311aee9c43";
const root = join(dirname(dirname(fileURLToPath(import.meta.url))), "public/models/sycrely/privacy-encoder");
const verifyOnly = process.argv.includes("--verify-only");
const files = [
  ["config.json", 927, "38847be4dc6699b1218a749ed69f888c2ccc7b4deba98e3c4a1cac8cb34d54c8"],
  ["onnx/model_quantized.onnx", 135359829, "24a0b98f4dd4cd92842f5a541272f86f760225a64a29928eddef14bdb2edb986"],
  ["special_tokens_map.json", 125, "b6d346be366a7d1d48332dbc9fdf3bf8960b5d879522b7799ddba59e76237ee3"],
  ["tokenizer.json", 2919362, "bf1b59b7b11c95f194f51708d918eea378e09d05f84c0e1656dc5180e8117088"],
  ["tokenizer_config.json", 373, "2d61ce6c7646881e0e7ef08e3b5dd655a19553ab85c41b1a3c27090a63ff6f49"],
  ["vocab.txt", 995526, "fe0fda7c425b48c516fc8f160d594c8022a0808447475c1a7c6d6479763f310c"],
];

async function digest(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

async function valid(path, expectedBytes, expectedHash) {
  try {
    return (await stat(path)).size === expectedBytes && (await digest(path)) === expectedHash;
  } catch {
    return false;
  }
}

for (const [relativePath, expectedBytes, expectedHash] of files) {
  const destination = join(root, relativePath);
  if (await valid(destination, expectedBytes, expectedHash)) {
    console.log(`verified ${relativePath}`);
    continue;
  }
  if (verifyOnly) throw new Error(`Missing or invalid model file: ${relativePath}`);

  await mkdir(dirname(destination), { recursive: true });
  const temporary = `${destination}.part`;
  await rm(temporary, { force: true });
  const url = `https://huggingface.co/${repository}/resolve/${revision}/${relativePath}`;
  console.log(`fetching ${relativePath}`);
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok || !response.body) throw new Error(`Download failed (${response.status}) for ${relativePath}`);
  await pipeline(Readable.fromWeb(response.body), createWriteStream(temporary, { flags: "wx" }));
  if (!(await valid(temporary, expectedBytes, expectedHash))) {
    await rm(temporary, { force: true });
    throw new Error(`Integrity verification failed for ${relativePath}`);
  }
  await rename(temporary, destination);
  console.log(`verified ${relativePath}`);
}

console.log(`Local model is ready at ${root}`);
