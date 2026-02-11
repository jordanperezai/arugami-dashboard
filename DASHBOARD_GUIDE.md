# Arugami Dashboard Guide

## Overview

The Arugami Dashboard is a **Grid Intelligence Control Center** that provides real-time visibility into your autonomous AI agent ecosystem. It monitors your business automation, tracks agent performance, and shows how well your "Grid" (the network of AI agents and integrations) is running.

Think of it as **mission control for your AI-powered business operations**.

---

## Dashboard Layout

The dashboard is organized into **8 sections** across 4 rows:

### Header
**Brand Identity + Quick Metrics**

### Row 1: Business Status
**Business Overview** | **Integrations**

### Row 2: Grid Performance
**Grid Health** | **Automation Metrics**

### Row 3: Intelligence Analytics
**Skills Usage** | **Activity Trends**

### Row 4: Activity Feed
**Recent Reports** | **Agent Activity**

---

## Section Breakdown

### 🎯 Header Section

**Location:** Top of page

**What it shows:**
- **Client Branding:** Your business logo, name, and brand color
- **Growth Metrics:** Current MRR (Monthly Recurring Revenue)
- **At-a-glance Summary:** One narrative line about today/this week (for example, "Today: grid healthy, 2 agent runs, 1 new report ready.")
- **Progress Indicator:** Grid setup completion percentage
- **Sign Out:** Authentication control

**Why it matters:**
Quick glance at business identity and financial performance, plus a single storyline about how the grid is doing. The MRR shown here gates certain platform features (e.g., $10K MRR unlocks TTC integration).

**Example:**
```
Cubita Café
@cubita-cafe
Today: grid healthy, 2 agent runs, 1 new report ready.
$598,839/mo          PROGRESS: 67%          Sign Out
                     ARUGAMI
```

---

### 📊 Business Overview

**Location:** Row 1, Left

**What it shows:**
- **Status Badge:** Active/Inactive state
- **Joined Date:** When client onboarded to Arugami
- **Client ID:** Unique identifier (for support/debugging)
- **Grid Setup Progress:** Completion percentage of onboarding steps

**Grid Setup Steps:**
1. ✅ Connect your first tool (integrations)
2. ✅ Receive your first report
3. ⬜ Let an AI agent run

**Why it matters:**
Shows your onboarding progress. As you complete setup steps, the Grid becomes more capable. 100% = fully operational autonomous system.

**Color coding:**
- Pink/red progress bar = Cubita brand color
- Progress text shows ratio (e.g., "3/3 - 100%")

---

### 🔌 Integrations

**Location:** Row 1, Right

**What it shows:**
- **Connected Tools:** List of integrated business systems
- **Integration Type:** Toast POS, Mailchimp, GoHighLevel, etc.
- **Status:** Active (green dot) or Inactive (gray dot)

**Current integrations:**
- **Toast POS** - Point of Sale system (fetches sales, inventory, customer data)
- **Mailchimp** - Email marketing platform (sends campaigns, manages contacts)

**Why it matters:**
Integrations are the "senses" of your Grid. More integrations = more data your agents can access = smarter automation. Each integration unlocks new skills for agents to use.

**What "Active" means:**
- API credentials validated
- Connection healthy
- Agents can fetch data from this tool

---

### 🏥 Grid Health

**Location:** Row 2, Left

**What it shows:**
- **Overall Health Score:** 0-100% (composite of agent success + integration health)
- **Last Checked:** Timestamp of most recent health check
- **Agent Success Rate:** Percentage of agent runs that completed successfully (2 of 2 runs = 100%)
- **Integration Health:** Percentage of integrations currently active (2 of 2 = 100%)

**Health calculation:**
```
Overall Health = (Agent Success Rate + Integration Health) / 2
```

**Status indicators:**
- **100% (Green):** Excellent - system running perfectly
- **89% (Green):** System health good
- **50-88% (Yellow):** Degraded performance
- **Below 50% (Red):** Critical - needs attention

**Why it matters:**
Single number that tells you if your automation is healthy. If this drops below 80%, investigate Agent Activity or Integrations to find failures.

**Example states:**
- All integrations active + all agents succeeding = 100%
- 1 integration down + agents running = ~50%
- Integrations OK + agents failing = ~50%

---

### ⚙️ Automation Metrics

**Location:** Row 2, Right

