This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. Install dependencies
```bash
yarn install
```

2. Setup HTTP certificates
```bash
yarn dev:setup
```

3. Start the development server in HTTPS mode (HTTPS mode required for the WASM build of Raven to work)
```bash
yarn dev:https
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.


## Working with Markdown and MDX in Next.js
- https://github.com/hashicorp/next-mdx-remote
- https://glama.ai/blog/2024-10-21-rendering-markdown-in-react



## Adding new Integrations/Tools
```bash
yarn add-integration
```
![Add Integration CLI](./docs/assets/add_integration_cli.png)



### WIP Updated OTIO documentation information architecture
- https://github.com/Synopsis/OpenTimelineIO/blob/fixes/documentation_updates/docs/index.rst
- file:///Users/jeff/Downloads/html/python-tutorials/write-an-adapter.html


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

### Check deployments
- https://vercel.com/jeff-hodges-projects/otio-website/deployments