export type LogoNameSet = string[];

export interface LogosMap {
  [logoFilename: string]: LogoNameSet;
}

export function createMap(
  [...logoFilenames]: (keyof LogosMap | undefined)[],
  [...logoNamesSets]: (string | undefined)[],
  logoNameSetDelimiter: string = " | "
) {
  return logoFilenames.reduce((logosMap: LogosMap, logoFilename, index) => {
    const logoNameSet = [
      ...new Set(logoNamesSets[index]?.split(logoNameSetDelimiter)),
    ];
    if (logoFilename && logoNameSet[0]) logosMap[logoFilename] = logoNameSet;
    return logosMap;
  }, {});
}

export function updateLogoNameSet(
  logoNameSet: LogoNameSet,
  logoFilename: string,
  map: LogosMap
) {
  const newMap = createNewFromMap(map);
  if (logoNameSet[0]) newMap[logoFilename] = [...new Set([...logoNameSet])];
  return newMap;
}

export function addLogoName(
  logoName: string,
  defaultLogoFilename: string,
  map: LogosMap
) {
  const newMap = createNewFromMap(map);
  const foundLogoFilename = findLogoFilename(logoName, newMap);
  if (!foundLogoFilename && logoName) {
    newMap[defaultLogoFilename] = [
      ...new Set([...newMap[defaultLogoFilename], logoName]),
    ];
  }
  return newMap;
}

export function patchMap(
  logoNames: string[],
  defaultLogoFilename: string,
  map: LogosMap
) {
  return logoNames.reduce((newMap, logoName) => {
    newMap = addLogoName(logoName, defaultLogoFilename, newMap);
    return newMap;
  }, map);
}

export function findLogoFilename(
  logoNameSet: LogoNameSet,
  map: LogosMap
): string | undefined;
export function findLogoFilename(
  logoName: string | string[],
  map: LogosMap
): string | undefined;
export function findLogoFilename(logoName: string | string[], map: LogosMap) {
  return Object.keys(map).find((logoFilename) =>
    logoName instanceof Array
      ? logoName.every((ln) => map[logoFilename].includes(ln))
      : map[logoFilename].includes(logoName)
  );
}

function createNewFromMap(map: LogosMap) {
  const newMap: LogosMap = {};
  Object.entries(map).forEach(([filname, logoNameSet]) => {
    newMap[filname] = [...logoNameSet];
  });
  return newMap;
}
