# Prompts Organization Guide

**Last Updated**: 2025-12-25 20:59:00 IST

---

## 📋 Overview

All LLM prompts are stored in **centralized TypeScript files** in the `src/prompts/` directory, organized by stage.

---

## 📁 File Structure

```
src/
├── prompts/
│   ├── prompts.stage1.ts        ← ALL Stage 1 prompts
│   ├── prompts.stage2.ts        ← ALL Stage 2 prompts (future)
│   ├── prompts.stage3.ts        ← ALL Stage 3 prompts (future)
│   └── ...
│
├── services/
│   ├── intent/
│   │   ├── intent.service.ts    ← Imports from prompts.stage1.ts
│   │   ├── intent.schema.ts
│   │   └── ...
│   ├── queries/
│   │   ├── queries.service.ts   ← Imports from prompts.stage2.ts
│   │   └── ...
│   └── ...
```

---

## 📝 Prompts File Format

Each `prompts.stageN.ts` file contains:
- **Prompt constants** as exported variables
- **Helper functions** to build dynamic prompts
- **Clear comments** for each prompt

### Example: `prompts.stage1.ts`

```typescript
/**
 * STAGE 1: INTENT DECOMPOSITION - ALL PROMPTS
 */

// ============================================
// PROMPT 1: SYSTEM PROMPT
// ============================================
export const SYSTEM_PROMPT = `You are an expert...`;

// ============================================
// PROMPT 2: USER PROMPT TEMPLATE
// ============================================
export const USER_PROMPT_BASE = `Analyze the following...`;

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUserPrompt(abstract: string, preferences?: any): string {
  // Build dynamic prompt
}
```

---

## 🎯 Benefits of This Approach

✅ **Centralized**: All prompts in `src/prompts/` directory
✅ **One File Per Stage**: Easy to find all prompts for a stage
✅ **TypeScript**: Type safety, autocomplete, refactoring support
✅ **Exported Constants**: Easy to import and use
✅ **Helper Functions**: Build dynamic prompts with variables
✅ **Version Control**: Clear diffs when prompts change
✅ **No File I/O**: No runtime file reading, better performance

---

## ✏️ How to Edit Prompts

### Step 1: Open the prompts file
```
src/prompts/prompts.stage1.ts
```

### Step 2: Find the prompt constant
```typescript
export const SYSTEM_PROMPT = `...`;
```

### Step 3: Edit the template literal
Change the text inside the backticks

### Step 4: Save
TypeScript will recompile and server will reload!

---

## 🔧 How Services Use Prompts

Services import prompts from the centralized files:

```typescript
// In intent.service.ts
import { SYSTEM_PROMPT, buildUserPrompt } from '../../prompts/prompts.stage1';

// Use in code
const systemPrompt = SYSTEM_PROMPT;
const userPrompt = buildUserPrompt(abstract, preferences);
```

---

## 📋 Current Prompts

### Stage 1: Intent Decomposition
**File**: `src/prompts/prompts.stage1.ts`

**Exported Constants**:
- `SYSTEM_PROMPT` - Defines the LLM's role
- `USER_PROMPT_BASE` - Basic user prompt template
- `USER_PROMPT_WITH_PREFERENCES` - User prompt with preferences
- `REFINEMENT_PROMPT` - For refining extracted intent

**Helper Functions**:
- `buildUserPrompt(abstract, preferences?)` - Build user prompt dynamically
- `buildRefinementPrompt(extractedIntent)` - Build refinement prompt

### Stage 2: Query Generation (Coming Soon)
**File**: `src/prompts/prompts.stage2.ts`

**Exports**: TBD

---

## 🚀 Adding New Prompts

### To add a new prompt to an existing stage:

1. Open `src/prompts/prompts.stage1.ts`
2. Add a new exported constant:

```typescript
// ============================================
// PROMPT 5: NEW PROMPT NAME
// ============================================
export const NEW_PROMPT = `Your prompt text here...`;
```

3. Import and use in service:
```typescript
import { NEW_PROMPT } from '../../prompts/prompts.stage1';
```

### To create prompts for a new stage:

1. Create `src/prompts/prompts.stage2.ts`
2. Follow the same format:

```typescript
/**
 * STAGE 2: QUERY GENERATION - ALL PROMPTS
 */

export const SYSTEM_PROMPT = `...`;
export const USER_PROMPT = `...`;

export function buildQueryPrompt(...) {
  // Helper function
}
```

3. Import in the service:
```typescript
import { SYSTEM_PROMPT, buildQueryPrompt } from '../../prompts/prompts.stage2';
```

---

## 💡 Naming Conventions

### File Names:
- Format: `prompts.stageN.ts` where N is the stage number
- Examples: `prompts.stage1.ts`, `prompts.stage2.ts`

### Constant Names:
- Use UPPERCASE_WITH_UNDERSCORES
- Be descriptive: `SYSTEM_PROMPT`, `USER_PROMPT_BASE`, `REFINEMENT_PROMPT`

### Function Names:
- Use camelCase
- Start with verb: `buildUserPrompt`, `buildRefinementPrompt`

---

## 📊 Example: Complete Stage 1 Prompts File

```typescript
/**
 * STAGE 1: INTENT DECOMPOSITION - ALL PROMPTS
 */

export const SYSTEM_PROMPT = `You are an expert...`;

export const USER_PROMPT_BASE = `Analyze the following...`;

export const USER_PROMPT_WITH_PREFERENCES = `Analyze the following...
Additional context:
{PREFERENCES}`;

export function buildUserPrompt(abstract: string, preferences?: any): string {
  if (!preferences) {
    return USER_PROMPT_BASE.replace('{ABSTRACT}', abstract);
  }
  
  const preferencesText = buildPreferencesText(preferences);
  return USER_PROMPT_WITH_PREFERENCES
    .replace('{ABSTRACT}', abstract)
    .replace('{PREFERENCES}', preferencesText);
}
```

---

## 🔍 Finding Prompts

### By Stage:
- Stage 1: `src/prompts/prompts.stage1.ts`
- Stage 2: `src/prompts/prompts.stage2.ts`
- Stage 3: `src/prompts/prompts.stage3.ts`
- etc.

### By Name:
Search for `export const PROMPT_NAME` in the file

---

## ⚠️ Important Rules

1. **Use template literals**: Use backticks `` ` `` for multi-line prompts
2. **Export constants**: Always export prompt constants
3. **Add comments**: Document each prompt's purpose
4. **Use placeholders**: Use `{VARIABLE}` for dynamic content
5. **Helper functions**: Create functions for complex prompt building

---

## 🎨 Prompt Engineering Tips

1. **Be specific**: Clearly define what you want
2. **Use examples**: Show expected output format
3. **Set constraints**: Define limits and requirements
4. **Use JSON mode**: For structured outputs
5. **Iterate**: Test and refine prompts
6. **Version control**: Commit prompt changes with clear messages

---

## 📚 Template for New Stage

```typescript
/**
 * STAGE N: STAGE_NAME - ALL PROMPTS
 * 
 * This file contains all prompts used in Stage N.
 * Edit the prompts directly in this file.
 */

// ============================================
// PROMPT 1: SYSTEM PROMPT
// ============================================
export const SYSTEM_PROMPT = `Your system prompt here...`;

// ============================================
// PROMPT 2: USER PROMPT
// ============================================
export const USER_PROMPT = `Your user prompt here...`;

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildPrompt(input: string): string {
  return USER_PROMPT.replace('{INPUT}', input);
}
```

---

**Last Updated**: 2025-12-25 20:59:00 IST
