import type { MapActionsMessage } from "./background";
import type { LogosMap } from "./logosmapper";

type StringReplacerMap = [searchValue: string, replaceValue: string][];

const _LOGOS_DIRECTORY = chrome.runtime.getURL("assets/logos");
const _GALLERY_ELEMENT = document.getElementById("gallery");
const _TEAMS_SPLITTER = /\svs?\s/;
const _VS_IMG_ALT_REPLACER_MAP: StringReplacerMap = [
  [" highlights", ""],
  [" ", "-"],
];

replaceImages();
observeChanges(_GALLERY_ELEMENT);

async function replaceImages() {
  const images = [...document.querySelectorAll("img")].filter((image) =>
    image.alt.match(_TEAMS_SPLITTER)
  );
  const logoNames = images.flatMap((image) =>
    formatLogoNames(
      _VS_IMG_ALT_REPLACER_MAP,
      ...image.alt.split(_TEAMS_SPLITTER)
    )
  );
  const logosMap = await updateLogosMap(logoNames);

  images.forEach((image) => {
    const [logoA, logoB] = formatLogoNames(
      _VS_IMG_ALT_REPLACER_MAP,
      ...image.alt.split(_TEAMS_SPLITTER)
    );
    image.replaceWith(
      createVsWrapper(_LOGOS_DIRECTORY, logosMap, logoA, logoB)
    );
  });
}

async function updateLogosMap(logoNames: string[]) {
  return await chrome.runtime.sendMessage<MapActionsMessage, LogosMap>({
    action: "updateMap",
    logoNames: [...logoNames],
  });
}

function createVsWrapper(
  logosDir: string,
  logosMap: Record<string, string[]>,
  ...[logoNameA, logoNameB]: string[]
) {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.justifyContent = "space-evenly";
  wrapper.style.padding = "4%";
  wrapper.style.paddingBottom = "16%";
  wrapper.style.background = "gray";
  const logoA = createLogoLogo(logosDir, logosMap, logoNameA);
  const logoB = createLogoLogo(logosDir, logosMap, logoNameB);
  wrapper.append(logoA, logoB);
  return wrapper;
}

function createLogoLogo(
  logosDir: string,
  logosMap: LogosMap,
  logoName: string
) {
  const img = document.createElement("img");
  const src = `${logosDir}/${Object.keys(logosMap).find((logoFilename) =>
    logosMap[logoFilename].includes(logoName)
  )}`;
  img.src = src;
  img.style.width = "auto";
  img.style.height = "auto";
  img.style.maxWidth = "100%";
  img.style.maxHeight = "100%";
  img.loading = "lazy";
  const imgWrapper = document.createElement("div");
  imgWrapper.style.height = "100px";
  imgWrapper.style.width = "100px";
  imgWrapper.style.display = "flex";
  imgWrapper.style.justifyContent = "center";
  imgWrapper.style.alignItems = "center";
  imgWrapper.append(img);
  return imgWrapper;
}

function formatLogoNames(
  stringsToReplace: StringReplacerMap,
  ...logoNames: string[]
) {
  return logoNames.map((logoName) => {
    stringsToReplace.forEach(
      ([searchValue, replaceValue]) =>
        (logoName = logoName.replaceAll(searchValue, replaceValue))
    );
    return logoName.toLocaleLowerCase();
  });
}

function observeChanges(element: HTMLElement | null) {
  if (!element) return;
  const observer = new MutationObserver(replaceImages);
  observer.observe(element, { childList: true });
}
