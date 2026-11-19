import hero from "@/assets/myanmar-hero-desktop.png.asset.json";
import strategy from "@/assets/myanmar-strategy-home-desktop.png.asset.json";
import creation from "@/assets/myanmar-creation-home-desktop.png.asset.json";
import hero480avif from "@/assets/responsive/hero-480.avif.asset.json";
import hero480webp from "@/assets/responsive/hero-480.webp.asset.json";
import hero768avif from "@/assets/responsive/hero-768.avif.asset.json";
import hero768webp from "@/assets/responsive/hero-768.webp.asset.json";
import hero1200avif from "@/assets/responsive/hero-1200.avif.asset.json";
import hero1200webp from "@/assets/responsive/hero-1200.webp.asset.json";
import strategyhome480avif from "@/assets/responsive/strategy-home-480.avif.asset.json";
import strategyhome480webp from "@/assets/responsive/strategy-home-480.webp.asset.json";
import strategyhome768avif from "@/assets/responsive/strategy-home-768.avif.asset.json";
import strategyhome768webp from "@/assets/responsive/strategy-home-768.webp.asset.json";
import strategyhome1200avif from "@/assets/responsive/strategy-home-1200.avif.asset.json";
import strategyhome1200webp from "@/assets/responsive/strategy-home-1200.webp.asset.json";
import creationhome480avif from "@/assets/responsive/creation-home-480.avif.asset.json";
import creationhome480webp from "@/assets/responsive/creation-home-480.webp.asset.json";
import creationhome768avif from "@/assets/responsive/creation-home-768.avif.asset.json";
import creationhome768webp from "@/assets/responsive/creation-home-768.webp.asset.json";
import creationhome1200avif from "@/assets/responsive/creation-home-1200.avif.asset.json";
import creationhome1200webp from "@/assets/responsive/creation-home-1200.webp.asset.json";

const images = [
  { original: hero.url,
    avif: `${hero480avif.url} 480w, ${hero768avif.url} 768w, ${hero1200avif.url} 1200w`,
    webp: `${hero480webp.url} 480w, ${hero768webp.url} 768w, ${hero1200webp.url} 1200w`,
  },
  { original: strategy.url,
    avif: `${strategyhome480avif.url} 480w, ${strategyhome768avif.url} 768w, ${strategyhome1200avif.url} 1200w`,
    webp: `${strategyhome480webp.url} 480w, ${strategyhome768webp.url} 768w, ${strategyhome1200webp.url} 1200w`,
  },
  { original: creation.url,
    avif: `${creationhome480avif.url} 480w, ${creationhome768avif.url} 768w, ${creationhome1200avif.url} 1200w`,
    webp: `${creationhome480webp.url} 480w, ${creationhome768webp.url} 768w, ${creationhome1200webp.url} 1200w`,
  },
];

// Optimize only our unchanged originals; uploaded/custom CMS media keeps its own URL.
export function responsiveImage(src: string | undefined) {
  if (!src) return undefined;
  let path: string;
  try { path = new URL(src, "https://academy.invalid").pathname; } catch { return undefined; }
  return images.find(image => image.original === path);
}
