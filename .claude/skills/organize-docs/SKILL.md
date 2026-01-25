---
name: organize-docs
description: Organize project documentation and scripts into a structured directory layout. Use when organizing files, restructuring docs, cleaning up project structure, or when user asks to organize documentation, scripts, or project files.
allowed-tools: Read, Glob, Grep, Bash(mkdir:*), Bash(git mv:*), Bash(git add:*), Bash(git status:*), Bash(ls:*), Bash(find:*), Edit, Write, TodoWrite
---

# Organize Documentation and Scripts

This skill helps organize project documentation, database scripts, and other auxiliary files into a clean, maintainable directory structure.

## When to Use

Use this skill when:
- User asks to "organize files" or "restructure documentation"
- Project has documentation and scripts scattered in the root directory
- Need to establish a consistent file organization pattern
- Preparing a project for team collaboration or open source release
- User mentions "cleaning up docs", "organizing scripts", or similar

## Directory Structure Pattern

The skill implements this standard structure:

```
project-root/
├── docs/                       # All documentation files
│   ├── README.md              # Documentation index
│   ├── guides/                # User guides and tutorials
│   ├── specs/                 # Specifications and status docs
│   └── testing/               # Test plans, reports, samples
│       └── samples/           # Test sample files
│
├── scripts/                   # Database and utility scripts
│   ├── README.md              # Scripts index and usage guide
│   ├── setup/                 # Initial setup scripts
│   ├── migrations/            # Database migrations and fixes
│   ├── seed/                  # Test data and seed scripts
│   └── utilities/             # Utility and maintenance scripts
│
└── README.md                  # Main project documentation
```

## Step-by-Step Process

### 1. Discovery Phase

First, identify all files that need organizing:

```bash
# Find all documentation files
find . -maxdepth 1 -name "*.md" -not -name "README.md"

# Find all SQL scripts
find . -maxdepth 1 -name "*.sql"

# Find test samples
find . -maxdepth 1 -name "*sample*" -o -name "*SAMPLE*"
```

### 2. Planning Phase

Use TodoWrite to create a task list:

```markdown
- Create directory structure (docs/, scripts/, subdirectories)
- Move documentation files to docs/
- Move scripts to scripts/ subdirectories
- Move test samples to docs/testing/samples/
- Update path references in README.md
- Create index files (docs/README.md, scripts/README.md)
- Create organization documentation
```

### 3. Create Directory Structure

```bash
mkdir -p docs/guides docs/specs docs/testing/samples
mkdir -p scripts/setup scripts/migrations scripts/seed scripts/utilities
```

### 4. Move Files

Use `git mv` to preserve file history:

**Documentation files:**
```bash
# Setup guides
git mv SETUP_GUIDE.md docs/guides/SETUP_GUIDE.md

# Specifications
git mv PROJECT_STATUS.md docs/specs/PROJECT_STATUS.md
git mv CHANGELOG.md docs/specs/CHANGELOG.md

# Test samples (rename to English if needed)
git mv 測試樣本.txt docs/testing/samples/test_sample.txt
```

**Script files by category:**
```bash
# Setup scripts
git mv complete_setup.sql scripts/setup/
git mv verify_setup.sql scripts/setup/

# Migration/fix scripts
git mv fix_*.sql scripts/migrations/

# Seed data scripts
git mv insert_test_*.sql scripts/seed/

# Utility scripts
git mv reset_database.sql scripts/utilities/
```

### 5. Update References

Update all file path references in README.md and other documentation:

**Common patterns to update:**
- `complete_setup.sql` → `scripts/setup/complete_setup.sql`
- `SETUP_GUIDE.md` → `docs/guides/SETUP_GUIDE.md`
- `PROJECT_STATUS.md` → `docs/specs/PROJECT_STATUS.md`
- `CHANGELOG.md` → `docs/specs/CHANGELOG.md`
- Test sample paths

**Update project structure diagram** in README.md to reflect new organization.

### 6. Create Index Files

Create navigation aids for each major directory:

**docs/README.md:**
```markdown
# Documentation Index

## Directory Structure

### guides/ - User Guides
- Setup and installation guides
- Usage tutorials

### specs/ - Specifications
- Project status and roadmap
- Change logs and version history

### testing/ - Testing Resources
- Test plans and reports
- Sample data files

## Quick Links
[List key documents with links]
```

**scripts/README.md:**
```markdown
# Database Scripts Guide

## Directory Structure

### setup/ - Setup Scripts
- Initial database setup
- Schema definitions
- Verification scripts

### migrations/ - Migrations
- Database updates
- Bug fixes and patches

### seed/ - Test Data
- Sample data insertion
- Development fixtures

### utilities/ - Utilities
- Maintenance scripts
- Reset and cleanup tools

## Usage Guide
[Provide usage instructions for each category]
```

### 7. Create Organization Documentation

Create `docs/FILE_ORGANIZATION.md` documenting:
- Organization principles
- Complete directory structure
- File movement log (old → new paths)
- Reference update checklist
- Future file placement guidelines

### 8. Git Workflow

