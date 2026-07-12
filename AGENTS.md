# Kaiyu Select Website Instructions

## Project principles

- Preserve the established Kaiyu Select typography, colours, borders, spacing, header, footer and editorial visual style.
- Do not redesign unrelated pages or sections.
- Use Australian English.
- Do not add stock images, AI-generated images, fake testimonials, fake statistics or unsupported claims.
- Keep Home concise, Engineering service-focused, Products product-focused and Projects evidence-focused.
- Do not present collaborative or academic group work as individual work.
- Describe FEA as preliminary analysis unless formal verification has actually been completed.

## Required workflow after every website change

Do not report completion immediately after the first code change.

After every meaningful website change:

1. Implement the requested change.
2. Run the production build.
3. Fix all build errors.
4. Start or reuse the local development server.
5. Inspect the actual rendered page in a browser.
6. Review the affected pages at:
   - 1440px desktop
   - 1024px laptop
   - 768px tablet
   - 390px mobile
   - 375px mobile
7. Identify high- and medium-priority visual or functional issues.
8. Fix the issues found.
9. Rebuild and inspect again.
10. Repeat the review-and-fix loop until no high- or medium-priority issue remains, with a maximum of four passes.

Stop early when the rendered result is coherent and functional. Do not make unnecessary subjective changes merely to complete four passes.

## Visual review checklist

Inspect the rendered result for:

- overlapping text, lines, icons or decorative elements;
- clipped headings, labels, images or buttons;
- awkward line breaks;
- horizontal overflow;
- text too close to container edges;
- excessive or inconsistent whitespace;
- unequal card heights within the same desktop row;
- misaligned dividers, buttons, tags or detail rows;
- stretched, excessively cropped or undersized images;
- incorrect image fit or position;
- desktop regressions caused by mobile changes;
- mobile regressions caused by desktop changes;
- repeated images or duplicated content;
- inconsistent navigation, footer or CTA wording.

Do not rely only on source-code inspection. Inspect the rendered website.

## Interaction review checklist

Test all affected:

- header and footer links;
- CTA buttons;
- internal anchor links;
- Contact query parameters;
- accordions and details elements;
- open and closed labels and plus/minus states;
- keyboard operation using Tab, Enter and Space;
- visible keyboard focus;
- full-resolution image links;
- mobile navigation;
- image and page routes.

Check for 404 pages, broken image paths and browser console errors.

## Content consistency

Confirm that:

- Engineering describes available services accurately.
- Products does not promise unavailable stock.
- Projects clearly distinguishes completed projects from case studies in preparation.
- Collaborative work and personal contributions are clearly separated.
- Contact links use the appropriate enquiry type and subject parameters.
- Navigation and footer labels remain consistent.
- Location and service coverage statements remain accurate.
- Approved copy is not rewritten without a genuine clarity, grammar or consistency reason.

## Scope control

- Do not modify unrelated pages unless required to prevent a regression.
- Do not deploy unless the user explicitly requests deployment.
- Do not create a new Cloudflare Pages project.
- Do not change the production branch.
- A successful build alone is not proof that the visual result is correct.
- Report issues requiring human design judgement rather than making speculative redesigns.

## Completion report

At the end of each website task, report:

- files changed;
- production build result;
- pages reviewed;
- viewport sizes reviewed;
- interactions tested;
- number of implementation and review passes;
- issues found and corrected;
- remaining items requiring human judgement;
- local preview URL.

Do not simply state that everything looks good without explaining what was tested.
