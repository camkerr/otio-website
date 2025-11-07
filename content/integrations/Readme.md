# How to add a new App/Tool integration

## Adding an Integration

Edit the `integrations.json` file in this directory and add a new entry with the following structure:

```json
{
  "id": "unique-id",
  "type": "app",
  "name": "Integration Name",
  "description": "Brief description of the integration",
  "company": "Company Name",
  "logo": "https://example.com/logo.png",
  "categories": ["Category1", "Category2"],
  "media": [
    {
      "type": "image",
      "url": "/integrations/image.png",
      "isHero": true
    }
  ]
}
```

## Field Descriptions

- **id**: Unique identifier (kebab-case)
- **type**: Either "app" or "tool"
- **name**: Display name of the integration
- **description**: Short description (1-2 sentences)
- **company**: Company or author name
- **logo**: URL to logo image (can be external URL or path to `/public/integrations/`)
- **categories**: Array of category tags
- **media**: Array of images/videos (optional)
  - **type**: "image" or "video"
  - **url**: Path to media file in `/public/integrations/`
  - **isHero**: Boolean to mark the hero/preview image (optional)
  - **thumbnail**: For videos, path to thumbnail image (optional)

## Media Files

Place any images, logos, or videos in `/public/integrations/` and reference them with `/integrations/filename.ext` in the JSON.