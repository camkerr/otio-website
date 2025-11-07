# GitHub Images Solution

## Overview

This document describes the comprehensive solution for dynamically fetching and serving images/diagrams from the OpenTimelineIO GitHub repository's `docs/_static` directory and other documentation paths.

## Architecture

### 1. Image Path Transformation (`src/lib/github-docs.ts`)

The `transformImagePaths()` function converts relative image paths in documentation markdown to absolute GitHub URLs:

**What it handles:**
- Relative paths: `../`_static/image.png`
- Current directory: `./_static/image.png`
- Simple relative: `_static/image.png`
- Both Markdown syntax: `![alt](path)`
- And HTML syntax: `<img src="path">`

**How it works:**
1. Takes the document's path (e.g., `docs/tutorials/quickstart.rst`)
2. Resolves relative image paths based on document directory
3. Converts to absolute GitHub raw URLs: `https://raw.githubusercontent.com/AcademySoftwareFoundation/OpenTimelineIO/main/docs/_static/image.png`

**Example transformation:**
```markdown
// Input (in docs/tutorials/quickstart.rst):
![Diagram](../_static/otio-diagram.png)

// Output:
![Diagram](https://raw.githubusercontent.com/AcademySoftwareFoundation/OpenTimelineIO/main/docs/_static/otio-diagram.png)
```

### 2. RST Image Directive Support (`src/lib/rst-converter.ts`)

Extended the RST-to-Markdown converter to handle ReStructuredText image directives:

**Supported directives:**
```rst
.. image:: _static/diagram.png
   :alt: Diagram description
   :width: 800px

.. figure:: _static/diagram.png
   :alt: Figure description
   
   Caption text for the figure
```

**Conversion:**
- `.. image::` → `![alt](path)`
- `.. figure::` → `![alt](path)` + italic caption

### 3. GitHub Image Proxy API (`src/app/api/github-image/route.ts`)

Enhanced the existing image proxy to:
- Accept GitHub image URLs and fetch them with authentication
- Support multiple image formats (PNG, JPEG, GIF, WebP, SVG, BMP, ICO)
- Infer content types from file extensions when headers don't provide them
- Cache images for 365 days to minimize API requests
- Handle various GitHub domains (raw.githubusercontent.com, user-images, etc.)

**Usage:**
```
GET /api/github-image?url=https://raw.githubusercontent.com/.../image.png
```

### 4. Automatic Proxying (`src/lib/utils.ts`)

The `getProxiedImageUrl()` function automatically detects GitHub URLs and routes them through the proxy:

**Already in place:**
- Detects GitHub domains automatically
- Converts to proxy URL format
- Used by MarkdownRenderer component

### 5. Integration in Documentation Pages (`src/app/docs/[...slug]/page.tsx`)

The doc page now applies image path transformation:

```typescript
// Transform relative image paths to absolute GitHub URLs
const contentWithImages = transformImagePaths(content, doc.githubPath);
```

## Flow Diagram

```
1. Fetch RST/MD from GitHub
   ↓
2. Convert RST to Markdown (if needed)
   ↓ (RST image directives → Markdown syntax)
3. Transform relative image paths to absolute GitHub URLs
   ↓
4. Render Markdown with MarkdownRenderer
   ↓
5. MarkdownRenderer detects GitHub URLs
   ↓
6. Converts to proxy URL: /api/github-image?url=...
   ↓
7. Proxy fetches from GitHub with auth
   ↓
8. Cached response served to browser
```

## Supported Image Formats

- **PNG** - `image/png`
- **JPEG/JPG** - `image/jpeg`
- **GIF** - `image/gif`
- **WebP** - `image/webp`
- **SVG** - `image/svg+xml` (for diagrams)
- **BMP** - `image/bmp`
- **ICO** - `image/x-icon`

## Benefits

1. **Dynamic Updates**: Images automatically update when changed in the GitHub repo
2. **Authentication**: Uses GitHub token to access images (including from private repos if needed)
3. **Caching**: 365-day cache reduces API calls and improves performance
4. **Universal**: Works with both Markdown and RST image syntax
5. **Flexible**: Handles relative, absolute, and various path formats
6. **Transparent**: Works automatically without manual image management

## Files Modified

1. **`src/lib/github-docs.ts`**
   - Added `transformImagePaths()` function

2. **`src/lib/rst-converter.ts`**
   - Added RST image/figure directive conversion

3. **`src/app/api/github-image/route.ts`**
   - Enhanced content type detection
   - Added SVG support

4. **`src/app/docs/[...slug]/page.tsx`**
   - Integrated image path transformation

## Testing

To test the implementation:

1. Find a doc page with images (e.g., tutorials with diagrams)
2. Verify images load correctly
3. Check browser network tab - images should come from `/api/github-image`
4. Verify caching works (subsequent loads should be instant)

## Future Enhancements

Possible improvements:
- Lazy loading for images
- Image optimization (resize, compress)
- Fallback images for broken links
- Image preloading for better UX

