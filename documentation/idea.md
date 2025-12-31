

# **LLM-Driven Literature Review and Research Gap Discovery System**

**A full-stack web application with user authentication, PostgreSQL database, and responsive frontend for automated literature review and research gap analysis.**

---

## **System Overview**

This system provides:
1. **User Authentication**: Secure registration, email verification, JWT-based authentication, and password recovery
2. **Literature Review Pipeline**: Multi-stage LLM-driven analysis of research papers
3. **Research Gap Discovery**: Automated identification of gaps in existing literature
4. **User Dashboard**: Manage projects, view history, and save results

---

## **Inputs**

### **Primary Input**

* Research abstract or short research idea (free-text)

**Sample Input**

```text
We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency.
```

### **Optional Inputs**

* Target domain / venue preference (e.g., ML, HCI, Systems)
* Temporal scope (e.g., last 5 years)
* Preferred publication tiers (A*/A conferences, Q1 journals)

---

## **Preset Search Sources**

* **Open Repositories**: arXiv, Semantic Scholar
* **Indexed Sources**: Google Scholar (metadata + citation counts)
* **Optional APIs**: OpenAlex, CrossRef, CORE

---

## **System Pipeline**

---

## **Stage 1: Abstract Understanding and Research Intent Decomposition**

**Goal**
Convert the user-provided abstract into a structured representation of research intent.

**LLM Tasks**

* Extract:

  * Core problem statement
  * Methodology / algorithmic approach
  * Application domain
  * Key constraints (e.g., low-power, on-device, scalability)
* Identify:

  * Contribution type (method / system / dataset / theory)
  * Implicit novelty claims

### **Sample Input**

```text
We propose a low-power TinyML-based multitask model for real-time face tracking on microcontrollers.
```

### **Sample Output**

```json
{
  "problem": "Real-time face tracking on resource-constrained devices",
  "methodology": ["TinyML", "multitask learning", "on-device inference"],
  "domain": "Embedded AI / Computer Vision",
  "constraints": ["low power", "limited memory", "real-time"],
  "keywords_seed": ["TinyML", "face tracking", "microcontroller", "on-device AI"]
}
```

---

## **Stage 2: Search Key and Query Generation**

**Goal**
Generate high-coverage, low-noise scholarly search queries from Stage-1 outputs.

**LLM Tasks**

* Generate:

  * Core keywords
  * Expanded synonyms
  * Method-centric queries
  * Problem-centric queries
* Auto-construct Boolean queries

### **Sample Input**

```json
{
  "keywords_seed": ["TinyML", "face tracking", "microcontroller"]
}
```

### **Sample Output**

```text
("TinyML" OR "embedded machine learning")
AND ("face tracking" OR "visual tracking")
AND ("microcontroller" OR "edge device" OR "low power")
```

---

## **Stage 3: Multi-Engine Paper Retrieval** *(Parallel Execution)*

**Goal**
Collect a broad but relevant candidate pool using queries from Stage-2.

**Tool Actions (Parallel)**

* arXiv API → full-text metadata
* Semantic Scholar API → citation graphs, influence score
* Google Scholar → citation counts (proxy or metadata access)

### **Sample Input**

```text
("TinyML" OR "embedded machine learning") AND ("face tracking")
```

### **Sample Output**

```json
[
  {
    "title": "TinyML-Based Face Detection for Edge Devices",
    "authors": ["A. Kumar", "B. Lee"],
    "year": 2022,
    "venue": "IEEE IoT Journal",
    "citations": 124,
    "abstract": "...",
    "pdf": "link"
  }
]
```

---

## **Stage 4: Automated Filtering and Quality Scoring**

**Goal**
Reduce noise while preserving high-quality and relevant work.

**Filtering Criteria**

* **Recency**

  * Hard cutoff: last 5–7 years
  * Soft boost: ≤ 2 years
* **Venue Quality**

  * Conference/journal tier
* **Citation Signal**

  * Absolute and relative impact

### **Sample Input**

```json
{
  "year": 2017,
  "venue": "Workshop",
  "citations": 3
}
```

### **Sample Output**

```json
{
  "status": "filtered_out",
  "reason": "Old publication with low citation impact"
}
```

---

## **Paper Scoring (Stage 5+6+7 Merged)** *(Parallel Execution)*

**Goal**
Comprehensively score each candidate paper with semantic similarity, dual-category evaluation, and research gap analysis.

**LLM Tasks**

