# Organize Documentation Skill

A reusable Claude Code skill for organizing project documentation and scripts into a clean, maintainable directory structure.

## Quick Start

To use this skill, simply mention any of these phrases to Claude:

- "organize the documentation"
- "restructure the project files"
- "clean up the docs and scripts"
- "organize project structure"

Claude will automatically apply this skill and guide you through the organization process.

## What This Skill Does

This skill helps you:

1. **Create a standard directory structure** for docs and scripts
2. **Move files** to appropriate locations using `git mv` (preserves history)
3. **Update path references** in documentation automatically
4. **Create index files** for easy navigation
5. **Document the organization** for future reference
6. **Commit and push** changes to version control

## Directory Structure Created

```
project/
├── docs/                       # All documentation
│   ├── README.md              # Documentation index
│   ├── guides/                # Setup and how-to guides
│   ├── specs/                 # Specifications and status
│   └── testing/               # Test plans and samples
│       └── samples/           # Test data files
│
├── scripts/                   # Database and utility scripts
│   ├── README.md              # Scripts usage guide
│   ├── setup/                 # Initial setup scripts
│   ├── migrations/            # Database migrations
│   ├── seed/                  # Test data scripts
│   └── utilities/             # Maintenance scripts
│
└── README.md                  # Main project documentation
```

## Files Included

- **SKILL.md** - Main skill definition with step-by-step guide
- **EXAMPLES.md** - Real-world examples and use cases
- **README.md** - This file

## How It Works

1. **Discovery**: Scans your project for documentation and script files
2. **Planning**: Creates a todo list for tracking progress
3. **Organization**: Creates directories and moves files
4. **Updates**: Fixes all path references in documentation
5. **Documentation**: Creates index files and organization docs
6. **Git**: Commits and pushes changes

## Example Usage

### Basic Usage

Simply ask Claude:
```
"Please organize the documentation and scripts in this project"
```

Claude will:
- Identify all files that need organizing
- Create the directory structure
- Move files to appropriate locations
- Update references in README.md
- Create navigation index files
- Commit and push changes

### Custom Organization

You can also be specific:
```
"Organize the SQL scripts into setup, migrations, and seed directories"
```

```
"Move all documentation to a docs folder and create an index"
```

## Real-World Example

This skill was used to organize the TriageHR project:

**Before**: 12 files in root directory
**After**: Organized into `docs/` (3 subdirs) and `scripts/` (4 subdirs)
**Files moved**: 11 files
**References updated**: 15+ path references in README.md
**Result**: Clean, navigable structure with index files

See [EXAMPLES.md](./EXAMPLES.md) for detailed before/after comparisons.

## Features

### Smart File Categorization

The skill automatically categorizes files:

- **Setup guides** → `docs/guides/`
- **Project status** → `docs/specs/`
- **Change logs** → `docs/specs/`
- **Test samples** → `docs/testing/samples/`
- **Database setup** → `scripts/setup/`
- **Bug fixes** → `scripts/migrations/`
- **Test data** → `scripts/seed/`
- **Utilities** → `scripts/utilities/`

### Automatic Reference Updates

Updates all paths in:
- README.md
- Other documentation files
- Project structure diagrams
- Setup instructions
- Troubleshooting guides

### Git-Friendly

- Uses `git mv` to preserve file history
- Creates meaningful commit messages
- Stages and commits changes properly
- Pushes to remote automatically

### Documentation

Creates helpful index files:
- `docs/README.md` - Documentation navigation
- `scripts/README.md` - Script usage guide
- `docs/FILE_ORGANIZATION.md` - Organization record

## Best Practices

### When to Use

✅ Use this skill when:
- Project has files scattered in root directory
- Preparing for team collaboration
- Open sourcing a project
- Documentation is hard to navigate
- Scripts are disorganized

❌ Don't use when:
- Project already has good organization
- You have a specific custom structure in mind
- Working with non-standard project types

### Customization

After running the skill, you can:
- Adjust the directory structure
- Add more subdirectories
- Rename files as needed
- The skill provides a foundation you can build on

## Tips

1. **Review before committing**: The skill shows what will change
2. **Test links**: Verify documentation links work after organization
3. **Update gradually**: You can organize in phases (docs first, then scripts)
4. **Customize index files**: Add more navigation aids as needed
5. **Document decisions**: Update FILE_ORGANIZATION.md with project-specific notes

## Supported Project Types

This skill works well for:
- Web applications
- API projects
- Database-driven apps
- Mobile apps
- Libraries and frameworks
- Any project with documentation and scripts

See [EXAMPLES.md](./EXAMPLES.md) for project-type-specific patterns.

## Troubleshooting

### Links Break After Organizing

The skill updates references automatically, but if you find broken links:
1. Search for the old path in all documentation
2. Replace with new relative path
3. Commit the fix

### Files in Wrong Category

Review the categorization rules in SKILL.md and move files:
```bash
git mv docs/guides/wrong_file.md docs/specs/correct_location.md
```

### Want Different Structure

You can modify the structure after running the skill:
1. Create your desired directories
2. Move files using `git mv`
3. Update references
4. Update FILE_ORGANIZATION.md

## Version History

- **v1.0** (2026-01-01): Initial release
  - Based on TriageHR project organization
  - Supports docs and scripts organization
  - Includes comprehensive examples

## Contributing

To improve this skill:
1. Test it on your project
2. Note what works well or could be improved
3. Update SKILL.md with improvements
4. Add new examples to EXAMPLES.md

## Related Skills

This skill works well with:
- Git commit skills
- Code review skills
- Project initialization skills

## License

MIT License - Feel free to use and modify for your projects

---

**Built for**: Claude Code
**Created by**: Claude Sonnet 4.5
**Tested on**: TriageHR project
**Last Updated**: 2026-01-01
