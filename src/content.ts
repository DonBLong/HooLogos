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
    const clubAImgSrc = `${clubImagesDir}/${clubA}.svg`;
    const clubBImgSrc = `${clubImagesDir}/${clubB}.svg`;
    image.replaceWith(createVsImage(clubAImgSrc, clubBImgSrc));
  });
}

function createVsImage(clubAImgSrc: string, clubBImgSrc: string) {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.justifyContent = "space-evenly";
  wrapper.style.paddingBlock = "4%";
  wrapper.style.background = "gray";
  wrapper.append(...createClubImages(clubAImgSrc, clubBImgSrc));
  return wrapper;
}

function createClubImages(...clubImgSrcs: string[]) {
  return clubImgSrcs.map((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.style.width = "auto";
    img.style.maxWidth = "25%";
    img.style.maxHeight = "100px";
    return img;
  });
}

replaceImages();
