import { blobToFile } from "@/utils/blobToFile";
import puppeteer from "puppeteer";

export const htmlToImage = async (htmlString: string) => {
  if (!htmlString) {
    return;
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(htmlString);
  const body = (await page.$("body")) ?? (await page.$("div"));

  if (!body) {
    await browser.close();
    return;
  }

  const buffer = await body.screenshot({ encoding: "binary" });
  const blob = new Blob([buffer], { type: "image/png" });
  const newFile = blobToFile(blob, "guide.png");

  await browser.close();
  return newFile;
};
