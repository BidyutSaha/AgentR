# Testing Paper Scoring Stage

## Overview
Paper Scoring (merged Stage 5+6+7) performs comprehensive evaluation of candidate papers including semantic matching, dual-category scoring, and research gap analysis.

**Endpoint:** `POST /v1/stages/score`

## Input Schema

```json
{
  "userAbstract": "string (min 10 chars, required)",
  "candidateAbstract": "string (min 10 chars, required)"
}
```

## Output Schema

```json
{
  "data": {
    "stage": "score",
    "version": "1.0",
    "generatedAt": "ISO timestamp",
    "output": {
      "userAbstract": "string",
      "candidateAbstract": "string",
      
      // Semantic Similarity Metrics
      "semantic_similarity": 0.82,
      "problem_overlap": "high",
      "method_overlap": "medium",
      "domain_overlap": "high",
      "constraint_overlap": "medium",
      
      // Category 1: Direct Competitor Evaluation
      "c1_score": 8.5,
      "c1_justification": "Detailed explanation...",
      "c1_strengths": ["strength 1", "strength 2"],
      "c1_weaknesses": ["weakness 1", "weakness 2"],
      
      // Category 2: Supporting Work Evaluation
      "c2_score": 6.2,
      "c2_justification": "Detailed explanation...",
      "c2_contribution_type": "methodology",
      "c2_relevance_areas": ["area 1", "area 2"],
      
      // Research Gap Analysis
      "research_gaps": [
        "Gap 1: What candidate is missing",
        "Gap 2: Another missing aspect"
      ],
      "user_novelty": "How user's work fills these gaps"
    }
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

## Enums

### Overlap Levels
- `"none"` - No overlap
- `"low"` - Minimal overlap
- `"medium"` - Moderate overlap
- `"high"` - Significant overlap

### C2 Contribution Types
- `"methodology"` - Methodological contribution
- `"problem_context"` - Problem context/background
- `"domain_knowledge"` - Domain-specific knowledge
- `"constraint_analysis"` - Constraint/requirement analysis
- `"related_application"` - Related application area
- `"theoretical_foundation"` - Theoretical foundation

## Test Cases

### Test Case 1: Direct Competitor (High C1 Score)

**Request:**
```json
{
  "userAbstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency.",
  "candidateAbstract": "This paper presents an efficient TinyML framework for real-time facial landmark tracking on resource-constrained embedded systems. Our approach achieves low-latency inference on ARM Cortex-M microcontrollers with minimal power consumption."
}
```

**Expected Output Characteristics:**
- `semantic_similarity`: > 0.8
- `problem_overlap`: "high"
- `method_overlap`: "high"
- `c1_score`: 8-10
- `c2_score`: 5-7
- `research_gaps`: Should identify specific differences (e.g., "landmark tracking vs continuous tracking", "single-task vs multitask")
- `user_novelty`: Should highlight multitask learning advantage

---

### Test Case 2: Supporting Work (High C2 Score)

**Request:**
```json
{
  "userAbstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency.",
  "candidateAbstract": "We present a comprehensive survey of machine learning optimization techniques for resource-constrained embedded devices, focusing on model compression, quantization, and efficient inference strategies for edge computing."
}
```

**Expected Output Characteristics:**
- `semantic_similarity`: 0.4-0.6
- `problem_overlap`: "medium"
- `method_overlap`: "medium"
- `c1_score`: 3-5
- `c2_score`: 7-9
- `c2_contribution_type`: "methodology" or "domain_knowledge"
- `research_gaps`: Should identify application-specific gaps (e.g., "survey doesn't cover face tracking", "no real-time control scenarios")
- `user_novelty`: Should highlight specific application of general techniques

---

### Test Case 3: Low Relevance

**Request:**
```json
{
  "userAbstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency.",
  "candidateAbstract": "This paper introduces a novel deep learning architecture for natural language processing tasks, achieving state-of-the-art results on sentiment analysis and text classification benchmarks using transformer-based models."
}
```

**Expected Output Characteristics:**
- `semantic_similarity`: < 0.3
- `problem_overlap`: "none" or "low"
- `method_overlap`: "low"
- `c1_score`: 0-2
- `c2_score`: 0-3
- `research_gaps`: Should identify fundamental domain differences
- `user_novelty`: Should clearly state different problem domains

---

### Test Case 4: Same Problem, Different Method

**Request:**
```json
{
  "userAbstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency.",
  "candidateAbstract": "We develop a cloud-based face tracking system using deep convolutional neural networks with high-resolution video streams, optimized for accuracy on GPU clusters with real-time performance."
}
```

**Expected Output Characteristics:**
- `semantic_similarity`: 0.5-0.7
- `problem_overlap`: "high"
- `method_overlap`: "low"
- `constraint_overlap`: "none" or "low"
- `c1_score`: 4-6
- `c2_score`: 5-7
- `research_gaps`: Should highlight deployment constraints (e.g., "cloud vs edge", "GPU vs microcontroller", "no power constraints")
- `user_novelty`: Should emphasize on-device, low-power advantages

---

## cURL Test Commands

### Test Case 1: Direct Competitor
```bash
curl -X POST http://localhost:3000/v1/stages/score \
  -H "Content-Type: application/json" \
  -d '{
    "userAbstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency.",
    "candidateAbstract": "This paper presents an efficient TinyML framework for real-time facial landmark tracking on resource-constrained embedded systems. Our approach achieves low-latency inference on ARM Cortex-M microcontrollers with minimal power consumption."
  }'