```bash
# Check status
git status

# Add new files
git add docs/README.md scripts/README.md docs/FILE_ORGANIZATION.md

# Commit with descriptive message
git commit -m "Refactor: Organize documentation and scripts structure

- Create docs/ and scripts/ directories with subdirectories
- Move all documentation to docs/ (guides, specs, testing)
- Move all scripts to scripts/ (setup, migrations, seed, utilities)
- Add index files for navigation
- Update all path references in README.md
- Create FILE_ORGANIZATION.md documenting changes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to remote
git push
```

## File Naming Guidelines

### Documentation Files
- Use descriptive, function-based names (not version-based)
- Good: `SETUP_GUIDE.md`, `API_REFERENCE.md`
- Avoid: `v1.0_SETUP.md`, `2024_GUIDE.md`
- Version info goes inside the file

### Script Files
- Use descriptive names indicating purpose
- Good: `complete_setup.sql`, `fix_rls_recursion.sql`
- Group by function, not by date

### Test Samples
- Use English names for better compatibility
- Include file type/purpose in name
- Good: `candidate_import_sample.txt`, `job_data_sample.xlsx`
- Avoid: `樣本檔案.txt`

## Categorization Rules

### docs/guides/
- Setup and installation instructions
- User manuals and tutorials
- How-to guides
- Configuration guides

### docs/specs/
- Project status and roadmap
- Technical specifications
- Architecture documentation
- Change logs and version history
- API documentation

### docs/testing/
- Test plans and strategies
- Test reports and results
- samples/ - Test data files

### scripts/setup/
- Initial database creation
- Schema definitions
- First-time setup scripts
- Setup verification

### scripts/migrations/
- Database schema changes
- Data migrations
- Bug fixes and patches
- Version upgrades

### scripts/seed/
- Test data insertion
- Development fixtures
- Example data

### scripts/utilities/
- Backup and restore
- Database reset
- Maintenance tasks
- Cleanup scripts

## Quality Checklist

Before completing the organization:

- [ ] All files moved to appropriate directories
- [ ] No orphaned files in project root (except core files)
- [ ] All path references updated in documentation
- [ ] Index files created for major directories
- [ ] File organization documented
- [ ] Git history preserved (used `git mv`)
- [ ] All links in documentation verified
- [ ] Test that documentation links work
- [ ] Commit message is descriptive
- [ ] Changes pushed to remote repository

## Examples

### Example 1: Organizing a New Project

```markdown
# Before
project/
├── README.md
├── setup.md
├── status.md
├── changelog.md
├── install.sql
├── schema.sql
├── fix_bug.sql
├── test_data.sql
└── sample.txt

# After
project/
├── README.md
├── docs/
│   ├── README.md
│   ├── guides/
│   │   └── setup.md
│   ├── specs/
│   │   ├── status.md
│   │   └── changelog.md
│   └── testing/
│       └── samples/
│           └── sample.txt
└── scripts/
    ├── README.md
    ├── setup/
    │   ├── install.sql
    │   └── schema.sql
    ├── migrations/
    │   └── fix_bug.sql
    └── seed/
        └── test_data.sql
```

### Example 2: Handling Mixed Language Files

```bash
# Rename non-English files to English during move
git mv 安裝指南.md docs/guides/SETUP_GUIDE.md
git mv 專案狀態.md docs/specs/PROJECT_STATUS.md
git mv 候選人樣本.txt docs/testing/samples/candidate_sample.txt
```

## Common Patterns

### Multi-Environment Scripts

If you have environment-specific scripts:

```
scripts/
├── setup/
│   ├── development/
│   │   └── dev_setup.sql
│   ├── staging/
│   │   └── staging_setup.sql
│   └── production/
│       └── prod_setup.sql
```

### Versioned Documentation

Keep current docs in main directories, archive old versions:

```
docs/
├── guides/
│   ├── SETUP_GUIDE.md          # Current
│   └── archive/
│       └── SETUP_GUIDE_v1.md   # Old version
```

### Language-Specific Documentation

For multi-language projects:

```
docs/
├── en/                          # English
│   └── guides/
├── zh-TW/                       # Traditional Chinese
│   └── guides/
└── README.md                    # Points to language options
```

## Tips

1. **Use git mv**: Preserves file history in version control
2. **Update incrementally**: Move files by category, test, then continue
3. **Check links**: Use a link checker or manually verify important links
4. **Keep README.md current**: Always update the main README with new paths
5. **Document organization**: Create FILE_ORGANIZATION.md for future reference
6. **Test after organizing**: Verify that setup instructions still work with new paths

## Troubleshooting

### Broken Links After Moving

If documentation links break:
1. Use global search to find old path references
2. Update systematically (README.md first, then other docs)
3. Use relative paths (`./docs/` not `/docs/`) for portability

### Git History Lost

If you used `mv` instead of `git mv`:
```bash
# Unstage changes
git restore --staged .

# Use git mv for each file
git mv old_path new_path
```

### Files in Wrong Category

Review categorization rules above. Common mistakes:
- Bug fix scripts → Should be in migrations/, not utilities/
- API documentation → Should be in specs/, not guides/
- Setup verification → Should be in setup/, not utilities/

## Related Skills

This skill works well with:
- `/commit` - For committing the organized structure
- `/review` - For reviewing the organization before committing
- Project initialization skills

---

**Version**: 1.0
**Last Updated**: 2026-01-01
**Tested With**: TriageHR project organization
