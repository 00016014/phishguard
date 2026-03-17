# Integrations and AI Models

This document outlines the third-party integrations and AI models leveraged by the PhishGuard backend to classify, analyze, and enrich threat intelligence data. The platform combines advanced LLM capabilities with traditional API-based intelligence and a fallback in-process machine learning classifier.

## 1. AI Models

### OpenAI Integration

OpenAI is the primary engine behind advanced text classification and generative analysis in PhishGuard. It relies on the `OPENAI_API_KEY` environment variable.

**Use Cases:**
- **Text Classification**: Classifies emails, texts, and URLs to determine phishing probability.
- **Threat Report Generation**: Suggests threat-report form fields from raw scan data or user-provided evidence.
- **Human-Readable Summaries**: Generates plain-text, human-like AI analysis summaries for end-users outlining why a scanned item is dangerous or safe.

**Code Example (`backend/api/views.py`):**
```python
def _get_openai():
    global _openai_client
    if _openai_client is None:
        api_key = os.environ.get('OPENAI_API_KEY')
        if api_key:
            from openai import OpenAI
            _openai_client = OpenAI(api_key=api_key)
    return _openai_client
```

### Local Machine Learning Fallback (Heuristic Classifier)

If the OpenAI API is unavailable, disabled, or fails to classify, PhishGuard relies on a lightweight, in-process machine learning classifier located in `backend/api/phishing_model.py`.

- **Architecture**: A pipeline comprising a TF-IDF (Term Frequency-Inverse Document Frequency) vectorizer and Logistic Regression.
- **Training**: It is trained in-process on a compact, balanced set of representative phishing and legitimate email samples on the first import. 
- **Performance**: No external model file is needed. It trains and caches in memory within the lifespan of the Django process (< 50 ms).

**Code Example (`backend/api/phishing_model.py`):**
```python
# Lightweight AI phishing text classifier.
# Uses a TF-IDF + Logistic Regression pipeline trained in-process on a compact
# set of representative phishing / legitimate email samples.

def predict(text: str) -> dict:
    # Returns dictionary containing:
    # "phishing_probability": float,   # 0.0 – 1.0
    # "label": "phishing" | "legitimate",
    # "confidence": "high" | "medium" | "low",
    # "top_signals": [str, ...]
```

## 2. Third-Party API Integrations

### VirusTotal API

PhishGuard natively integrates with the VirusTotal API v3 to enrich scan results. This integration runs URLs through dozens of security vendors and anti-virus scanners to cross-check whether an item is flagged.

It relies on the `VIRUSTOTAL_API_KEY` environment variable.

**Capabilities:**
- Extracts vendor votes (malicious, suspicious, clean).
- Evaluates URLs securely and supplements the internal PhishGuard score.
- Appends deep-dive analysis details to the overarching threat report returned to the user.

**Code Example (`backend/api/views.py`):**
```python
def _virustotal_enrich(url: str, score: int, details: list):
    import logging; vt_log = logging.getLogger('virustotal')
    vt_key = os.environ.get('VIRUSTOTAL_API_KEY')
    if not vt_key:
        vt_log.warning('VIRUSTOTAL_API_KEY not set — skipping VT enrichment')
        return score, details
        
    try:
        canonical = url if url.startswith(('http://', 'https://')) else 'http://' + url
        url_id = b64.urlsafe_b64encode(canonical.encode()).decode().rstrip('=')
        resp = req_lib.get(f'https://www.virustotal.com/api/v3/urls/{url_id}',
                           headers={'x-apikey': vt_key}, timeout=10)
        # Check security vendor results...
```

Both systems operate with fallback safeguards in place, seamlessly degrading to heuristic models or proceeding without external enrichment if API keys are not provided.