# Play Console — Data Safety form answers

Console path: **Policy → App content → Data safety**

## Does your app collect or share any of the required user data types?
**Yes**

## Data types collected

### Personal info
- **Email address** — collected, used for *Account management* (login), *App functionality*.
  - Is this data shared with third parties? No
  - Is this data processed ephemerally? No
  - Is collection required or optional? Required
  - Encrypted in transit? Yes

### Financial info
- **Other financial info** (your transactions, budgets, categories, notes, and savings goals) — collected, used for *App functionality* only.
  - Shared with third parties? No
  - Processed ephemerally? No
  - Required or optional? Required (this is the app's core purpose)
  - Encrypted in transit? Yes

### Data NOT collected (answer "No"/leave unchecked for all of these)
Location, Web browsing history, App activity/in-app search history, Photos/videos, Audio, Files/docs, Calendar, Contacts, App info & performance (crash logs/diagnostics) — **unless** you later add a crash-reporting SDK (none is currently integrated).

## Security practices
- **Is data encrypted in transit?** Yes (HTTPS/TLS to Supabase)
- **Can users request their data be deleted?** Yes
  - Provide the in-app path: Profile → "Delete my account and all data"
  - Provide the account-deletion web URL (Play Console asks for this too): `https://caludejomingit.github.io/budgetpro/privacy.html`
- **Data handling committed to Play Families Policy?** N/A (app is not directed at children)

## Independent security review
No (unless you've had one — most solo/indie apps answer No here)

---

# Content rating questionnaire (IARC)

Console path: **Policy → App content → Content ratings**

The questionnaire is Google's own IARC form — answer for BudgetPro as follows (a personal finance utility with no user-generated public content, no messaging between users, no gambling, no violence):

| Question category | Answer |
|---|---|
| Violence | None |
| Sexuality | None |
| Language (profanity) | None |
| Controlled substances | None |
| Gambling (simulated or real) | None |
| User-generated content shared with others | No (your data is private to your own account only) |
| Users can communicate with each other | No |
| Shares user location | No |
| App allows purchase of digital goods | No (unless you add in-app purchases later) |

Expected result: **Everyone** (or your region's equivalent lowest rating tier).

---

# Target audience & content

Console path: **Policy → App content → Target audience and content**

- Target age group: **18 and over** (recommended for a personal finance app — avoids extra Families Policy requirements). You can select a broader range if you prefer, but 18+ is simplest since there's no reason a finance-tracking tool needs to target children.
- "Appeal to children" questions: answer **No** throughout.

---

# Ads

Console path: **Policy → App content → Ads**

- Does your app contain ads? **No**
