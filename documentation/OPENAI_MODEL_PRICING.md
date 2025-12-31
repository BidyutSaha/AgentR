# OpenAI Model Pricing List

**Last Updated**: December 2025

---

## 📊 Chat Completion Models (GPT)

### GPT-4 Turbo Models (Recommended for Production)

| Model Name | Context Window | Input Price | Output Price | Best For |
|------------|----------------|-------------|--------------|----------|
| `gpt-4-turbo-preview` | 128K tokens | $10.00 / 1M tokens | $30.00 / 1M tokens | Latest features, JSON mode |
| `gpt-4-turbo` | 128K tokens | $10.00 / 1M tokens | $30.00 / 1M tokens | Stable, production-ready |
| `gpt-4-turbo-2024-04-09` | 128K tokens | $10.00 / 1M tokens | $30.00 / 1M tokens | Specific version |
| `gpt-4-1106-preview` | 128K tokens | $10.00 / 1M tokens | $30.00 / 1M tokens | Earlier turbo version |

### GPT-4 Standard Models

| Model Name | Context Window | Input Price | Output Price | Best For |
|------------|----------------|-------------|--------------|----------|
| `gpt-4` | 8K tokens | $30.00 / 1M tokens | $60.00 / 1M tokens | High accuracy tasks |
| `gpt-4-32k` | 32K tokens | $60.00 / 1M tokens | $120.00 / 1M tokens | Long context needs |
| `gpt-4-0613` | 8K tokens | $30.00 / 1M tokens | $60.00 / 1M tokens | Specific version |

### GPT-4o Models (Optimized, Multimodal)

| Model Name | Context Window | Input Price | Output Price | Best For |
|------------|----------------|-------------|--------------|----------|
| `gpt-4o` | 128K tokens | $5.00 / 1M tokens | $15.00 / 1M tokens | **BEST VALUE** - Fast, cheap, smart |
| `gpt-4o-mini` | 128K tokens | $0.15 / 1M tokens | $0.60 / 1M tokens | **CHEAPEST** - Great for simple tasks |
| `gpt-4o-2024-11-20` | 128K tokens | $2.50 / 1M tokens | $10.00 / 1M tokens | Latest optimized version |

### GPT-3.5 Turbo Models (Budget-Friendly)

| Model Name | Context Window | Input Price | Output Price | Best For |
|------------|----------------|-------------|--------------|----------|
| `gpt-3.5-turbo` | 16K tokens | $0.50 / 1M tokens | $1.50 / 1M tokens | Fast, cheap, good quality |
| `gpt-3.5-turbo-16k` | 16K tokens | $3.00 / 1M tokens | $4.00 / 1M tokens | Longer contexts |
| `gpt-3.5-turbo-1106` | 16K tokens | $1.00 / 1M tokens | $2.00 / 1M tokens | JSON mode support |

---

## 🎯 Embeddings Models

| Model Name | Dimensions | Price | Best For |
|------------|------------|-------|----------|
| `text-embedding-3-large` | 3072 | $0.13 / 1M tokens | Highest accuracy |
| `text-embedding-3-small` | 1536 | $0.02 / 1M tokens | **RECOMMENDED** - Great balance |
| `text-embedding-ada-002` | 1536 | $0.10 / 1M tokens | Legacy model |

---

## 💰 Cost Comparison Examples

### Example: Processing 1000 Research Abstracts

**Assumptions:**
- Average abstract: 200 tokens
- LLM response: 150 tokens
- Total: 350 tokens per abstract
- 1000 abstracts = 350,000 tokens

| Model | Input Cost | Output Cost | Total Cost |
|-------|------------|-------------|------------|
| `gpt-4o-mini` | $0.05 | $0.21 | **$0.26** ⭐ CHEAPEST |
| `gpt-4o` | $1.75 | $2.25 | **$4.00** ⭐ RECOMMENDED |
| `gpt-3.5-turbo` | $0.18 | $0.53 | **$0.71** |
| `gpt-4-turbo` | $3.50 | $4.50 | **$8.00** |
| `gpt-4` | $10.50 | $9.00 | **$19.50** |

---

## 🏆 Recommendations for Literature Review System

### Stage 1: Intent Decomposition
**Recommended:** `gpt-4o` or `gpt-4o-mini`
- Needs: JSON mode, structured extraction
- Volume: Low (1 request per user query)
- **Best Choice:** `gpt-4o` - Good balance of cost and quality

