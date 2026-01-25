# Organization Examples and Use Cases

This document provides detailed examples of using the organize-docs skill in various scenarios.

## Real-World Example: TriageHR Project

### Initial State

```
TriageHR/
├── README.md
├── SUPABASE_SETUP_GUIDE.md
├── PROJECT_STATUS.md
├── CHANGELOG.md
├── complete_setup.sql
├── supabase_schema.sql
├── verify_setup.sql
├── fix_rls_recursion.sql
├── fix_existing_users.sql
├── insert_test_job.sql
├── reset_database.sql
└── 候選人匯入樣本_SAMPLE.txt
```

### Organized State

```
TriageHR/
├── README.md
├── docs/
│   ├── README.md
│   ├── FILE_ORGANIZATION.md
│   ├── guides/
│   │   └── SETUP_GUIDE.md
│   ├── specs/
│   │   ├── PROJECT_STATUS.md
│   │   └── CHANGELOG.md
│   └── testing/
│       └── samples/
│           └── candidate_import_sample.txt
└── scripts/
    ├── README.md
    ├── setup/
    │   ├── complete_setup.sql
    │   ├── supabase_schema.sql
    │   └── verify_setup.sql
    ├── migrations/
    │   ├── fix_rls_recursion.sql
    │   └── fix_existing_users.sql
    ├── seed/
    │   └── insert_test_job.sql
    └── utilities/
        └── reset_database.sql
```

### Command Sequence

```bash
# 1. Create directory structure
mkdir -p docs/guides docs/specs docs/testing/samples
mkdir -p scripts/setup scripts/migrations scripts/seed scripts/utilities

# 2. Move documentation files
git mv SUPABASE_SETUP_GUIDE.md docs/guides/SETUP_GUIDE.md
git mv PROJECT_STATUS.md docs/specs/PROJECT_STATUS.md
git mv CHANGELOG.md docs/specs/CHANGELOG.md
git mv 候選人匯入樣本_SAMPLE.txt docs/testing/samples/candidate_import_sample.txt

# 3. Move SQL scripts
git mv complete_setup.sql scripts/setup/
git mv supabase_schema.sql scripts/setup/
git mv verify_setup.sql scripts/setup/
git mv fix_rls_recursion.sql scripts/migrations/
git mv fix_existing_users.sql scripts/migrations/
git mv insert_test_job.sql scripts/seed/
git mv reset_database.sql scripts/utilities/

# 4. Create index files
# (Create docs/README.md and scripts/README.md)

# 5. Update references in README.md
# (Update all path references)

# 6. Commit and push
git add docs/README.md scripts/README.md docs/FILE_ORGANIZATION.md README.md
git commit -m "Refactor: Organize documentation and scripts structure"
git push
```

### Path Reference Updates

In README.md, update these references:

| Old Path | New Path |
|----------|----------|
| `complete_setup.sql` | `scripts/setup/complete_setup.sql` |
| `SUPABASE_SETUP_GUIDE.md` | `docs/guides/SETUP_GUIDE.md` |
| `PROJECT_STATUS.md` | `docs/specs/PROJECT_STATUS.md` |
| `CHANGELOG.md` | `docs/specs/CHANGELOG.md` |
| `候選人匯入樣本_SAMPLE.txt` | `docs/testing/samples/candidate_import_sample.txt` |
| `insert_test_job.sql` | `scripts/seed/insert_test_job.sql` |
| `fix_rls_recursion.sql` | `scripts/migrations/fix_rls_recursion.sql` |
| `verify_setup.sql` | `scripts/setup/verify_setup.sql` |
| `reset_database.sql` | `scripts/utilities/reset_database.sql` |

## Example 2: API Project Organization

### Scenario
Backend API project with multiple types of scripts and documentation.

### Before
```
api-project/
├── README.md
├── api-docs.md
├── deployment.md
├── schema-v1.sql
├── schema-v2.sql
├── migrate-v1-to-v2.sql
├── seed-users.sql
├── seed-products.sql
├── backup.sh
├── test-api.sh
└── sample-requests.json
```

### After
```
api-project/
├── README.md
├── docs/
│   ├── README.md
│   ├── guides/
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   └── API_REFERENCE.md
│   └── testing/
│       └── samples/
│           └── sample-requests.json
└── scripts/
    ├── README.md
    ├── setup/
    │   ├── schema-v1.sql
    │   └── schema-v2.sql
    ├── migrations/
    │   └── migrate-v1-to-v2.sql
    ├── seed/
    │   ├── seed-users.sql
    │   └── seed-products.sql
    └── utilities/
        ├── backup.sh
        └── test-api.sh
```

### Organization Decisions

**Documentation:**
- `api-docs.md` → `docs/guides/API_REFERENCE.md` (usage guide)
- `deployment.md` → `docs/guides/DEPLOYMENT_GUIDE.md` (deployment guide)
- `sample-requests.json` → `docs/testing/samples/` (test data)

**Scripts:**
- `schema-*.sql` → `scripts/setup/` (initial setup)
- `migrate-*.sql` → `scripts/migrations/` (version migrations)
- `seed-*.sql` → `scripts/seed/` (test data)
- `*.sh` utilities → `scripts/utilities/` (maintenance tools)

## Example 3: Multi-Language Documentation

### Scenario
Project with documentation in multiple languages.

