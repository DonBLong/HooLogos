import fs from "fs";

const jsonString = fs.readFileSync("country-flags/countries.json", "utf-8");

const obj = JSON.parse(jsonString);

const countriesDirents = fs.readdirSync("public/countries", {
  encoding: "utf-8",
  withFileTypes: true,
});

countriesDirents.forEach((dirent) => {
  if (dirent.isFile()) {
    const abr = dirent.name.split(".")[0];
    const name = obj[abr.toUpperCase()]
      .toLowerCase()
      .replaceAll(",", "")
      .replaceAll(" ", "-");
    fs.renameSync(`public/countries/${dirent.name}`, `${name}.svg`);
  }
});
