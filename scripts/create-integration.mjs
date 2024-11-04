#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import fetch from "node-fetch";

const CONTENT_BASE_PATH = "./content/integrations";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function downloadMedia(url, outputDir, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    
    const buffer = await response.arrayBuffer();
    const extension = path.extname(url) || '.jpg'; // fallback to .jpg if no extension
    const outputPath = path.join(outputDir, `${filename}${extension}`);
    
    await fs.writeFile(outputPath, buffer);
    
    // Return the relative path from the manifest.json location
    return `./${filename}${extension}`;
  } catch (error) {
    console.error(chalk.yellow(`Warning: Failed to download media from ${url}`), error);
    return url; // Fallback to original URL if download fails
  }
}

async function createIntegration() {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "type",
      message: "What type of integration are you creating?",
      choices: ["app", "tool"],
    },
    {
      type: "input",
      name: "name",
      message: "Enter the integration title:",
    },
    {
      type: "input",
      name: "description",
      message: "Enter the integration description in 25 words or less:",
    },
    {
      type: "input",
      name: "company",
      message: "Enter the company name:",
    },
    {
      type: "input",
      name: "logo",
      message: `Enter the app or tool's logo URL:`,
    },
    {
      type: "input",
      name: "categories",
      message: "Enter categories (comma-separated):",
      filter: (input) => input.split(",").map((cat) => cat.trim()),
    },
  ]);

  // Create directory early
  const slugifiedName = slugify(answers.name);
  const outputDir = path.join(CONTENT_BASE_PATH, `${answers.type}s`, slugifiedName);
  await fs.mkdir(outputDir, { recursive: true });

  let media = [];
  
  const { wantMedia } = await inquirer.prompt([
    {
      type: "confirm",
      name: "wantMedia",
      message: "Would you like to add media items?",
      default: false,
    },
  ]);

  if (wantMedia) {
    let addMoreMedia = true;
    while (addMoreMedia) {
      const mediaItem = await inquirer.prompt([
        {
          type: "list",
          name: "type",
          message: "Select media type:",
          choices: ["image", "video"],
        },
        {
          type: "input",
          name: "url",
          message: "Enter remote media URL:",
        },
        {
          type: "input",
          name: "thumbnail",
          message: "Enter remote thumbnail URL (optional):",
          when: (answers) => answers.type === "video",
        },
        {
          type: "confirm",
          name: "isHero",
          message: "Is this the hero media?",
          default: false,
        },
        {
          type: "confirm",
          name: "addAnother",
          message: "Add another media item?",
          default: false,
        },
      ]);

      const { addAnother, ...mediaDetails } = mediaItem;
      
      // Download media and update URLs
      console.log(chalk.blue('Downloading media...'));
      
      // Download main media file
      const mediaFilename = `media-${media.length + 1}`;
      mediaDetails.url = await downloadMedia(
        mediaDetails.url,
        outputDir,
        mediaFilename
      );

      // Download thumbnail if it exists
      if (mediaDetails.thumbnail) {
        mediaDetails.thumbnail = await downloadMedia(
          mediaDetails.thumbnail,
          outputDir,
          `${mediaFilename}-thumb`
        );
      }

      media.push(mediaDetails);
      addMoreMedia = addAnother;
    }
  }

  // Also download the logo
  console.log(chalk.blue('Downloading logo...'));
  answers.logo = await downloadMedia(answers.logo, outputDir, 'logo');

  const integration = {
    ...answers,
    media,
  };

  const outputPath = path.join(outputDir, 'manifest.json');

  try {
    await fs.writeFile(outputPath, JSON.stringify(integration, null, 2));
    console.log(chalk.green(`✓ Successfully created ${outputPath}`));
    console.log(chalk.blue("Integration manifest:"));
    console.log(chalk.gray(JSON.stringify(integration, null, 2)));
  } catch (error) {
    console.error(chalk.red("Error creating integration manifest:"), error);
  }
}

createIntegration().catch(console.error);