**What it shows:**
- **Grid Load Share:** Percentage of work done by AI vs humans (8% = 8 automated actions out of 100 total)
- **Visual Bar:** Automated (green) vs Manual (gray) work ratio
- **Automated Actions:** Count of skill executions this week (8)
- **Manual Actions:** Estimated human tasks still required (92)
- **Success Rate:** Percentage of automated actions that succeeded (100%)
- **Agent Runs:** Total agent executions this week (2)

**Grid Load Share calculation:**
```
Load Share % = (Automated Actions / Total Potential Actions) × 100
```

**Why it matters:**
Shows your **automation adoption**. As you deploy more agents and skills, this number increases. The goal is to shift more work from "Manual" (you doing it) to "Automated" (agents doing it).

**Growth trajectory:**
- **0-10%:** Early automation (you're here)
- **10-30%:** Significant automation
- **30-50%:** Majority automated
- **50%+:** Highly autonomous business

**Interpretation:**
- 8% automated = 92% of work still manual
- As you add more agent types and run them regularly, this increases
- Goal: Drive this toward 50%+ (agents handle majority of operations)

---

### 🎯 Skills Usage

**Location:** Row 3, Left

**What it shows:**
- **Total Executions:** Count of all skill calls across all agents (6)
- **Integrations Used:** How many of your connected tools were accessed (2/5)
- **Top Skills List:** Most frequently executed skills with:
  - Skill name (e.g., "fetch_customer_data")
  - Integration source (e.g., "GHL CRM")
  - Execution count (how many times called)
  - Success rate (percentage that completed successfully)

**Skill types you might see:**
- `fetch_pos_data` - Pull sales/inventory from Toast POS
- `fetch_customer_data` - Get customer records from CRM
- `generate_email` - Create marketing copy
- `analyze_revenue` - Process financial metrics
- `schedule_campaign` - Queue marketing automation

**Why it matters:**
Shows **which automation capabilities are being used most**. If a skill has low success rate (<80%), that integration may need attention.

**Strategic insight:**
- High-usage skills = valuable automation (invest in improving them)
- Unused integrations = wasted connections (remove or build agents that use them)
- Low success rates = broken skills (debug integration or skill logic)

---

### 📈 Activity Trends

**Location:** Row 3, Right

**What it shows:**
- **7-Day Summary Stats:**
  - Total runs this week (2)
  - Success rate percentage (100%)
  - Trend direction (+0% = stable, +50% = growing)
- **Agent Runs Chart:** Bar graph of daily agent executions
- **Skills Executed Chart:** Bar graph of daily skill calls

**Chart details:**
- X-axis: Last 7 days (labeled as Sat, Sun, Mon, Tue, Wed, Yesterday, Today)
- Y-axis: Count of runs/skills
- Green bars = agent runs
- Blue bars = skills executed
- Height = relative volume

**Trend calculation:**
```
Trend % = ((Last 2 days avg - Previous 2 days avg) / Previous 2 days avg) × 100
```

**Why it matters:**
Shows **momentum** of your automation. Increasing trends mean you're running more agents = more automation adoption. Flat or declining trends mean usage is stagnating.

**What to look for:**
- **Consistent daily runs:** Agents are scheduled and running regularly
- **Increasing trend:** You're deploying more automation over time
- **Spikes:** One-off manual agent triggers (good for testing)
- **Zero days:** Gaps in automation coverage (agents not scheduled those days)

---

### 📋 Recent Reports

**Location:** Row 4, Left

**What it shows:**
- **Report Cards:** List of AI-generated business reports
- **Report Type:** Icon + title (e.g., "Daily Health Report - December 4th")
- **Status Badge:** DAILY HEALTH 808 (score/metric from report)
- **Timestamp:** When report was generated ("Yesterday")

**Report types:**
- **Business Health:** Daily snapshot of sales, trends, opportunities
- **Follow-up Recommendations:** Customer engagement suggestions
- **Analytics Report:** Deep dive on specific metrics

**Why it matters:**
Agents generate reports automatically based on data they analyze. These are **AI-generated insights** delivered to you without manual work.

**Expected cadence:**
- Business Health: Daily (every morning)
- Follow-ups: Weekly or trigger-based
- Analytics: Monthly or on-demand

**How to use:**
Click a report to view full analysis. Reports include:
- Key metrics
- Trends identified
- Recommended actions
- Data sources used

---

### 🤖 Agent Activity

**Location:** Row 4, Right

**What it shows:**
- **This Week Stats:**
  - Total agent runs (2)
  - Success rate (100%)
  - Average execution time (750.0s)
  - Most active agent type ("Follow Up Recommendations")

- **Agent Run Timeline:** Recent agent executions with:
  - Agent type icon + name
  - Description of what the agent did
  - Timestamp (Yesterday, 5 skills used, 600.3s)
  - Status badge (Success/Failed/Running)

**Agent types:**
- **Follow Up Recommendations:** Analyzes customer data, suggests engagement actions
- **Business Health:** Reviews POS/sales data, identifies trends and opportunities

**Status colors:**
- **Green "Success":** Agent completed successfully
- **Red "Failed":** Agent encountered error
- **Yellow "Running":** Agent currently executing

**Why it matters:**
This is your **agent execution log**. Shows what agents ran, when, and if they succeeded. If you see failures here, investigate the logs to debug.

**Performance metrics:**
- **Success rate:** Should stay above 90% for healthy system
- **Avg execution time:** Varies by agent type (30s - 10 min typical)
- **Skills used:** More skills = more complex analysis

---

## Key Metrics Glossary

### Grid Health (100%)
**What:** Overall system wellness score
**Formula:** `(Agent Success Rate + Integration Health) / 2`
**Good:** 80%+ (green)
**Warning:** 50-79% (yellow)
**Critical:** <50% (red)

### Grid Load Share (8%)
**What:** Percentage of work automated vs manual
**Formula:** `(Automated Actions / Total Potential Actions) × 100`
**Early stage:** 0-10%
**Growing:** 10-30%
**Mature:** 30-50%
**Advanced:** 50%+

### Success Rate (100%)
**What:** Percentage of agent runs that completed successfully
**Formula:** `(Successful Runs / Total Runs) × 100`
**Healthy:** 90%+ (green)
**Needs attention:** 80-89% (yellow)
**Critical:** <80% (red)

### Agent Runs
**What:** Count of AI agent executions
**Context:** This week (last 7 days)
**Frequency:** Should increase as you deploy more agents and schedules

### Skills Called
**What:** Individual automation actions executed by agents
**Example:** 1 agent run might call 5 skills (fetch data, analyze, generate report, send email, log results)
**Good ratio:** 3-5 skills per agent run (shows agents are doing multi-step work)

---

## Data Model: How It All Connects

```
User (auth.users)
  └─> client_users (junction table)
       └─> Client (clients table)
            ├─> Integrations (integrations table)
            ├─> Agent Runs (agent_runs table)
            ├─> Reports (reports table)
            └─> Skills Metadata
```

**Authentication flow:**
1. User logs in with email/password (Supabase Auth)
2. Supabase returns session + user ID
3. Dashboard queries `client_users` to find which client you belong to
4. All data filtered by your `client_id` (Row Level Security enforced)

**Multi-tenancy:**
Every table has `client_id` column. RLS policies ensure you only see your client's data. This means multiple businesses can use the same dashboard infrastructure securely.

---

## What to Monitor Daily

### ✅ Green Flags (Healthy System)
- Grid Health at 90%+ (green)
- Success Rate at 95%+ (green)
- Activity Trends showing consistent or increasing runs
- All integrations showing "Active" status
- Recent reports being generated daily

### ⚠️ Yellow Flags (Needs Attention)
- Grid Health 70-89% (yellow)
- Success Rate 80-94% (yellow)
- Flat trends (no growth in automation)
- 1-2 integrations showing "Inactive"
- Missing reports for 2+ days

### 🚨 Red Flags (Critical Issues)
- Grid Health below 70% (red)
- Success Rate below 80% (red)
- Declining trends (automation usage dropping)
- Multiple integrations "Inactive"
- No agent runs for 3+ days
- Multiple "Failed" statuses in Agent Activity

---

## Common Questions

### Why is my Grid Load Share only 8%?
You're in early automation stages. As you:
- Deploy more agent types
- Schedule agents to run more frequently
- Add more integrations (more skills available)
- Let the system handle more tasks autonomously

This number will increase. Target 30%+ within first 3 months.

### What's the difference between Agent Runs and Skills Called?
- **Agent Run:** One execution of an AI agent (e.g., "Business Health" agent)
- **Skills Called:** Individual actions that agent performed (e.g., fetch_pos_data, analyze_revenue, generate_report)

Think of it like: 1 agent run = 1 recipe, skills called = individual cooking steps.

### Why do some skills have 100% success rate and others don't?
Success rate depends on:
- **Integration stability:** If Toast POS API is down, `fetch_pos_data` fails
- **Data availability:** If no customers in CRM, `fetch_customer_data` might return empty
- **Skill complexity:** Multi-step skills have more failure points

Focus on improving low-success skills (<80%) to increase overall Grid Health.

### What does "Most Active Agent" mean?
The agent type that ran the most times this week. In your case, "Follow Up Recommendations" ran more than "Business Health".

### How is MRR calculated?
MRR (Monthly Recurring Revenue) is pulled from your `clients` table in the database. It's manually set per client and represents the total monthly revenue for that business. This is used to:
- Display business performance in header
- Gate certain features (e.g., TTC integration requires $10K+ MRR)
- Track growth over time

---

## Technical Architecture

### Frontend Components

**File locations:** `/apps/arugami-dashboard/app/dashboard/components/`

| Component | File | Purpose |
|-----------|------|---------|
| Dashboard Header | `DashboardHeader.tsx` | Branding, MRR, sign out |
| Business Overview | `ClientOverview.tsx` | Status, setup progress |
| Integrations | `IntegrationStatus.tsx` | Connected tools list |
| Grid Health | `GridHealth.tsx` | System wellness metrics |
| Automation Metrics | `AutomationMetrics.tsx` | Load share visualization |
| Skills Usage | `SkillsUsage.tsx` | Top skills analytics |
| Activity Trends | `ActivityTrends.tsx` | 7-day trend charts |
| Recent Reports | `ReportsFeed.tsx` | AI-generated reports |
| Agent Activity | `AgentActivity.tsx` | Agent execution log |

### Data Fetching

**Pattern:** Server-side data fetching in Next.js 14 App Router

**Location:** `/apps/arugami-dashboard/app/dashboard/page.tsx`

**Flow:**
1. `getClientData()` runs on server
2. Creates Supabase server client with cookies
3. Gets authenticated user from session
4. Queries `client_users` to find user's client
5. Fetches client details, reports, agent runs, integrations
6. Returns data to page component
7. Props passed to child components

**Why server-side:**
- Secure: Database credentials never exposed to client
- Fast: Data fetched before page loads (no loading spinners)
- SEO: Content rendered on server (though dashboard is private)

### Database Schema

**Tables used:**
- `auth.users` - Supabase auth users (email/password)
- `client_users` - Junction table linking users to clients
- `clients` - Business entities (Cubita Café, etc.)
- `integrations` - Connected tools (Toast POS, Mailchimp)
- `agent_runs` - Execution history of AI agents
- `reports` - AI-generated business reports

**Security:** Row Level Security (RLS) policies ensure users only see their client's data

---

## Roadmap Features (Coming Soon)

### Phase 1: Current (Completed ✅)
- ✅ Authentication (Supabase)
- ✅ Multi-tenant data model
- ✅ Dashboard UI with 8 components
- ✅ Grid health monitoring
- ✅ Automation metrics
- ✅ Skills analytics
- ✅ Activity trends

### Phase 2: Real Integrations (Next)
- 🔲 Toast POS API connection
- 🔲 GoHighLevel CRM integration
- 🔲 Mailchimp API setup
- 🔲 Real-time skill execution
- 🔲 Live agent scheduling

### Phase 3: Advanced Features
- 🔲 Agent configuration UI (no-code agent builder)
- 🔲 Custom skill creation
- 🔲 Alert notifications (Slack, email)
- 🔲 Historical trend analysis
- 🔲 Multi-user permissions
- 🔲 Export reports (PDF, CSV)

---

## Support & Documentation

**Dashboard Issues:** Check browser console for errors
**Authentication:** Verify .env.local has correct Supabase credentials
**Data Not Loading:** Check RLS policies in Supabase dashboard
**Integrations:** Ensure API credentials are valid in `integrations` table

**Key files:**
- Dashboard code: `/apps/arugami-dashboard/`
- Database schema: `/PLATFORM ARCHITECTURE/supabase-schema/`
- Brand docs: `/BRANDS/CUBITA/`
- Platform vision: `/ALIGNMENT.MD`

---

**Last Updated:** December 5, 2025
**Version:** 1.0.0
**Author:** Arugami Team
