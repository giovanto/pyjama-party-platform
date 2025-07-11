#!/bin/bash

# 🚂 Pyjama Party Platform - Spelling Correction Script
# Corrects "pajama" to "pyjama" throughout the codebase

echo "🔍 Starting global spelling correction: pajama → pyjama"

# Create backup directory
mkdir -p .backup/$(date +%Y%m%d_%H%M%S)

# Files to update (excluding node_modules, .git, and build directories)
echo "📝 Finding files to update..."
FILES_TO_UPDATE=$(find . -name "*.md" -o -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.sql" | 
  grep -v node_modules | 
  grep -v .git | 
  grep -v .next | 
  grep -v dist | 
  grep -v build)

echo "📋 Files to be updated:"
echo "$FILES_TO_UPDATE"

# Count total occurrences before
echo "🔢 Counting current occurrences..."
TOTAL_BEFORE=$(echo "$FILES_TO_UPDATE" | xargs grep -c "pajama" 2>/dev/null | cut -d: -f2 | paste -sd+ | bc)
echo "Found $TOTAL_BEFORE occurrences of 'pajama'"

# Backup affected files
echo "💾 Creating backups..."
for file in $FILES_TO_UPDATE; do
  if grep -q "pajama" "$file" 2>/dev/null; then
    cp "$file" ".backup/$(date +%Y%m%d_%H%M%S)/$(basename $file).bak"
  fi
done

# Perform replacement
echo "🔄 Performing replacements..."
echo "$FILES_TO_UPDATE" | xargs sed -i 's/pajama/pyjama/g'

# Special cases for URLs and repository names
echo "🔗 Updating URLs and repository names..."
if [ -f "README.md" ]; then
  sed -i 's/pajama-party-platform/pyjama-party-platform/g' README.md
fi

if [ -f "package.json" ]; then
  sed -i 's/pajama-party-v3/pyjama-party-v3/g' package.json
fi

if [ -f "package-lock.json" ]; then
  sed -i 's/pajama-party-v3/pyjama-party-v3/g' package-lock.json
fi

# Count total occurrences after
echo "🔢 Counting final occurrences..."
TOTAL_AFTER=$(echo "$FILES_TO_UPDATE" | xargs grep -c "pyjama" 2>/dev/null | cut -d: -f2 | paste -sd+ | bc)
echo "Now have $TOTAL_AFTER occurrences of 'pyjama'"

# Summary
echo ""
echo "✅ Global spelling correction completed!"
echo "📊 Summary:"
echo "   - Files processed: $(echo "$FILES_TO_UPDATE" | wc -l)"
echo "   - Replacements made: $TOTAL_BEFORE → $TOTAL_AFTER"
echo "   - Backups created in: .backup/$(date +%Y%m%d_%H%M%S)/"
echo ""
echo "🎯 Next steps:"
echo "   1. Review changes: git diff"
echo "   2. Test the application: npm run dev"
echo "   3. Run tests: npm test"
echo "   4. Commit changes: git add . && git commit -m 'feat: correct spelling from pajama to pyjama throughout codebase'"
echo ""
echo "⚠️  Important: Update any external references (GitHub repo name, domain names, etc.)"