# Physics Ledger Discussions Design

## Goal

Turn the article-page discussion placeholder into a durable comment and reply system without adding an application database or a custom account system. Comments must appear below each physics entry, remain attached to the entry's immutable ID, and be manageable from GitHub Discussions.

## Chosen approach

Embed giscus on every routable article and also provide a direct GitHub Discussions search link. Commenters authenticate with GitHub. GitHub Discussions stores comments, replies, reactions, moderation state, and notification activity.

The repository will use a dedicated `Article Responses` discussion category with the Announcements format recommended by giscus. The giscus GitHub App will be granted access only to `rimoooliii/physicsday`.

## Stable article-to-discussion mapping

Each article maps to a discussion using its immutable frontmatter ID, such as `PHYS-2026-07-21-01`.

- giscus mapping: `specific`
- term: article frontmatter `id`
- strict matching: enabled
- category-only search: enabled

Titles, dates, summaries, and slugs may change without disconnecting existing comments. Superseded and withdrawn articles keep their own discussions because they remain durable historical records. Drafts have no public route and therefore no public discussion.

## Repository configuration

Implementation requires these one-time GitHub changes:

1. Enable Discussions for `rimoooliii/physicsday`.
2. Create the `Article Responses` category using the Announcements format.
3. Install the giscus GitHub App for this repository only.
4. Obtain the public repository ID and category ID from the giscus configuration page.

The repository and category IDs are public browser configuration, not secrets. They will be committed in a small typed site configuration module so local builds, CI builds, and production cannot silently diverge. A validation test will require every field and reject an invalid or partial configuration.

Installing the GitHub App changes repository permissions. The implementation must show the requested permission scope and obtain confirmation immediately before the final installation action.

## Article discussion experience

The existing article footer becomes a `Discussion / Response Lab` section containing:

- a short statement that comments are public and require GitHub login;
- an explanation that comments are conversational evidence, not the canonical learning record;
- the embedded giscus thread with replies and main-post reactions enabled;
- the comment editor above the existing thread;
- a direct `Open in GitHub Discussions` link that searches the category for the stable article ID;
- a loading status while the cross-origin giscus frame initializes;
- a retry action and direct GitHub fallback if the script fails or times out;
- a `<noscript>` fallback link for browsers with JavaScript disabled.

The component language remains English to match the current site, but comments can use any language. The visual shell follows the existing ledger typography, rules, and restrained blue/violet accent system. The third-party iframe keeps its supported light theme rather than receiving brittle CSS overrides.

## Loading and failure behavior

The site will load the giscus client only on article pages. A small controller will:

1. show `Loading discussion…`;
2. inject the official `https://giscus.app/client.js` script with fixed configuration;
3. observe creation and load of `.giscus-frame`;
4. mark the region ready when the frame loads;
5. show a recoverable error after a script error or bounded timeout;
6. remove the failed script/frame and retry once when the user selects `Retry`.

The article content, formulas, Markdown endpoint, and JSON endpoint remain independent of giscus. A blocked third-party script must never hide or break the article.

## Direct GitHub entry point

Before a discussion exists, the external link opens a category-scoped Discussions search for the stable article ID. After a first comment creates the thread, the same search leads to the matching discussion. The embedded widget remains the primary posting surface.

## Privacy and moderation

- Comments and GitHub identities are public.
- Posting uses giscus's GitHub OAuth flow; Physics Ledger receives no password or token.
- Moderation, editing, deletion, locking, and notifications are handled in GitHub Discussions.
- No comment text is copied into the static site build or progress metrics.
- The giscus App receives access only to this repository.

## Testing and acceptance

Automated tests will cover:

- complete, valid giscus configuration;
- stable ID mapping rather than title or pathname mapping;
- generated article HTML containing the discussion disclosure, direct fallback URL, loading state, retry control, and giscus configuration;
- safe degradation when the third-party frame is unavailable;
- unchanged generation of article HTML, Markdown, and JSON endpoints.

Final acceptance requires:

1. all existing content, formula, route, and search tests to pass;
2. Astro diagnostics to report no errors or warnings;
3. a production build to succeed;
4. GitHub Discussions and the dedicated category to be visible;
5. the deployed article to load the giscus frame;
6. the direct GitHub fallback to search for the correct article ID;
7. the article to remain usable when giscus is blocked.

## Out of scope

- anonymous or email-only comments;
- a custom database, authentication system, moderation dashboard, or notification service;
- importing comments into progress metrics;
- pre-creating a Discussion for every article before anyone comments;
- changing the rest of the site's information architecture.