* Compute semantic similarity metrics:
  * Overall semantic similarity (0.0-1.0)
  * Problem overlap (none/low/medium/high)
  * Method overlap (none/low/medium/high)
  * Domain overlap (none/low/medium/high)
  * Constraint overlap (none/low/medium/high)

* Evaluate as **Category 1 (C1) - Direct Competitor:**
  * C1 Score (0-10)
  * C1 Justification
  * C1 Strengths (what makes it a strong competitor)
  * C1 Weaknesses (what makes it a weak competitor)

* Evaluate as **Category 2 (C2) - Supporting Work:**
  * C2 Score (0-10)
  * C2 Justification
  * C2 Contribution Type (methodology/problem_context/domain_knowledge/constraint_analysis/related_application/theoretical_foundation)
  * C2 Relevance Areas (specific areas of relevance)

* Identify **Research Gaps:**
  * What is the candidate missing that the user addresses?
  * How does the user's work fill these gaps?

### **Sample Input**

```json
{
  "userAbstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontrollers.",
  "candidateAbstract": "This paper presents an efficient TinyML framework for real-time facial landmark tracking on resource-constrained embedded systems."
}
```

### **Sample Output**

```json
{
  "semantic_similarity": 0.82,
  "problem_overlap": "high",
  "method_overlap": "high",
  "domain_overlap": "high",
  "constraint_overlap": "medium",
  
  "c1_score": 8.5,
  "c1_justification": "Uses TinyML and multitask learning for face tracking under similar hardware constraints.",
  "c1_strengths": [
    "Addresses identical problem domain",
    "Uses similar TinyML methodology",
    "Targets same hardware constraints"
  ],
  "c1_weaknesses": [
    "Focuses on landmark tracking rather than general tracking",
    "May use different multitask architecture"
  ],
  
  "c2_score": 6.2,
  "c2_justification": "Provides methodological insights for TinyML implementation on embedded systems.",
  "c2_contribution_type": "methodology",
  "c2_relevance_areas": [
    "TinyML optimization techniques",
    "Embedded system constraints",
    "Real-time inference strategies"
  ],
  
  "research_gaps": [
    "Focuses on landmark detection, not continuous tracking",
    "Does not address multitask learning scenarios",
    "Lacks evaluation on pan-tilt control applications"
  ],
  "user_novelty": "User's work uniquely combines multitask learning with continuous face tracking on microcontrollers, addressing real-time control scenarios that existing work does not cover."
}
```

**Why Merge Stages 5, 6, and 7?**
* Single LLM pass for complete paper analysis
* Gap analysis informed by similarity and categorization
* Per-paper novelty identification
* Comprehensive scoring in one API call
* Maintains parallelization capability

---

## **Stage 8: Aggregate Gap Analysis (Optional)**

**Goal**
Synthesize research gaps across ALL scored papers to identify overarching themes.

**LLM Tasks**

* Aggregate gaps from all paper scores
* Identify common patterns:
  * Missing constraints across literature
  * Unexplored scenarios
  * Weak evaluations
  * Deployment gaps

### **Sample Input**

```json
{
  "userAbstract": "...",
  "scoredPapers": [
    {
      "title": "Paper 1",
      "research_gaps": ["Gap A", "Gap B"],
      "c1_score": 8.5
    },
    {
      "title": "Paper 2",
      "research_gaps": ["Gap A", "Gap C"],
      "c1_score": 7.0
    }
  ]
}
```

### **Sample Output**

```text
• Existing work focuses primarily on face detection rather than continuous tracking (identified in 5/10 papers).
• Real-time pan-tilt control on microcontrollers remains underexplored (identified in 8/10 papers).
• Few studies report end-to-end deployment latency on MCU-class hardware (identified in 7/10 papers).
```

---

## **Final Outputs**

1. Ranked literature lists (C1 and C2)
2. LaTeX-ready research gap paragraphs
3. Suggested citation clusters
4. Auto-generated “Related Work” section outline

---

## **Why This Design Is Strong**

* Fully automatable and scalable
* Parallelizable at retrieval and similarity stages
* LLMs used for **reasoning and judgment**, not mere summarization
* Explicit separation of competitors vs. contextual literature
* Directly maps to thesis writing and research gap articulation

---

If you want next, I can:

* Convert this into a **formal algorithm / pseudocode section**
* Write a **System Architecture figure description**
* Help you position this as a **research paper vs. patent vs. hybrid contribution**