### Stage 2: Query Generation
**Recommended:** `gpt-4o-mini`
- Needs: Simple keyword expansion
- Volume: Low (1 request per user query)
- **Best Choice:** `gpt-4o-mini` - Very cheap, sufficient quality

### Stage 5: Semantic Matching (Embeddings)
**Recommended:** `text-embedding-3-small`
- Needs: Fast, cheap embeddings
- Volume: High (many papers)
- **Best Choice:** `text-embedding-3-small` - Best price/performance

### Stage 6-7: Ranking & Gap Analysis
**Recommended:** `gpt-4o`
- Needs: High-quality reasoning
- Volume: Medium (top papers only)
- **Best Choice:** `gpt-4o` - Smart enough, affordable

---

## 📈 Model Capabilities Comparison

| Feature | GPT-4o | GPT-4 Turbo | GPT-3.5 Turbo | GPT-4o Mini |
|---------|--------|-------------|---------------|-------------|
| **JSON Mode** | ✅ Yes | ✅ Yes | ✅ Yes (1106+) | ✅ Yes |
| **Function Calling** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Vision (Images)** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Max Context** | 128K | 128K | 16K | 128K |
| **Speed** | ⚡ Fast | ⚡ Fast | ⚡⚡ Very Fast | ⚡⚡⚡ Fastest |
| **Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cost** | 💰💰 | 💰💰💰 | 💰 | 💰 (cheapest) |

---

## 🎯 Quick Selection Guide

### Choose `gpt-4o-mini` if:
- ✅ You need the cheapest option
- ✅ Task is simple (keyword extraction, classification)
- ✅ Processing high volume
- ✅ Speed is critical

### Choose `gpt-4o` if:
- ✅ You need best value (quality/price)
- ✅ Task requires reasoning
- ✅ JSON mode needed
- ✅ **RECOMMENDED FOR THIS PROJECT** ⭐

### Choose `gpt-4-turbo` if:
- ✅ You need highest quality
- ✅ Complex reasoning required
- ✅ Budget is not a concern
- ✅ Production-critical application

### Choose `gpt-3.5-turbo` if:
- ✅ Very simple tasks
- ✅ Extremely high volume
- ✅ Tight budget
- ✅ Fast responses needed

---

## 💡 Cost Optimization Tips

1. **Use Cheaper Models for Simple Tasks**
   - Stage 2 (Query Gen): `gpt-4o-mini` instead of `gpt-4-turbo`
   - Save: ~97% per request

2. **Batch Processing**
   - Process multiple abstracts in one request
   - Reduce API overhead

3. **Cache Results**
   - Store intent decomposition results
   - Avoid re-processing same abstracts

4. **Use Embeddings Wisely**
   - `text-embedding-3-small` is 6.5x cheaper than `3-large`
   - Quality difference is minimal for most use cases

5. **Set Max Tokens**
   - Limit output length to reduce costs
   - Typical abstract analysis: 200-500 tokens

---

## 🔧 Recommended Configuration for This Project

```env
# .env file settings

# For Intent Decomposition (Stage 1)
LLM_MODEL=gpt-4o
# Cost: ~$0.004 per abstract

# For Query Generation (Stage 2)
QUERY_MODEL=gpt-4o-mini
# Cost: ~$0.0001 per query

# For Embeddings (Stage 5)
EMBEDDINGS_MODEL=text-embedding-3-small
# Cost: ~$0.00004 per paper

# For Gap Analysis (Stage 7)
GAP_MODEL=gpt-4o
# Cost: ~$0.01 per analysis
```

### Estimated Total Cost per Complete Pipeline:
- 1 abstract → 50 papers → ranked → gaps
- **Total: ~$0.10 - $0.20** per complete analysis

---

## 📚 Additional Resources

- **OpenAI Pricing Page**: https://openai.com/pricing
- **API Documentation**: https://platform.openai.com/docs
- **Rate Limits**: https://platform.openai.com/docs/guides/rate-limits
- **Token Calculator**: https://platform.openai.com/tokenizer

---

## ⚠️ Important Notes

1. **Prices may change** - Always check official OpenAI pricing page
2. **Rate Limits** - Free tier has lower limits than paid
3. **Batch API** - 50% discount available for async processing
4. **Volume Discounts** - Contact OpenAI for enterprise pricing
5. **Token Counting** - Use tiktoken library for accurate estimates

---

**Last Updated**: December 25, 2025
**Source**: OpenAI Official Pricing (https://openai.com/pricing)
