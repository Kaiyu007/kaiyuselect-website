# Preparing an evidence-based case study

This is an editorial template, not a public page or a claim about an existing project. Keep drafts outside `src/pages`. Do not create a route until facts, image permissions and the exact individual contribution are approved.

Use `BaseLayout`, `SectionHeading` and `CaseStudySection` with the established case-study classes. Electric Postie Bike uses the reusable section component and is the working reference. Do not change its academic group attribution.

For each new case study gather verified information for these sections:

1. **Project overview:** context, year, project type (client / academic / personal), permission to share.
2. **Design objectives:** actual brief and documented constraints.
3. **Engineering challenges:** issues supported by project records, not inferred from a render.
4. **Design approach:** the design decisions, software and iterations actually undertaken.
5. **CAD models and technical visuals:** authentic images, captions, alt text and permission. Use `ResponsiveImage`; link technical figures to preserved original files.
6. **Individual contribution:** precisely separate personal work from team work and supplied references.
7. **Deliverables:** files, drawings or prototypes actually produced. Do not imply physical fabrication from a CAD image.
8. **Results and limitations:** supported outcomes and uncertainties. Treat FEA as preliminary unless formal verification is documented; do not invent loads, safety factors or performance results.

`CaseStudySection` accepts `{ number, eyebrow, heading, text, image?, imageAlt?, caption?, note?, expandable?, secondary? }`. Omit unverified sections rather than inserting public placeholders. Keep the project in the technical image gallery until enough context is approved. Add a public URL and a completed-project label only when justified; update the sitemap when a new page is approved.
