// @ts-check
import { expect, test } from '@playwright/test';

test.describe('desktop article layout', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('keeps the article title visually restrained', async ({ page }) => {
    await page.goto('/blog/成為自己/正念的意義就在手中/');

    const title = page.locator('.post-single .post-title');
    await expect(title).toBeVisible();

    const metrics = await title.evaluate((element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        fontSize: Number.parseFloat(style.fontSize),
        fontWeight: Number.parseInt(style.fontWeight, 10),
        width: rect.width,
      };
    });

    expect(metrics.fontSize).toBeGreaterThanOrEqual(34);
    expect(metrics.fontSize).toBeLessThanOrEqual(42);
    expect(metrics.fontWeight).toBeLessThanOrEqual(760);
    expect(metrics.width).toBeLessThanOrEqual(700);
  });

  test('shrinks portrait lead covers on desktop', async ({ page }) => {
    await page.goto('/blog/電影心得/媽的多重宇宙01/');

    const cover = page.locator('article.post-single > figure.entry-cover');
    await expect(cover).toBeVisible();
    await expect(cover).toHaveClass(/entry-cover--portrait/);

    const box = await cover.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeLessThanOrEqual(650);
  });
});

test.describe('desktop taxonomy layout', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('uses stable vertical cards for tag featured articles', async ({ page }) => {
    await page.goto('/tags/閱讀心得/');

    const firstCard = page.locator('.taxonomy-featured-grid .taxonomy-featured-entry').first();
    await expect(firstCard).toBeVisible();

    const title = firstCard.locator('.entry-header h2');
    const cover = firstCard.locator('.entry-cover');
    const cardBox = await firstCard.boundingBox();
    const titleBox = await title.boundingBox();
    const coverBox = await cover.boundingBox();

    expect(cardBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    expect(coverBox).not.toBeNull();
    expect(cardBox.width).toBeGreaterThanOrEqual(220);
    expect(titleBox.width).toBeGreaterThan(160);
    expect(coverBox.width).toBeGreaterThan(160);
    expect(coverBox.height).toBeGreaterThan(120);
  });

  test('uses category-style story cards for tag archive articles', async ({ page }) => {
    await page.goto('/tags/閱讀心得/');

    const archive = page.locator('.taxonomy-article-list');
    await expect(archive).toBeVisible();
    await expect(archive.locator('.category-entry')).toHaveCount(0);
    await expect(archive.locator('.taxonomy-story-year')).not.toHaveCount(0);

    const firstCard = archive.locator('.taxonomy-story-card').first();
    await expect(firstCard).toBeVisible();

    const media = firstCard.locator('.taxonomy-story-card__media');
    const body = firstCard.locator('.taxonomy-story-card__body');
    const title = firstCard.locator('.taxonomy-story-card__title');
    const mediaBox = await media.boundingBox();
    const bodyBox = await body.boundingBox();
    const titleBox = await title.boundingBox();

    expect(mediaBox).not.toBeNull();
    expect(bodyBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    expect(mediaBox.width).toBeGreaterThan(180);
    expect(bodyBox.width).toBeGreaterThan(500);
    expect(titleBox.width).toBeGreaterThan(400);
  });
});
