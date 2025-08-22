import { patchMap, type LogosMap } from "./logosmapper";

export const _MAP_STORAGE_KEY = "logosMap";
export const _MAP_FILE_PATH = "assets/logosmap.json";
export const _DEFAULT_LOGO_FILENAME = "shield-fill.svg";

export interface StorageParams {
  storageKey: string;
  filePath: string;
}

export interface StoredMap {
  [x: StorageParams["storageKey"]]: LogosMap;
}

export interface MapActionGetMap {
  action: "getMap";
}

export interface MapActionSetMap {
  action: "setMap";
  map: LogosMap;
}

export interface MapActionUpdateMap {
  action: "updateMap";
  logoNames: string[];
}

export type MapActionsMessage =
  | MapActionGetMap
  | MapActionSetMap
  | MapActionUpdateMap;

if (chrome.runtime)
  chrome.runtime.onMessage.addListener(function (
    message: MapActionsMessage,
    _,
    sendResponse
  ) {
    switch (message.action) {
      case "getMap":
        getMap(_MAP_STORAGE_KEY, _MAP_FILE_PATH, sendResponse);
        break;
      case "setMap":
        setMap(message.map, _MAP_STORAGE_KEY, sendResponse);
        break;
      case "updateMap":
        updateMap(
          message.logoNames,
          _DEFAULT_LOGO_FILENAME,
          _MAP_STORAGE_KEY,
          _MAP_FILE_PATH,
          sendResponse
        );
        break;
      default:
        sendResponse("Invalid message action");
        break;
    }
    return true;
  });

export async function getMap(
  storageKey: StorageParams["storageKey"],
  filePath: StorageParams["filePath"],
  senResponse?: (response: LogosMap) => void
): Promise<LogosMap> {
  const storageMap = chrome.storage
    ? await chrome.storage.local.get<StoredMap>(storageKey)
    : {};
  let map = storageMap[storageKey];
  if (!map) {
    try {
      const response = await fetch(filePath);
      map = JSON.parse(await response.text());
    } catch (err) {
      console.error(err);
    }
  }
  if (senResponse) senResponse(map);
  return map;
}

export async function setMap(
  map: LogosMap,
  storageKey: StorageParams["storageKey"],
  sendResponse?: (response: string) => void
) {
  if (chrome.storage)
    await chrome.storage.local.set<StoredMap>({ [storageKey]: map });
  const response = "Map was set successfully";
  if (sendResponse) sendResponse(response);
  return response;
}

export async function updateMap(
  logoNames: string[],
  defaultLogoFilename: string,
  storageKey: StorageParams["storageKey"],
  filePath: StorageParams["filePath"],
  sendResponse?: (response: LogosMap) => void
) {
  const map = await getMap(storageKey, filePath);
  await setMap(patchMap(logoNames, defaultLogoFilename, map), storageKey);
  if (sendResponse) sendResponse(await getMap(storageKey, filePath));
}
