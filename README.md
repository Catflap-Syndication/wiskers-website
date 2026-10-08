# wiskers website

The canonical website source lives in this folder. The rest of the Tabby vault is not part of the website and must not be uploaded.

## Local preview

Run `npm ci`, then `npm run dev`. Run `npm run build` to create the static publishing folder `dist/`.

## Contact

Website domain: https://wiskers.click. Customer contact: hello@wiskers.click. The similarly spelled whiskers.click is not our domain.

## Publishing

Prepared for a static host such as Cloudflare Pages (free tier). Build command: `npm run build`. Output folder: `dist`. No runtime server or secret keys are required. A direct upload of the built dist folder also works.

GitHub can store this website source as its own repository, without uploading the vault. GitHub Pages is not the selected host because its usage rules restrict online business hosting. Configure wiskers.click with the selected hosting project and preserve the existing email DNS records when changing nameservers.

## Content basis

Copy is based on Archive/Navigation/TABBY.md, Areas/Clients.md, and the Data Room Company Overview and Offering notes. The business is at an early stage. No client logos, outcome statistics, pricing or established publisher network are claimed.

## Asset attribution

The cat is “cartoon 3D cat” by berti_buchsbaum, licensed CC BY 4.0. Public attribution and modification details appear in the website footer; the original license is retained in public/assets/license.txt. Head motion and independent eye tracking are adapted from the supplied geometry. Frame and flap are procedural.

## Thesis visual

The From reading to doing section adapts the supplied flow diagram into a responsive comparison with three explorable steps. Quantified bounce and ROI statements from the reference are omitted pending evidence. The mechanism is presented as a working thesis.

## Color schemes

Day, Night and Twilight can be selected in the header. Selection persists locally; the initial default follows system light/dark preference. `src/themes.css` defines all semantic colors, including the scene materials. `src/palette-v1.json` holds the approved v1 palette.
