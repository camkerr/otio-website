#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import fetch from "node-fetch";

const INTEGRATIONS_JSON_PATH = "./content/integrations/integrations.json";
const PUBLIC_MEDIA_PATH = "./public/integrations";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function downloadMedia(url, integrationId, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    
    const buffer = await response.arrayBuffer();
    const extension = path.extname(url) || '.jpg'; // fallback to .jpg if no extension
    const outputFilename = `${integrationId}-${filename}${extension}`;
    const outputPath = path.join(PUBLIC_MEDIA_PATH, outputFilename);
    
    await fs.mkdir(PUBLIC_MEDIA_PATH, { recursive: true });
    await fs.writeFile(outputPath, Buffer.from(buffer));
    
    // Return the public URL path
    return `/integrations/${outputFilename}`;
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
      message: `Enter the app or tool's logo URL (or press Enter to skip):`,
    },
    {
      type: "input",
      name: "categories",
      message: "Enter categories (comma-separated):",
      filter: (input) => input.split(",").map((cat) => cat.trim()),
    },
  ]);

  // Generate ID
  const integrationId = slugify(answers.name);

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
          default: media.length === 0,
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
        integrationId,
        mediaFilename
      );

      // Download thumbnail if it exists
      if (mediaDetails.thumbnail) {
        mediaDetails.thumbnail = await downloadMedia(
          mediaDetails.thumbnail,
          integrationId,
          `${mediaFilename}-thumb`
        );
      }

      media.push(mediaDetails);
      addMoreMedia = addAnother;
    }
  }

  // Download the logo if provided
  let logo = answers.logo;
  if (logo && logo.trim()) {
    console.log(chalk.blue('Downloading logo...'));
    logo = await downloadMedia(logo, integrationId, 'logo');
  }

  const newIntegration = {
    id: integrationId,
    type: answers.type,
    name: answers.name,
    description: answers.description,
    company: answers.company,
    logo: logo || "",
    categories: answers.categories,
    media,
  };

  try {
    // Read existing integrations
    let integrations = [];
    try {
      const fileContent = await fs.readFile(INTEGRATIONS_JSON_PATH, 'utf-8');
      integrations = JSON.parse(fileContent);
    } catch (error) {
      console.log(chalk.yellow('No existing integrations.json found, creating new file...'));
    }

    // Check for duplicate ID
    const existingIndex = integrations.findIndex(i => i.id === integrationId);
    if (existingIndex !== -1) {
      const { overwrite } = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: `Integration with ID "${integrationId}" already exists. Overwrite?`,
          default: false,
        },
      ]);

      if (overwrite) {
        integrations[existingIndex] = newIntegration;
        console.log(chalk.yellow(`Updated existing integration: ${integrationId}`));
      } else {
        console.log(chalk.red('Operation cancelled.'));
        return;
      }
    } else {
      // Add new integration and sort
      integrations.push(newIntegration);
      integrations.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Write back to file
    await fs.writeFile(
      INTEGRATIONS_JSON_PATH,
      JSON.stringify(integrations, null, 2) + '\n',
      'utf-8'
    );

    console.log(chalk.green(`✓ Successfully added integration to ${INTEGRATIONS_JSON_PATH}`));
    console.log(chalk.blue("\nIntegration details:"));
    console.log(chalk.gray(JSON.stringify(newIntegration, null, 2)));
  } catch (error) {
    console.error(chalk.red("Error creating integration:"), error);
  }
}

createIntegration().catch(console.error);
