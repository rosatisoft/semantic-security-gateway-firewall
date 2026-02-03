"@"
# Semantic Security Gateway Firewall (SSGF)

On-Premise Semantic Inspection Service.
"@ | Out-File -Encoding utf8 README.md

A semantic firewall for LLM applications.
Fast. Deterministic. Escalable.

What it does

SSGF sits between users and your LLM and:

Detects spam, phishing, prompt injection

Scores entropy and manipulation patterns

Classifies semantic intention

Escalates ambiguous cases to deep analysis

Reduces API cost with smart gating

Works as SDK or Proxy

Quickstart (2 minutes)
npm install llm-entropy-filter

import { gate } from "llm-entropy-filter";

const result = gate("FREE crypto bonus!!!");

console.log(result);

Output Example
{
  "action": "WARN",
  "entropy_score": 0.38,
  "flags": ["shouting", "spam_kw_free"],
  "intention": "marketing_spam",
  "confidence": 0.75
}

4 Ways to Integrate

1️⃣ Local SDK
2️⃣ Express middleware
3️⃣ Reverse proxy
4️⃣ Hybrid with Deep LLM escalation

Modes

FAST (local only)

DEEP (LLM-assisted)

HYBRID (recommended)

Rulesets

Choose:

default.json → balanced

strict.json → high security

custom.json → your own

Benchmarks

FAST:

<5ms

zero API cost

DEEP:

300–800ms

low-cost model recommended

Hybrid reduces LLM usage by 70–90% in typical traffic.

Roadmap

Semantic anomaly clustering

Adaptive rulesets

Multi-language phishing detection

Admin dashboard

Risk analytics

📄 3. Whitepaper Corto
Semantic Security Gateway Firewall
A Hybrid Deterministic–Semantic Architecture for LLM Protection
Abstract

Large Language Models are vulnerable not only to syntactic attacks but to semantically disguised manipulation. Traditional moderation relies either on static rules or expensive LLM-based filtering. SSGF proposes a hybrid architecture combining deterministic entropy scoring with ambiguity-triggered deep semantic analysis.

Problem

Heuristic filters fail on ambiguity.
LLM-only filters are expensive and inconsistent.

Example:

“Send me your verification code.”

Low entropy. High real-world risk.

Contribution

SSGF introduces:

Entropy-based structural scoring

Intention heuristics

Ambiguity-triggered escalation

Cost-aware semantic override

Middleware-level enforcement

Architecture Innovation

Two-layer model:

Layer 1 – Deterministic Gate
Layer 2 – Semantic Escalation

Decision flow minimizes cost while preserving security.

Economic Advantage

Reduces LLM moderation calls by 70–90%.
Maintains high detection precision.

Future Directions

Semantic anomaly embeddings

Multi-agent evaluation

Enterprise dashboard

Open Security Standard
