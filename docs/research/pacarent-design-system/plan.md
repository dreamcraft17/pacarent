# PacaRent design system research plan

## Decision

Create a distinctive PacaRent visual direction for the public discovery surface: a calm, editorial marketplace for arranging a date or event companion. The design must feel intentional when the marketplace is empty, preserve the mobile-first booking flow, and avoid borrowing the visual language of romantic matching apps.

## Reframe

The design problem is not “make the page prettier.” It is: **How might PacaRent communicate confidence and a clear first action before it has marketplace inventory?**

## Falsifiable hypotheses

1. A purposeful empty state with a direct next action will reduce uncertainty versus a blank/low-information state.
2. A compact app bar and clear content hierarchy will make the desktop discover surface feel like a product rather than a stretched mobile mockup.
3. Booking-oriented language and calendar/check cues will better match the job-to-be-done than heart/match cues.
4. Large touch targets and visible labels will preserve discoverability on mobile without adding heavy UI.

## Scope

- In scope: discover/list page, empty state, app bar, filters, sidebar trust cues, shared tokens.
- Out of scope: backend booking logic, authentication, admin, partner onboarding, native app.

## Evidence strategy

- Primary: existing PacaRent PRD, UX decision, and UI research brief.
- Standards: WCAG 2.2 target size and focus guidance.
- UX practice: Nielsen Norman Group empty-state guidance.
- Platform pattern: Material 3 app bar guidance.

## Adversarial checks

- Could a visual empty state accidentally hide the fact that there are no partners?
- Does the design over-index on visual polish while leaving booking trust unclear?
- Does desktop styling make the mobile flow harder to understand?
- Are labels and controls still understandable without color or icon recognition?

## Stop criteria

- Do not add decorative illustration dependencies.
- Do not introduce a second visual theme in the same route.
- Do not claim partner inventory or verification that the API does not provide.

