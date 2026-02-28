# FirstMover Data — UI Review

**Date:** February 23, 2026  
**Reviewed:** All 9 pages at desktop (1440×900), full-page (1440×5000), and mobile (375×812)

---

## Executive Summary

The site has **strong content and good bones** but suffers from several consistent UI issues that make it feel like a **polished beta rather than a finished product**. The writing is excellent — punchy, data-driven, personality-rich. The design system is 80% there but has gaps in mobile responsiveness, spacing consistency, and a few broken elements.

**Overall vibe:** Somewhere between "talented dev's side project" and "legit Substack competitor." Needs ~20 hours of polish to feel truly professional.

---

## Global Issues (Affect Every Page)

### 🔴 Critical

1. **Mobile text overflow/clipping** — On nearly every mobile screenshot, text is clipped at the right edge. The title "FirstMover Data" gets cut to "FirstMover Dat..." on the homepage. Report title "17,412 apartments hit th..." is clipped. The subtitle "NYC rental market, decod..." is clipped. **This is the #1 issue.** Likely missing `overflow-wrap: break-word` or content exceeding viewport with no horizontal padding.

2. **Mobile horizontal scrollbar** — Visible on salary-calc and rent-check mobile views. A scrollbar appears at the bottom, indicating content overflow. Something is wider than the viewport.

3. **Duplicate navbar on tool pages** — On `/tools/afford` and `/tools/rent-check`, there's a second floating logo icon below the main navbar (visible at top-right area, a small blue FirstMover icon in a white pill). This looks like a duplicate/orphaned component.

### 🟡 Important

4. **Excessive vertical whitespace** — The homepage hero section has way too much padding between the logo/title and the "Latest Report" card. At desktop, there's roughly 300px of dead space. The quiz page is even worse — the full-page screenshot shows the quiz content doesn't appear until halfway down the 5000px capture, suggesting it's pushed way below the fold.

5. **Navbar lacks mobile hamburger menu** — On mobile, the nav links (Reports, Tools, Blog, About, Get the App) are completely hidden. Only the logo shows. There's no hamburger/menu icon. Users on mobile have no navigation.

6. **Footer is minimal to a fault** — "Built by FirstMover · Download the app · Twitter · ben-miz.com" — this is fine for MVP but looks sparse. No email signup, no social icons, no sitemap links.

7. **No favicon visible** — Can't verify from screenshots but worth checking.

### 🟢 Minor

8. **"Get the App" button has no dropdown/context** — Where does the app link go? iOS? Android? Both? A landing page? Users won't know.

9. **No active state on navbar** — When you're on the Blog page, "Blog" in the nav isn't highlighted/underlined. Same for all pages.

---

## Page-by-Page Review

### 1. Homepage (`/`)

