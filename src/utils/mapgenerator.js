import { readFileSync, readdirSync, writeFileSync } from "fs";
const _LOGOS_DIR = "public/assets/logos";
const _MAP_PATH = "public/assets/logosmap.json";
const map = JSON.parse(readFileSync(_MAP_PATH, "utf-8"));
const logos = readdirSync(_LOGOS_DIR, {
    encoding: "utf-8",
    withFileTypes: true,
});
logos.forEach((logo) => {
    map[logo.name] ??= [logo.name.split(".")[0]];
});
writeFileSync(_MAP_PATH, JSON.stringify(map), "utf-8");
