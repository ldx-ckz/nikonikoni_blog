# nikonikoni blog

My personal blog for documenting technical learning, project work, and everyday thoughts.

[Live site](https://miku.nikonikoni.blog/) · [中文](./README.md) · [Issues](https://github.com/ldx-ckz/NiKoNiKoNi_blog/issues)

![nikonikoni blog home page](./docs/images/nikonikoni-home.png)

![nikonikoni blog home-page content](./docs/images/nikonikoni-home-content.png)

> [!NOTE]
> This repository contains the source code for a personal website, not a general-purpose blog template. It will continue to evolve alongside my learning, writing, and site requirements.

## What this repository is

`nikonikoni blog` is a static personal website built with [Astro](https://astro.build/). It serves two purposes:

- publishing technical articles, course notes, and everyday records;
- showcasing project work.

## Major customizations

This project originally evolved from Mizuki and now includes a range of changes made for personal use:

- a dashboard-style home page and article activity view;
- Notes, Technical, and Daily Life content sections;
- custom post cards, categories, tags, archives, and sitemap pages;
- structured project, device, album, diary, and anime pages;
- Pagefind search, RSS/Atom feeds, comments, analytics, and post encryption;
- an optional workflow that separates the code and content repositories.

## Technology stack

- [Astro](https://astro.build/) + TypeScript
- Svelte + Tailwind CSS
- Pagefind
- Expressive Code, KaTeX, and Mermaid
- pnpm

## Local development

Requirements: Node.js 24 LTS or newer and pnpm 10.

```bash
corepack enable
pnpm install
pnpm dev
```

The development server runs at `http://localhost:4321` by default.

Common commands:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm check` | Run Astro checks |
| `pnpm type-check` | Run TypeScript checks |
| `pnpm build` | Build the site and generate the search index |
| `pnpm preview` | Preview the production build locally |
| `pnpm new-post -- <name>` | Create a post |

## Project structure

```text
src/components/   Page and interaction components
src/content/      Posts and introductory content
src/data/         Structured data for projects, devices, albums, and more
src/pages/        Astro pages and routes
public/           Images, fonts, music, and other static assets
scripts/          Content sync, post creation, and font compression scripts
docs/             Architecture, deployment, and maintenance documentation
```

Basic site information and feature switches live in [`src/config.ts`](./src/config.ts). Posts are stored in `src/content/posts/`, while structured page data is stored in `src/data/`.

## Deployment

The production site is deployed at <https://miku.nikonikoni.blog/>. The build command is `pnpm build`, and the output directory is `dist/`.

Before deploying:

1. use repository content by default without setting a sync variable; configure an external content repository and set `ENABLE_CONTENT_SYNC=true` only when needed;
2. configure required secrets on the hosting platform and never commit `.env`;
3. confirm that `siteURL` in `src/config.ts` matches the production domain.

See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for details.

## Origin and acknowledgements

This project was originally built from [LyraVoid/Mizuki](https://github.com/LyraVoid/Mizuki) and has since been continuously modified around my own content organization, home-page experience, site features, and maintenance workflow. Mizuki itself evolved from [Fuwari](https://github.com/saicaca/fuwari).

See [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) for complete third-party attribution and licensing information.

## License

- The site code follows the Apache License 2.0 in [`LICENSE`](./LICENSE), with the upstream MIT license retained in [`LICENSE.MIT`](./LICENSE.MIT).
- Original articles are published under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) by default unless an article states otherwise.
- Images, fonts, music, and other third-party assets remain subject to their respective owners' licenses and are not automatically relicensed by the code license.

## Maintenance record

See [`docs/REPOSITORY_IDENTITY_MIGRATION.md`](./docs/REPOSITORY_IDENTITY_MIGRATION.md) for the migration record from the Mizuki identity to the nikonikoni personal project.
