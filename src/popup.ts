import { _MAP_FILE_PATH, _MAP_STORAGE_KEY, getMap, setMap } from "./background";
import { createMap, type LogosMap } from "./logosmapper";
import "./bootstrap.min.css";

const _LOGOS_DIRECTORY = "assets/logos/";
const _LOGOS_MAP = await getMap(_MAP_STORAGE_KEY, _MAP_FILE_PATH);
const _ELEMENT_LOGOS_MAP_CONTAINER =
  document.getElementById("logosMapContainer");
const _ELEMENT_LOGOS_MAP_ENTRY_TEMPLATE = document.getElementById(
  "logosMapEntryTemplate"
);
const _ELEMENT_LOGO_DATASET_KEY = "logo";
const _ELEMENT_LOGO_NAMES_DATASET_KEY = "logoNames";
const _ELEMENT_MAP_ENTRY_DATASET_KEY = "mapEntry";
const _ELEMENT_LOGO_SELECTOR = toCSSSelector(_ELEMENT_LOGO_DATASET_KEY);
const _ELEMENT_LOGO_NAMES_SELECTOR = toCSSSelector(
  _ELEMENT_LOGO_NAMES_DATASET_KEY
);
const _ELEMENT_MAP_ENTRY_SELECTOR = toCSSSelector(
  _ELEMENT_MAP_ENTRY_DATASET_KEY
);
const _ELEMENT_MAP_FILTER = document.getElementById("mapFilter");
const _ELEMENT_POPOUT = document.getElementById("popOut");
const _ELEMENT_SAVE_MAP = document.getElementById("saveMap");
const _ELEMENT_BRAND = document.getElementById("brand");

if (window.name === "newWindow") {
  _ELEMENT_POPOUT?.remove();
  _ELEMENT_SAVE_MAP?.classList.add("order-1");
  _ELEMENT_BRAND?.classList.remove("text-center");
}

viewMap(
  _ELEMENT_LOGOS_MAP_CONTAINER,
  _LOGOS_MAP,
  _LOGOS_DIRECTORY,
  _ELEMENT_LOGOS_MAP_ENTRY_TEMPLATE,
  _ELEMENT_LOGO_DATASET_KEY,
  _ELEMENT_LOGO_NAMES_DATASET_KEY
);

const _ELEMENTS_LOGOS = [...document.querySelectorAll(_ELEMENT_LOGO_SELECTOR)];
const _ELEMENTS_LOGO_NAMES = [
  ...document.querySelectorAll(_ELEMENT_LOGO_NAMES_SELECTOR),
];
const _ELEMENTS_MAP_ENTRIES = [
  ...document.querySelectorAll(_ELEMENT_MAP_ENTRY_SELECTOR),
];

_ELEMENT_MAP_FILTER?.addEventListener("input", filterMap);
_ELEMENTS_LOGO_NAMES.forEach((element) =>
  element.addEventListener("input", updateLogoNamesDataset)
);
_ELEMENT_SAVE_MAP?.addEventListener("click", updateMap);
_ELEMENT_POPOUT?.addEventListener("click", popOut);

function viewMap(
  logosMapContainer: HTMLElement | unknown,
  ...createMapViewParams: Parameters<typeof createMapView>
) {
  if (!(logosMapContainer instanceof HTMLElement)) return;
  logosMapContainer.append(...createMapView(...createMapViewParams));
}

async function updateMap() {
  const logoFilenames = _ELEMENTS_LOGOS.map((element) => {
    if (!(element instanceof HTMLElement)) return;
    return element.dataset[_ELEMENT_LOGO_DATASET_KEY]
      ?.split(_LOGOS_DIRECTORY)
      .pop();
  });
  const logoNameSets = _ELEMENTS_LOGO_NAMES.map((element) => {
    if (!(element instanceof HTMLElement)) return;
    return element.dataset[_ELEMENT_LOGO_NAMES_DATASET_KEY];
  });
  const logosMap = createMap(logoFilenames, logoNameSets);
  const response = await setMap(logosMap, _MAP_STORAGE_KEY);
  console.log(response);
  downloadMap(logosMap);
}

function downloadMap(map: LogosMap, filename?: string) {
  const mapBlob = new Blob([JSON.stringify(map)], {
    type: "applications/json",
  });
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(mapBlob);
  downloadLink.download = filename || "logosmap.json";
  downloadLink.style.display = "none";
  document.body.append(downloadLink);
  downloadLink.click();
  URL.revokeObjectURL(downloadLink.href);
  downloadLink.remove();
}

function createMapView(
  logosMap: LogosMap,
  logosDir: string,
  logosMapEntryTemplate: HTMLTemplateElement | unknown,
  logoElementDatasetKey: Parameters<HTMLElement["querySelector"]>[number],
  logoNamesElementDatasetKey: Parameters<HTMLElement["querySelector"]>[number],
  logoNamesDelimiter: string = " | "
) {
  if (!(logosMapEntryTemplate instanceof HTMLTemplateElement)) return "";
  return Object.entries(logosMap).map(([logoFilename, logoNameVariations]) => {
    const logoURL = `${logosDir}${logoFilename}`;
    const templateContent = logosMapEntryTemplate.content;
    const logoElement = templateContent.querySelector(
      toCSSSelector(logoElementDatasetKey)
    );
    if (!(logoElement instanceof HTMLElement)) return "";
    logoElement.dataset[logoElementDatasetKey] = logoURL;
    if (logoElement instanceof HTMLImageElement) logoElement.src = logoURL;
    else logoElement.style.backgroundImage = `url(${logoURL})`;
    const logoNamesElement = templateContent.querySelector(
      toCSSSelector(logoNamesElementDatasetKey)
    );
    if (!(logoNamesElement instanceof HTMLElement)) return "";
    logoNamesElement.id = logoFilename.split(".")[0];
    const logoNames = logoNameVariations.join(logoNamesDelimiter);
    logoNamesElement.dataset[logoNamesElementDatasetKey] = logoNames;
    const logoNamesView = logoNames.replaceAll(/(?<=\D)-(?=\D)/g, " ");
    if (logoNamesElement instanceof HTMLInputElement)
      logoNamesElement.value = logoNamesView;
    else logoNamesElement.textContent = logoNamesView;
    return templateContent.cloneNode(true);
  });
}

function filterMap(e: Event) {
  _ELEMENTS_LOGO_NAMES.forEach((element, index) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    if (!(element instanceof HTMLElement)) return;
    const filterCriteria = e.target.value.toLocaleLowerCase();
    const teamNameVariations =
      element instanceof HTMLInputElement ? element.value : element.textContent;
    _ELEMENTS_MAP_ENTRIES[index].classList.toggle(
      "d-none",
      !teamNameVariations?.includes(filterCriteria)
    );
  });
}

function updateLogoNamesDataset(e: Event) {
  if (!(e.target instanceof HTMLInputElement)) return;
  e.target.dataset[_ELEMENT_LOGO_NAMES_DATASET_KEY] = e.target.value
    .split(" | ")
    .map((v) => v.replaceAll(" ", "-"))
    .join(" | ");
}

function popOut() {
  open(
    location.href,
    "newWindow",
    `height=${outerHeight + 30},width=${
      outerWidth + 20
    },left=${screenLeft},top=${screenTop}`
  );
  close();
}

function toCSSSelector(datasetKey: string) {
  return `[data-${datasetKey.replace(
    /(?<=[a-z])([A-Z][a-z]*)/g,
    (matched) => `-${matched.toLocaleLowerCase()}`
  )}]`;
}