### Structure
```
project/
├── README.md                    # Language switcher
├── docs/
│   ├── README.md               # Documentation index
│   ├── en/                     # English docs
│   │   ├── guides/
│   │   │   └── SETUP.md
│   │   └── specs/
│   │       └── API.md
│   ├── zh-TW/                  # Traditional Chinese
│   │   ├── guides/
│   │   │   └── SETUP.md
│   │   └── specs/
│   │       └── API.md
│   └── testing/                # Shared test resources
│       └── samples/
└── scripts/                    # Shared scripts (language-agnostic)
```

### README.md Structure
```markdown
# Project Name

[English](./docs/en/) | [繁體中文](./docs/zh-TW/)

## Quick Start

- [English Setup Guide](./docs/en/guides/SETUP.md)
- [繁體中文設定指南](./docs/zh-TW/guides/SETUP.md)
```

## Example 4: Large Project with Many Scripts

### Scenario
Enterprise project with extensive database scripts.

### Structure
```
enterprise-app/
├── docs/
│   └── (standard structure)
└── scripts/
    ├── README.md
    ├── setup/
    │   ├── 01-create-database.sql
    │   ├── 02-create-tables.sql
    │   ├── 03-create-views.sql
    │   ├── 04-create-functions.sql
    │   └── 05-create-triggers.sql
    ├── migrations/
    │   ├── 2024/
    │   │   ├── 01-add-user-roles.sql
    │   │   └── 02-update-permissions.sql
    │   └── 2025/
    │       └── 01-add-audit-log.sql
    ├── seed/
    │   ├── development/
    │   │   ├── seed-users.sql
    │   │   └── seed-test-data.sql
    │   ├── staging/
    │   │   └── seed-demo-data.sql
    │   └── production/
    │       └── seed-initial-data.sql
    └── utilities/
        ├── backup/
        │   ├── backup-full.sh
        │   └── backup-incremental.sh
        ├── maintenance/
        │   ├── vacuum.sql
        │   └── reindex.sql
        └── monitoring/
            └── check-health.sql
```

### Naming Convention
- Setup scripts: Numbered for execution order (`01-`, `02-`, etc.)
- Migrations: Dated folders with numbered scripts
- Seed data: Environment-specific subdirectories
- Utilities: Grouped by function

## Example 5: Moving from Monolithic to Organized

### Before (Monolithic Structure)
```
project/
├── docs/
│   ├── everything.md           # 5000+ lines
│   └── more-stuff.md          # 3000+ lines
└── scripts/
    └── all-scripts.sql         # 10000+ lines
```

### After (Progressive Organization)
```
project/
├── docs/
│   ├── README.md
│   ├── guides/
│   │   ├── GETTING_STARTED.md
│   │   ├── INSTALLATION.md
│   │   └── CONFIGURATION.md
│   ├── specs/
│   │   ├── ARCHITECTURE.md
│   │   ├── DATABASE_SCHEMA.md
│   │   └── API_SPEC.md
│   └── testing/
│       ├── TEST_PLAN.md
│       └── samples/
└── scripts/
    ├── setup/
    │   ├── create-database.sql
    │   └── create-schema.sql
    ├── migrations/
    │   └── (split by feature)
    ├── seed/
    │   └── (split by data type)
    └── utilities/
        └── (split by function)
```

### Process
1. **Analyze**: Identify logical sections in monolithic files
2. **Extract**: Break into focused, single-purpose files
3. **Organize**: Place in appropriate directories
4. **Link**: Create navigation in README files
5. **Deprecate**: Keep old files temporarily with "DEPRECATED" notice

## Common Patterns

### Pattern 1: Setup Script Ordering

```
scripts/setup/
├── 00-prerequisites.sql        # Check requirements
├── 01-database.sql            # Create database
├── 02-schema.sql              # Create schema
├── 03-tables.sql              # Create tables
├── 04-indexes.sql             # Create indexes
├── 05-constraints.sql         # Add constraints
├── 06-views.sql               # Create views
├── 07-functions.sql           # Create functions
├── 08-triggers.sql            # Create triggers
└── 09-permissions.sql         # Set permissions
```

### Pattern 2: Migration Versioning

```
scripts/migrations/
├── v1.0-to-v1.1/
│   ├── 01-add-columns.sql
│   └── 02-migrate-data.sql
├── v1.1-to-v1.2/
│   ├── 01-new-tables.sql
│   └── 02-update-views.sql
└── rollback/
    ├── v1.1-to-v1.0.sql
    └── v1.2-to-v1.1.sql
```

### Pattern 3: Environment-Specific Documentation

```
docs/
├── guides/
│   ├── SETUP.md               # Generic setup
│   ├── SETUP-DEVELOPMENT.md   # Dev-specific
│   ├── SETUP-STAGING.md       # Staging-specific
│   └── SETUP-PRODUCTION.md    # Prod-specific
└── specs/
    ├── ARCHITECTURE.md
    └── environments/
        ├── development.md
        ├── staging.md
        └── production.md
```

## Tips for Different Project Types

### Web Applications
- Add `docs/api/` for API documentation
- Add `docs/deployment/` for deployment guides
- Consider `scripts/deploy/` for deployment scripts

### Mobile Apps
- Add `docs/platforms/ios/` and `docs/platforms/android/`
- Add `docs/testing/devices/` for device compatibility info

### Microservices
- Organize by service: `docs/services/auth/`, `docs/services/api/`
- Shared docs in `docs/shared/`

### Libraries
- Add `docs/api/` for API reference
- Add `docs/examples/` for code examples
- Add `docs/migration/` for version migration guides

---

**Note**: These examples are based on real-world organization scenarios. Adapt patterns to fit your project's specific needs.