**What looks good:**
- Clean hero with logo, title, tagline — classic and effective
- "Latest Report" card with green border is eye-catching
- Tools section with 3 cards is well-organized
- Recent Posts section is clean Substack-style list
- Color palette (#fffaf5 warm white bg) feels inviting

**What looks bad:**
- **Massive dead space** between hero and Latest Report card (~300px gap)
- Hero section takes up the entire above-the-fold viewport with just a logo, title, and subtitle — no call to action, no value proposition beyond 6 words
- "View All Posts →" button is the only teal/dark button and feels disconnected from the blue "Get the App" button — **color inconsistency** between blue (nav CTA) and teal/dark (content CTAs)
- Tool cards have no visual imagery/icons — just text in white cards. They look identical and generic
- **Mobile:** Title clipped, no nav links visible

**Recommendations:**
- Reduce hero padding by 40-50%
- Add a brief value prop or "Subscribe" CTA to the hero
- Add icons/illustrations to the 3 tool cards
- Standardize CTA button colors (pick blue OR teal, not both)

---

### 2. February 2026 Report (`/reports/february-2026`)

**What looks good:**
- Strong headline typography — large, bold, impactful
- Subtitle/subheadline in gray works well
- Stat cards (17,412 / $3,550 / $3,427 / $3,995) are well-designed with good visual hierarchy
- The $3,550 median rent is highlighted in green — nice touch
- Content writing is excellent
- Neighborhood callout box with bold names works great
- Chart section with tabs (All, Studio, 1BR, 2BR, 3BR) is a nice interactive element

**What looks bad:**
- **Map failed to load** — "Map failed to load. Try refreshing." visible in the full-page screenshot. This is a **critical content failure** — the map is a key visual
- The report title sits edge-to-edge on the left with no container — feels misaligned compared to the centered body content below it
- Alternating section backgrounds (white/cream) create subtle stripe effect that's slightly disorienting
- **Mobile:** Title and body text clipped at right edge
- The CTA at the bottom ("Download the app →") feels tacked on

**Recommendations:**
- Fix the map — this should be the visual centerpiece
- Wrap the title in the same max-width container as body content
- Consider adding a table of contents or section anchors for long reports
- Add share buttons (Twitter, copy link)

---

### 3. Find Your Neighborhood Quiz (`/find-your-neighborhood`)

**What looks good:**
- Clean, focused single-question-per-screen approach
- Budget slider with live "$3,000/month" display in teal is great
- Bedroom selection buttons are clean pill shapes
- Progress bar at top (blue line) is good UX

**What looks bad:**
- **Enormous dead space** in the full-page view — the quiz content appears to be pushed way down the page with hundreds of pixels of empty space above and below. The full-page capture shows content doesn't start until ~60% down
- The "Continue" button appears to be **disabled/grayed out** even at initial load — unclear affordance
- Bedroom buttons lack hover states (can't tell from screenshot, but they look flat)
- The blue progress bar at top overlaps/conflicts with the navbar
- **No back button** visible — users can't go to previous step
- **Mobile:** Only logo visible in nav, no way to exit the quiz

**Recommendations:**
- Fix the massive vertical spacing issue — quiz should be vertically centered in viewport
- Make "Continue" button more obviously interactive (or show it as disabled with explanation)
- Add a back button and step indicator ("Step 1 of 3")
- Consider making this a modal/overlay rather than a full page

---

### 4. Salary Calculator (`/tools/afford`)

**What looks good:**
- Clear title and subtitle
- Salary slider with live "$75,000/year" display works well
- Filing status toggle (Single/Married) is clean
- Result section "You can afford up to $156/month" is prominent
- The 40x rule explanation adds credibility

**What looks bad:**
- **Duplicate logo bug** — small blue FirstMover icon appears below the navbar in a white pill, overlapping content
- **"$156/month" seems like a bug or intentionally depressing result** — at $75k salary, $156/month affordable rent seems wrong (should likely be ~$1,562 or the 40x rule result). If intentional, it's confusing without context. (Actually looking closer, it says "$4,138/month take-home" so the math may be showing 40x = $75000/40 = $1,875... but displays $156? Looks like a calculation bug)
- "Loading neighborhoods..." shows in the full-page view — **neighborhoods section failed to load** (likely needs client-side JS that didn't execute in headless)
- Horizontal scrollbar visible at bottom
- **Mobile:** Duplicate logos stacked, text overflow

**Recommendations:**
- Fix duplicate logo component
- Verify the affordability calculation — $156/month on $75k salary looks wrong
- Ensure neighborhoods load (may be an API/JS issue)
- Add explanation of methodology inline

---

### 5. Rent Fairness Checker (`/tools/rent-check`)

**What looks good:**
- Clean form layout — Neighborhood dropdown, Bedrooms toggle, Rent slider
- Bedroom buttons (Studio, 1BR, 2BR, 3BR) are well-styled with active blue state
- Subtitle has personality ("Spoiler: you're probably overpaying")
- Slider displays live "$3,000/month" value in teal

**What looks bad:**
- **Same duplicate logo bug** as salary calculator
- The native `<select>` dropdown for neighborhood looks generic/unstyled — doesn't match the polished feel of the rest
- No result shown without selecting a neighborhood — no placeholder or example
- Horizontal scrollbar on mobile
- **Mobile:** Two logos stacked, subtitle text clipped ("Compare your rent to the median in your neig... Spoiler: you're probably overpaying...")

**Recommendations:**
- Fix duplicate logo
- Replace native select with a styled searchable dropdown (Combobox/Autocomplete)
- Show a default example result or gentle prompt
- Add neighborhood context (how many listings, confidence level)

---

### 6. Blog Index (`/blog`)

**What looks good:**
- Clean, Substack-like article list
- Title, date, read time, excerpt for each post — all the right metadata
- Good typographic hierarchy (bold titles, gray metadata, regular body excerpt)
- Horizontal dividers between posts are subtle and effective
- Left-aligned "Blog" header with subtitle is proper

**What looks bad:**
- **No images/thumbnails** — the blog list is entirely text. Every successful content site uses at least a hero image or thumbnail per post. Looks plain
- **No pagination or "load more"** — only 3 posts visible, seems like that's all there is. What happens with 50 posts?
- No categories, tags, or filters
- No featured/pinned post distinction
- Excessive whitespace between posts (the gap between each article is quite large)
- **Blog page doesn't have a subscribe CTA** anywhere

**Recommendations:**
- Add thumbnail images or hero images to blog cards
- Add a "Subscribe" or "Get notified" CTA at top
- Tighten spacing between posts
- Consider card layout instead of plain list for visual variety
- Add categories/tags for discoverability

---

### 7. Blog: What $2,500 Gets You (`/blog/what-2500-gets-you`)

**What looks good:**
- Excellent content and writing
- Listing cards with images, price, bed/bath info are well-designed
- Green border on listing cards with neighborhood headers
- "Manhattan: Not Found" section with different (beige/tan) styling for the empty result is creative
- Good use of italics for editorial commentary within listing cards
- CTA at bottom ("Want alerts when apartments in your budget hit the market?") is relevant

**What looks bad:**
- **No hero image** — just a title and text. For a visual article about apartments, this needs at least one big eye-catching image at the top
- Listing images are small (~150px wide?) — could be larger for visual impact
- **No "Back to Blog" link** or breadcrumbs
- The "Staten Island" listing is missing from the screenshots (may be there, just below fold) — but the title says "Every NYC Borough" so all 5 should be prominently visible
- No share buttons
- No author byline or avatar

**Recommendations:**
- Add a hero image (composite of the apartments, or a NYC skyline)
- Make listing images larger (at least 300px wide)
- Add breadcrumbs: Blog > What $2,500 Gets You
- Add author info and share buttons
- Add a "Related Posts" section at bottom

---

### 8. Blog: Biggest Rent Drops (`/blog/biggest-rent-drops-january-2026`)

**What looks good:**
- Numbered list with green circle badges (1-10) is excellent visual design
- Each entry shows neighborhood name, price change arrow (→), and delta in green
- "310 listings" count on the right adds credibility
- Listing example cards below the rankings (Lenox Hill, Wingate, Cobble Hill) with real images are compelling
- Writing is sharp and data-driven

**What looks bad:**
- Same issues: no hero image, no breadcrumbs, no share buttons, no author
- The listing example section jumps from the numbered list without a clear transition
- Listing images are tiny thumbnails — hard to see detail
- The numbered badges could have more visual hierarchy (top 3 could be larger/different color)

**Recommendations:**
- Add visual distinction for top 3 (gold/silver/bronze or larger badges)
- Larger listing images
- Consider a bar chart or visual showing the drops instead of just a numbered list

---

### 9. Blog: January 2026 Analysis (`/blog/january-2026-analysis`)

**What looks good:**
- Strong headline: "I Analyzed 17,538 NYC Listings. Here's What I Learned."
- Subheadings break up content well ("The Most Expensive Apartment Will Make You Angry")
- Good conversational tone throughout
- Data points are woven into narrative effectively

**What looks bad:**
- Same pattern: no hero image, no author, no breadcrumbs, no share buttons
- Long-form text with no visual breaks (charts, callouts, pull quotes) gets monotonous
- No table of contents for a 6-minute read
- Couldn't see the full content but likely has same footer CTA pattern

**Recommendations:**
- Add pull quotes or callout boxes for key stats
- Add a chart or two (even simple ones) to break up text
- Table of contents for articles over 5 min read
- Add inline data visualizations

---

## Design System Issues

### Colors
- **Background:** #fffaf5 (warm cream) — ✅ consistent everywhere
- **Text:** Dark/black — ✅ consistent
- **Primary CTA:** Blue (#0066FF-ish) in navbar — used inconsistently
- **Accent:** Teal/green (#00BFA5-ish) for data highlights and some buttons — **conflicts with blue**
- **Issue:** Two competing accent colors (blue for nav/forms, teal for data/CTAs). Pick one or create clear hierarchy

### Typography
- Headlines are bold serif — looks good
- Body text is clean sans-serif — good readability
- **Issue:** Font sizes may be too large on mobile causing overflow
- **Issue:** Line heights on the report intro text (centered block) feel slightly tight

### Components
- **Navbar:** Floating pill design is nice, but needs mobile hamburger menu and active states
- **Cards:** Green-bordered cards (report, listings) are distinctive but the green varies in shade
- **Buttons:** Inconsistent — blue filled, dark filled, green outlined, green filled all appear
- **Sliders:** Clean but could use track fill color
- **Footer:** Too minimal

---

## Priority Fix List

### P0 — Ship Blockers
1. **Fix mobile text overflow** — add proper responsive typography and horizontal padding
2. **Fix mobile navigation** — add hamburger menu
3. **Fix duplicate logo on tool pages** — remove orphaned component
4. **Fix map on report page** — it says "failed to load"
5. **Verify salary calculator math** — $156/month on $75k looks wrong

### P1 — Should Fix Soon
6. Reduce excessive whitespace on homepage hero and quiz page
7. Add hero images to blog posts
8. Replace native `<select>` with styled dropdown on rent checker
9. Standardize button/accent colors (blue vs teal)
10. Add navbar active states

### P2 — Nice to Have
11. Add share buttons to all content pages
12. Add breadcrumbs to blog posts
13. Add author byline/avatar to posts
14. Add blog post thumbnails to index
15. Add "Related Posts" to blog posts
16. Improve footer with email signup, social icons
17. Add table of contents to long articles
18. Add step indicator to quiz ("Step 1 of 3")
19. Add pull quotes/callout boxes in long articles
20. Add icons to homepage tool cards

---

## What to Keep (Don't Change These)

- ✅ The warm cream background — distinctive and cozy
- ✅ The floating pill navbar design — modern and clean
- ✅ The writing tone — punchy, data-driven, personality-rich
- ✅ The stat cards on the report (17,412 / $3,550 etc.)
- ✅ The numbered list design on rent drops blog
- ✅ The listing cards with images and neighborhood headers
- ✅ The green accent for price/data highlights
- ✅ The overall Substack-style blog layout
- ✅ The "Latest Report" card on homepage with green border
- ✅ The interactive tools concept (salary calc, rent check, quiz)

---

## Overall Score: 6.5/10

**Content: 9/10** — The writing and data are genuinely excellent  
**Desktop Design: 7/10** — Clean with some spacing/consistency issues  
**Mobile Design: 3/10** — Broken text overflow, no navigation, horizontal scrolling  
**Interactive Tools: 6/10** — Good concepts, buggy execution  
**Visual Polish: 5/10** — Needs images, better spacing, component consistency  

The site is **one good design sprint away from being really impressive**. The content is already there. The design bones are good. It just needs the mobile fixes, the visual polish (images, icons), and the consistency pass.
