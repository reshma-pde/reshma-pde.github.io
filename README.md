# Reshma S — portfolio

A static portfolio site for an ASIC physical design engineer. No build step and no dependencies: plain HTML, CSS and JavaScript, hosted on GitHub Pages.

Live site: https://reshma-pde.github.io/

## Files

| Path | What it is |
|---|---|
| `index.html` | All page content (sections, text, links). |
| `css/styles.css` | Styles, fonts and light/dark themes. |
| `js/main.js` | Theme toggle, mobile menu, scroll effects, the die renders and the jargon tooltips. |
| `fonts/` | Self-hosted fonts (Bricolage Grotesque and IBM Plex Sans, Latin subset). |
| `reshma-s-resume.pdf` | The CV the download buttons point to. |
| `404.html` | Shown for any address that doesn't exist. |

## Edit the content

- **Text, jobs, projects, links:** edit `index.html`. Each section has an `id` (`results`, `flow`, `experience`, `skills`, `projects`, `recognition`, `contact`).
- **Jargon tooltips:** the glossary is the `G` list near the end of `js/main.js`. The first mention of each term in Results, Experience, Projects and Recognition gets a dotted underline.
- **Flow stages** (the five-step diagram text): the `stages` list inside `initFlow()` in `js/main.js`.
- **Colours:** the variables at the top of `css/styles.css`. The light theme overrides them under `:root[data-theme="light"]`.
- **Resume:** replace `reshma-s-resume.pdf` and keep the same name, so the links keep working. Visitors save it as `Reshma-S-Physical-Design-Engineer-Resume.pdf`; that name is set by the `download` attribute on the CV links in `index.html`.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish

Pushing to `main` publishes the site (Settings → Pages → Deploy from a branch → `main` / root).

```bash
git add -A && git commit -m "Update site" && git push
```

GitHub Pages caches for up to ten minutes, so a hard refresh may be needed to see changes.

## Naming conventions

- Files: lowercase, hyphens, no spaces, no years or version words (`reshma-s-resume.pdf`).
- Commits: short, imperative, present tense (`Add recognition section`).
- Branch: `main`.

## Notes

- The resume PDF is public. Check it for anything you don't want published (for example a phone number).
- Fonts are open source under the SIL Open Font License.
