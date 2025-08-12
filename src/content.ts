const clubImagesDir = chrome.runtime.getURL("assets/logos");
const galleryElement = document.getElementById("gallery");
if (galleryElement) {
  const observer = new MutationObserver(replaceImages);
  observer.observe(galleryElement, { childList: true, subtree: true });
}
function replaceImages() {
  const images = [...document.querySelectorAll("img")].filter((image) =>
    image.alt.includes(" v ")
  );
  images.forEach((image) => {
    let [clubA, clubB] = image.alt.split(" v ");
    clubA = clubA.toLocaleLowerCase().replaceAll(" ", "-");
    clubB = clubB.split(" highlights").shift() ?? clubB;
    clubB = clubB.toLocaleLowerCase().replaceAll(" ", "-");
    const league =
      image.parentElement?.parentElement
        ?.getElementsByClassName("info")[0]
        .getElementsByTagName("img")[0].alt || "";
    image.replaceWith(
      createVsWrapper(...getClubImgSrcs(clubImagesDir, league, clubA, clubB))
    );
  });
}

function createVsWrapper(...clubImgSrcs: string[]) {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.justifyContent = "space-evenly";
  wrapper.style.paddingBlock = "4%";
  wrapper.style.background = "gray";
  wrapper.append(...createClubImgs(...clubImgSrcs));
  return wrapper;
}

function createClubImgs(...clubImgSrcs: string[]) {
  return clubImgSrcs.map((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.style.width = "auto";
    img.style.maxWidth = "25%";
    img.style.maxHeight = "100px";
    return img;
  });
}

function getClubImgSrcs(
  clubImagesDir: string,
  league: string,
  ...clubs: string[]
) {
  return clubs.map((club) => {
    if (club === "monaco" && league.match(/[lL][(ea)i]gue\s?1/))
      club = "as-monaco";
    return `${clubImagesDir}/${club}.svg`;
  });
}

replaceImages();
