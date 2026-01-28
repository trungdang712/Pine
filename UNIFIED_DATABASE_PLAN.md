# Plan: Unified Database for Greenfield Dental

## Current State Analysis

### 1. Pine (Marketing Command Center)
- **Database**: SQLite with Prisma ORM
- **Auth**: NextAuth (email/password credentials)
- **User roles**: admin, marketing_manager, content_creator, digital_marketing, graphic_designer, video_producer
- **No team model** - purely role-based

### 2. Quotation Tool
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth
- **User roles**: staff, admin, doctor
- **No team model**

### 3. Dental CRM
- **Database**: PostgreSQL via Supabase (shares with Quotation Tool)
- **Auth**: Supabase Auth (shared)
- **Extends Quotation Tool** with crm_leads and crm_activities

---

## Proposed Unified Architecture

### Option A: Migrate Pine to Supabase (Recommended)
- **Single PostgreSQL database** on Supabase
- **Single auth system** (Supabase Auth)
- All apps share the same user table
- Team-based access control

### Option B: Keep Separate Databases with Shared Auth
- Pine keeps SQLite, Quotation/CRM on Supabase
- Sync users between systems
- More complex, higher maintenance

**Recommendation: Option A** - Full migration to Supabase

---

## Unified User Schema

```sql
-- Enhanced users table with team support
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,

  -- Team assignment (PRIMARY team)
  team TEXT NOT NULL CHECK (team IN ('marketing', 'sales', 'medical', 'admin')),

  -- Role within their team
  role TEXT NOT NULL,
  -- Marketing: marketing_manager, content_creator, digital_marketing, graphic_designer, video_producer
  -- Sales: sales_manager, sales_consultant, quotation_specialist
  -- Medical: doctor, nurse, medical_consultant
  -- Admin: super_admin, clinic_admin

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team memberships (for users with access to multiple teams)
CREATE TABLE user_team_access (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team TEXT NOT NULL CHECK (team IN ('marketing', 'sales', 'medical', 'admin')),
  access_level TEXT DEFAULT 'viewer' CHECK (access_level IN ('viewer', 'member', 'manager')),
  PRIMARY KEY (user_id, team)
);
```

---

## Team Access Matrix

| Team | Primary Users | Apps They Access |
|------|---------------|------------------|
| **marketing** | Content creators, designers, video producers | Pine (Marketing Command Center) |
| **sales** | Sales consultants, quotation specialists | Quotation Tool, CRM |
| **medical** | Doctors, nurses | Medical records (future) |
| **admin** | Super admins | All apps |

---

## Access Rules

### Pine (Marketing Command Center)
```typescript
// Allow access if:
// - user.team === 'marketing' OR
// - user.team === 'admin' OR
// - user has 'marketing' in user_team_access
```

### Quotation Tool & CRM
```typescript
// Allow access if:
// - user.team === 'sales' OR
// - user.team === 'admin' OR
// - user has 'sales' in user_team_access
```

---

## Migration Steps

### Phase 1: Database Setup (Supabase)

1. **Create unified schema** in existing Supabase project (quotation/CRM)
2. **Add team field** to existing users table
3. **Create user_team_access** table
4. **Update existing users** with team = 'sales'

### Phase 2: Migrate Pine Schema to Supabase

1. **Create new tables** for Pine functionality:
   - tasks, task_comments, task_attachments
   - proposals, proposal_comments, approval_steps
   - content_calendar_items
   - brand_assets, assets
   - user_points, achievements, rewards
   - performance_metrics, etc.

2. **Migrate seed data** from Pine's SQLite

### Phase 3: Update Pine App

1. **Replace Prisma with Supabase client**
2. **Replace NextAuth with Supabase Auth**
3. **Update all database queries**
4. **Add team-based access checks**

### Phase 4: Update Quotation/CRM Apps

1. **Add team field checks** to existing apps
2. **Update user queries** to include team

---

## Files to Modify

### Supabase (New Migrations)
```
supabase/migrations/
├── 004_add_team_to_users.sql        # Add team field
├── 005_user_team_access.sql         # Multi-team access
├── 006_pine_tasks_schema.sql        # Pine task management
├── 007_pine_proposals_schema.sql    # Pine proposals
├── 008_pine_calendar_schema.sql     # Pine content calendar
├── 009_pine_assets_schema.sql       # Pine brand assets
├── 010_pine_gamification_schema.sql # Pine gamification
├── 011_pine_performance_schema.sql  # Pine performance
└── 012_pine_rls_policies.sql        # Row-level security
```

### Pine App Changes
```
src/
├── lib/
│   └── supabase.ts                  # NEW: Supabase client
├── server/
│   └── auth/
│       └── config.ts                # UPDATE: Use Supabase Auth
├── app/
│   └── api/
│       └── auth/[...nextauth]/      # REMOVE: Replace with Supabase
└── All database queries             # UPDATE: Use Supabase
```

---

## Initial Users to Create

### Marketing Team (for Pine)
| Email | Name | Team | Role |
|-------|------|------|------|
| admin@greenfield.clinic | Admin | admin | super_admin |
| manager@greenfield.clinic | Marketing Manager | marketing | marketing_manager |
| content@greenfield.clinic | Content Creator | marketing | content_creator |
| designer@greenfield.clinic | Designer | marketing | graphic_designer |
| digital@greenfield.clinic | Digital Marketing | marketing | digital_marketing |
| video@greenfield.clinic | Video Producer | marketing | video_producer |

### Sales Team (for Quotation/CRM)
| Email | Name | Team | Role |
|-------|------|------|------|
| sales@greenfield.clinic | Sales Manager | sales | sales_manager |
| consultant@greenfield.clinic | Sales Consultant | sales | sales_consultant |

---

## Quick Start Alternative

If full migration is too complex, we can do a **quick fix** first:

### Quick Fix: Add Team to Pine Only

1. Add `team` field to Pine's SQLite User model
2. Create marketing team users in Pine
3. Keep apps separate but with consistent user structure
4. Plan full migration later

This allows login to Pine immediately while planning the full migration.

---

## Recommended Approach

**For immediate login capability:**
1. Run Pine's Prisma seed to create users
2. Login with seeded credentials

**For long-term unified database:**
1. Follow the full migration plan above
2. Migrate Pine to Supabase
3. Unify all user management

---

## Timeline Estimate

| Phase | Description | Complexity |
|-------|-------------|------------|
| Quick Fix | Seed Pine DB | ~10 minutes |
| Phase 1 | Unified schema | ~2 hours |
| Phase 2 | Migrate Pine schema | ~4 hours |
| Phase 3 | Update Pine app | ~8 hours |
| Phase 4 | Update Quotation/CRM | ~2 hours |

**Total for full migration: ~16 hours**

---

## Questions for Decision

1. **Proceed with quick fix first** (seed Pine DB for immediate login)?
2. **Full migration to Supabase** for unified database?
3. **Which Supabase project** to use as the unified database?
   - Existing quotation/CRM project?
   - New project?
