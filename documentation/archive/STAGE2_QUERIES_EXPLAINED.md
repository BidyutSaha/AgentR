# 📊 Stage 2 Query Generation - Output Explanation

## 🎯 Purpose

Stage 2 generates optimized search queries from the research intent. These queries will be used in **Stage 3** to retrieve relevant papers from academic databases.

---

## 📝 Output Fields

### 1. **`booleanQuery`** - Universal Search Query

**What it is**: A comprehensive Boolean search query using AND/OR operators

**Example**:
```
("TinyML" OR "embedded ML" OR "on-device ML") AND 
("face tracking" OR "visual tracking" OR "object tracking") AND 
("microcontroller" OR "MCU" OR "edge device") AND 
("low power" OR "energy efficient")
```

**Why we need it**:
- ✅ **Platform-agnostic**: Works with any search engine
- ✅ **Fallback option**: If specific APIs fail, use this
- ✅ **Documentation**: Clear view of search logic
- ✅ **Manual search**: Can be used in Google Scholar manually
- ✅ **Debugging**: Easy to understand what we're searching for

**Used in Stage 3**: As a fallback if specialized queries fail

---

### 2. **`expandedKeywords`** - Additional Search Terms

**What it is**: Array of synonyms, variations, and related terms (10-15 keywords)

**Example**:
```json
[
  "embedded machine learning",
  "on-device AI",
  "MCU",
  "edge computing",
  "resource-constrained devices",
  "real-time inference",
  "computer vision",
  "tracking algorithms",
  "power optimization",
  "TinyML frameworks"
]
```

**Why we need it**:
- ✅ **Query refinement**: Can add these to narrow/broaden search
- ✅ **Semantic search**: Some APIs use keyword matching
- ✅ **Filter enhancement**: Use for post-retrieval filtering
- ✅ **Related work**: Find papers using different terminology

**Used in Stage 3**: For query expansion and result filtering

---

### 3. **`engineQueries`** - Platform-Specific Queries

#### **a) `engineQueries.arxiv`**

**What it is**: Query optimized for arXiv API syntax

**Example**:
```
all:(TinyML OR "embedded ML") AND ("face tracking" OR "visual tracking") AND (microcontroller OR MCU)
```

**arXiv API Specifics**:
- Uses `all:` to search all fields (title, abstract, authors)
- Can use field-specific searches: `ti:`, `abs:`, `au:`
- Supports Boolean operators: AND, OR, ANDNOT
- Case-insensitive

**Why we need it**:
- ✅ **Optimized syntax**: Uses arXiv's specific query format
- ✅ **Better results**: Tailored for arXiv's search algorithm
- ✅ **Field targeting**: Can search specific fields
- ✅ **Performance**: Faster, more accurate results

**Stage 3 Usage**:
```typescript
const arxivUrl = `http://export.arxiv.org/api/query?search_query=${engineQueries.arxiv}&max_results=50`;
const papers = await fetch(arxivUrl);
```

---

#### **b) `engineQueries.semanticScholar`**

**What it is**: Query optimized for Semantic Scholar API

**Example**:
```
TinyML face tracking microcontroller low power real-time
```

**Semantic Scholar API Specifics**:
- Uses natural keyword format (no Boolean operators)
- AI-powered semantic understanding
- Supports filtering by year, venue, citation count
- Returns rich metadata (citations, references, authors)

**Why we need it**:
- ✅ **Semantic search**: Their AI understands context better
- ✅ **Citation data**: Provides citation graphs and metrics
- ✅ **Quality filtering**: Can filter by impact and venue
- ✅ **Simpler syntax**: No complex Boolean logic needed

**Stage 3 Usage**:
```typescript
const scholarUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${engineQueries.semanticScholar}&limit=50&fields=title,abstract,authors,year,citationCount`;
const papers = await fetch(scholarUrl);
```

---

## 🔄 How Stage 3 Will Use These

```typescript
// Stage 3: Paper Retrieval
async function retrievePapers(queriesOutput: QueriesOutput) {
  const results = [];
  
  try {
    // 1. Fetch from arXiv using optimized query
    const arxivPapers = await fetchFromArxiv(
      queriesOutput.engineQueries.arxiv
    );
    results.push(...arxivPapers);
  } catch (error) {
    console.log('arXiv failed, using boolean query fallback');
    // Fallback to boolean query
    const fallbackPapers = await fetchFromArxiv(
      queriesOutput.booleanQuery
    );
    results.push(...fallbackPapers);
  }
  
  try {
    // 2. Fetch from Semantic Scholar
    const scholarPapers = await fetchFromSemanticScholar(
      queriesOutput.engineQueries.semanticScholar
    );
    results.push(...scholarPapers);
  } catch (error) {
    console.log('Semantic Scholar failed');
  }
  
  // 3. Deduplicate by DOI/arXiv ID
  const uniquePapers = deduplicatePapers(results);
  
  // 4. Optional: Use expandedKeywords for filtering
  const filtered = filterByKeywords(
    uniquePapers, 
    queriesOutput.expandedKeywords
  );
  
  return filtered;
}
```

---

## 📊 Summary Table

| Field | Type | Purpose | Used In Stage 3 |
|-------|------|---------|-----------------|
| `booleanQuery` | string | Universal search query | Fallback option |
| `expandedKeywords` | array | Synonyms & variations | Filtering & expansion |
| `engineQueries.arxiv` | string | arXiv-optimized query | Primary arXiv search |
| `engineQueries.semanticScholar` | string | Semantic Scholar query | Primary S2 search |

---

## 🎯 Next: Stage 3 Implementation

Stage 3 will:
1. Use `engineQueries.arxiv` to fetch from arXiv API
2. Use `engineQueries.semanticScholar` to fetch from Semantic Scholar API
3. Fall back to `booleanQuery` if needed
4. Use `expandedKeywords` for result filtering
5. Deduplicate and merge results
6. Return list of relevant papers with metadata

---

**This multi-query approach ensures we get the best results from each platform!** 🚀