```

### Test Case 2: Supporting Work
```bash
curl -X POST http://localhost:3000/v1/stages/score \
  -H "Content-Type: application/json" \
  -d '{
    "userAbstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency.",
    "candidateAbstract": "We present a comprehensive survey of machine learning optimization techniques for resource-constrained embedded devices, focusing on model compression, quantization, and efficient inference strategies for edge computing."
  }'
```

## Validation Rules

1. **userAbstract**: Must be at least 10 characters
2. **candidateAbstract**: Must be at least 10 characters

## Expected Behavior

1. **Dual Scoring**: Every candidate gets BOTH a C1 score and C2 score
2. **Comprehensive Metrics**: Semantic similarity and overlap metrics are always provided
3. **Justifications**: Both C1 and C2 justifications must be detailed and evidence-based
4. **Strengths/Weaknesses**: C1 evaluation includes specific strengths and weaknesses
5. **Contribution Type**: C2 evaluation categorizes the type of support provided
6. **Research Gaps**: Array of specific gaps the candidate has relative to user's work
7. **User Novelty**: Clear statement of how user's work fills the identified gaps

## Error Cases

### Invalid Input - Missing Required Field
```bash
curl -X POST http://localhost:3000/v1/stages/score \
  -H "Content-Type: application/json" \
  -d '{
    "userAbstract": "Short abstract"
  }'
```

**Expected Response:** 400 Bad Request with validation error

### Invalid Input - Abstract Too Short
```bash
curl -X POST http://localhost:3000/v1/stages/score \
  -H "Content-Type: application/json" \
  -d '{
    "userAbstract": "Short",
    "candidateAbstract": "Also short"
  }'
```

**Expected Response:** 400 Bad Request with validation error

## Notes

- This stage merges Stage 5 (Semantic Matching), Stage 6 (Ranking), and Stage 7 (Gap Analysis) into a single API call
- The dual-category evaluation allows for flexible use: papers can be strong competitors (high C1) or strong supporting work (high C2) or both
- Research gap analysis identifies what the candidate is NOT doing that the user IS addressing
- User novelty explains how the user's work fills these gaps
- The LLM evaluates all aspects simultaneously, providing comprehensive analysis in one pass
- Temperature is set to 0.4 for nuanced evaluation while maintaining consistency
