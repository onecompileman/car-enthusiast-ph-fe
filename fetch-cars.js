// scrape-autodeal.js
import fs from "fs";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.autodeal.com.ph/cars";

async function scrapeBrandModels(brandSlug) {
  const url = `${BASE_URL}/${brandSlug}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const models = [];
  $(".model-card__title").each((_, el) => {
    models.push($(el).text().trim());
  });

  return models;
}

async function scrapeAllBrands() {
  const res = await fetch(BASE_URL);
  const html = await res.text();
  const $ = cheerio.load(html);

  const dataset = [];

  // Extract brand slugs from brand links
  $(".brand-card a").each(async (_, el) => {
    const brandUrl = $(el).attr("href");
    const brandSlug = brandUrl.split("/").pop();
    const brandName = $(el).find(".brand-card__title").text().trim();

    try {
      const models = await scrapeBrandModels(brandSlug);
      dataset.push({
        make: brandName,
        models: models
      });
      console.log(`Fetched ${models.length} models for ${brandName}`);
    } catch (err) {
      console.error(`Error scraping ${brandName}:`, err.message);
    }
  });

  // Save after delay to ensure async completes
  setTimeout(() => {
    fs.writeFileSync("cars-ph.json", JSON.stringify(dataset, null, 2));
    console.log("cars-ph.json generated successfully!");
  }, 15000);
}

scrapeAllBrands();
