// src/lib/scraperService.js
import axios from "axios";
import * as cheerio from "cheerio";

export async function runScraper(scraperConfig) {
  const logs = [];
  const results = [];

  try {
    logs.push({
      timestamp: new Date(),
      status: "info",
      message: `Starting scraper for ${scraperConfig.url}`,
    });

    // Fetch the webpage
    const response = await axios.get(scraperConfig.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    logs.push({
      timestamp: new Date(),
      status: "success",
      message: `Successfully fetched page: ${response.status}`,
    });

    // Parse the HTML - Changed from const to let
    let $ = cheerio.load(response.data);

    // Extract data based on selectors
    const items = [];

    // If pagination is configured, handle it
    if (scraperConfig.paginationSelector) {
      let currentPage = 1;
      let hasNextPage = true;

      while (hasNextPage && currentPage <= 10) {
        // Limit to 10 pages to prevent infinite loops
        logs.push({
          timestamp: new Date(),
          status: "info",
          message: `Processing page ${currentPage}`,
        });

        // Extract data from current page
        const pageItems = extractDataFromPage($, scraperConfig.selectors);
        items.push(...pageItems);

        // Check if there's a next page
        const nextPageLink = $(scraperConfig.paginationSelector).attr("href");
        if (nextPageLink) {
          const nextPageUrl = nextPageLink.startsWith("http")
            ? nextPageLink
            : new URL(nextPageLink, scraperConfig.url).href;

          logs.push({
            timestamp: new Date(),
            status: "info",
            message: `Found next page: ${nextPageUrl}`,
          });

          // Fetch the next page
          const nextPageResponse = await axios.get(nextPageUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
          });

          // Update cheerio instance with new page
          const newPage = cheerio.load(nextPageResponse.data);
          let $ = newPage; // Now this works since $ is declared with let

          currentPage++;
        } else {
          hasNextPage = false;
          logs.push({
            timestamp: new Date(),
            status: "info",
            message: "No more pages found",
          });
        }
      }
    } else {
      // Single page scraping
      const pageItems = extractDataFromPage($, scraperConfig.selectors);
      items.push(...pageItems);
    }

    logs.push({
      timestamp: new Date(),
      status: "success",
      message: `Scraping completed. Found ${items.length} items.`,
    });

    return { results: items, logs };
  } catch (error) {
    logs.push({
      timestamp: new Date(),
      status: "error",
      message: `Error during scraping: ${error.message}`,
    });

    throw error;
  }
}

function extractDataFromPage($, selectors) {
  const items = [];

  // Find all elements that match the first selector
  const firstSelector = selectors[0];
  if (!firstSelector || !firstSelector.selector) return items;

  const elements = $(firstSelector.selector);

  // Extract data from each element
  elements.each((index, element) => {
    const item = {};

    // Extract data for each selector
    selectors.forEach((selectorConfig) => {
      if (!selectorConfig.name || !selectorConfig.selector) return;

      let value;

      if (index === 0) {
        // For the first selector, use the current element
        value = extractValue($(element), selectorConfig.attribute);
      } else {
        // For other selectors, find elements relative to the current element
        const relativeElement = $(element).find(selectorConfig.selector);
        if (relativeElement.length > 0) {
          value = extractValue(
            relativeElement.first(),
            selectorConfig.attribute,
          );
        }
      }

      item[selectorConfig.name] = value;
    });

    items.push(item);
  });

  return items;
}

function extractValue(element, attribute) {
  switch (attribute) {
    case "text":
      return element.text().trim();
    case "href":
      return element.attr("href");
    case "src":
      return element.attr("src");
    case "alt":
      return element.attr("alt");
    case "data-price":
      return element.data("price");
    default:
      return element.attr(attribute);
  }
}
