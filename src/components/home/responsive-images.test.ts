import { describe, expect, it } from 'vitest';
import { responsiveImage } from './responsive-images';
import hero from '@/assets/myanmar-hero-desktop.png.asset.json';

describe('managed responsive images', () => {
  it('matches the original relative and absolute image paths', () => {
    const image = responsiveImage(hero.url);
    expect(image?.avif).toContain('480w');
    expect(image?.webp).toContain('1200w');
    expect(responsiveImage(`https://codebase-new-home-journey.lovable.app${hero.url}`)).toEqual(image);
  });
  it('leaves custom CMS images unchanged', () => {
    expect(responsiveImage('https://example.com/owned-image.jpg')).toBeUndefined();
    expect(responsiveImage(undefined)).toBeUndefined();
  });
});