# 🧠 Planform.ai – Strategy, Summary & Execution Plan

## 🔥 The Problem

- Agencies rely on **manual consultations** to qualify and convert leads
- This creates **friction and delay** between site visit and sale
- Many prospects **bounce or never show** to calls because it’s too big a step
- Existing quiz tools feel **generic and unconvincing**

---

## 😖 Why the Problem Exists

- Services are often **tailored**, so productization feels difficult
- Teams don’t want to list static pricing or “packages” on their sites
- **Sales teams are overloaded** and miss hot leads
- There's no good way to deliver **instant, personalized strategy**

---

## 💡 The Solution – Planform.ai

**A lead conversion tool that creates dynamic, personalized growth plans from your agency’s real service offerings — instantly, on your site.**

### Key Features:
- **Structured intake**: Clients answer 6–10 questions in a friendly, interactive flow
- **Service catalog mapping**: AI maps needs to predefined services
- **Narrative generation**: GPT crafts a compelling, customized pitch
- **Structured outputs**: JSON output allows you to display, store, and follow up cleanly
- **Pricing estimates included**: Transparency without manual work
- **No hallucinations**: GPT only pulls from your defined services
- **Sales-ready handoff**: Clients arrive to calls already qualified, informed, and interested

---

## 🔧 Technical Architecture

- `intake_form` → JSON client profile
- `service_catalog.json` → Your real services with:
  - ID, name, description, outcomes, pricing, when_to_recommend
- `gpt-4o` structured output via `responses.create()`:
  - Returns selected services + justifications
  - Optional: timeline, pricing summary, scope
- Optional scraping (basic site context via `requests + BeautifulSoup`)
- Optional GPT follow-up: narrative summary of the plan

---

## 📦 Example JSON Service Format

```json
{
  "id": "website_rebrand",
  "name": "Luxury Website Redesign",
  "description": "Redesign your website to reflect high-end positioning, improve usability, and elevate perceived value.",
  "outcomes": ["Improved first impressions", "Higher conversion rate", "Consistent luxury aesthetic"],
  "price_range": "$8,000–$15,000",
  "when_to_recommend": [
    "Website feels outdated",
    "Client mentions low conversion rate",
    "Client says brand isn't reflected online"
  ]
}
```
