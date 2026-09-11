# Workly AI Assistant

Build a modern internal workplace AI assistant web app called "Workly AI". It should look sleek, minimal, and professional — dark theme, generous spacing, soft rounded cards, subtle gradient accents in blue-to-teal (not purple/orange), and clean sans-serif typography. Think "premium SaaS dashboard," not a cluttered admin panel.

Layout

Top navbar (dark, fixed): logo/brand on the left, horizontal nav links — Dashboard, Email Generator, Notes Summarizer, Task Planner, Research, AI Chat — centered or left-aligned, with a light/dark mode toggle on the right. Highlight the active link. Collapse into a hamburger/mobile menu on small screens.

Small "AI-generated content may require human review" notice shown just below the navbar.

Dashboard (home) page:

Small pill badge above the headline (e.g. "AI-powered workplace assistant") with a sparkle icon.

Hero section: "Your AI workplace assistant" headline, short subtext about automating emails, meetings, planning, and research, with two CTA buttons ("Start with Email" and "Open AI Chat").

Three stat cards below the hero (e.g. hours saved per week, faster response time, % editable/private) — use placeholder metrics.

A "Productivity tools" grid of cards, one per tool, each with an icon, name, one-line description, and an "Open tool →" link.

Core functionality (build all five fully working, not just UI)

All five tools must be fully functional — wire up real AI generation via an LLM API integration for every one of them, not just the first three. Each tool needs its own working hook into the API (reading from an OPENAI_API_KEY environment variable), and each must fall back to a polished demo response if no key is set, so the UI is usable immediately either way.

Smart Email Generator

Form: recipient/context, key points, tone selector (formal, friendly, persuasive)

Generates a polished email draft; editable output box; copy-to-clipboard button

Meeting Notes Summarizer

Text area (or paste) for raw notes/transcript

Outputs: concise summary, extracted action items (with owner if mentioned), key decisions, and deadlines — shown as separate labeled sections

AI Task Planner / Scheduler

Input: list of tasks (with optional deadlines/urgency)

Outputs a prioritized daily or weekly schedule, ranked by urgency and importance, shown as a clean list or simple calendar/timeline view

AI Research Assistant

Input: a topic or pasted article/text

Outputs a summary plus key insights and recommendations

AI Chat

Standard chat interface: message thread with input box at the bottom

Handles open-ended prompts and returns real AI responses in the thread

Style notes

Dark mode as default, with a working light mode toggle

Accent palette: deep navy background with blue-to-teal gradient highlights (avoid purple/orange)

Stronger, more visible borders on cards (not barely-there hairlines) so sections feel distinct

Each tool card has a colored top-border stripe and a small tinted icon badge (alternating blue/teal) so tools read as distinct at a glance

Consistent icon set (outline-style icons) per tool

Rounded corners (lg), soft shadows, gradient highlights used sparingly (buttons, active states, hero text)

Fully responsive — navbar collapses into a hamburger menu on mobile

Empty/loading states for each AI tool while generation is in progress

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eee3ddc6-e0b3-44ee-bf55-177f9a093f0a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
