# Semantic Security Gateway Firewall (SSGF)

Deterministic Semantic Security Infrastructure for LLM Applications

Most LLM-based systems waste 70–90% of compute and tokens processing low-signal, ambiguous, or semantically manipulative inputs.

SSGF filters semantic noise before it reaches expensive reasoning models, transforming AI security from probabilistic moderation into deterministic, auditable decision infrastructure.

SSGF is not a prompt.
It is not a content moderation API.
It is a multi-layer semantic decision gateway.

What SSGF Does

SSGF sits between users and your LLM stack and:

Detects spam, phishing, credential extraction, and prompt injection

Scores structural entropy and manipulation patterns

Classifies semantic intention deterministically

Escalates only ambiguous cases to deep semantic analysis

Reduces LLM API usage by 70–90%

Enforces decisions at middleware / proxy level

Fast. Deterministic. Scalable.

Architecture Overview
User / Client
     │
     ▼
SSGF Proxy / SDK
     │
     ├─ FAST Pipeline (Local, Deterministic)
     │     ├ Normalization
     │     ├ Hard Triggers
     │     ├ Entropy Scoring
     │     ├ Intention Heuristics
     │     └ Decision: ALLOW | WARN | BLOCK | ESCALATE
     │
     └─ DEEP Pipeline (Only if ambiguous)
           ├ Controlled Prompt Bench
           ├ Semantic Intent Evaluation
           └ Final Decision Override
     │
     ▼
Protected LLM / Backend

Quickstart (2 minutes)
npm install llm-entropy-filter

import { gate } from "llm-entropy-filter";

const result = gate("FREE crypto bonus!!!");

console.log(result);

Example Output
{
  "action": "WARN",
  "entropy_score": 0.38,
  "flags": ["shouting", "spam_kw_free"],
  "intention": "marketing_spam",
  "confidence": 0.75
}

Integration Options

SSGF is model-agnostic and deployment-flexible.

1️⃣ Local SDK

Embed directly into Node.js services.

gate(text, { ruleset });

2️⃣ Express Middleware
app.post("/chat", ssgfMiddleware, forwardToLLM);

3️⃣ Reverse Proxy
Client → SSGF → OpenAI / Anthropic / Ollama

4️⃣ Hybrid Escalation (Recommended)

FAST local triage → DEEP semantic inspection only when needed.

Operating Modes
FAST (Deterministic Local)

<1–5ms latency

Zero API cost

JSON rulesets

Ideal for high-throughput and edge environments

DEEP (LLM-Assisted)

Triggered only by ambiguity

Uses low-cost or local models (e.g. Ollama, gpt-4o-mini)

Structured JSON-only outputs

Enforces hard security overrides

HYBRID (Recommended)

Determinism first. LLM only if necessary.

Rulesets

Rules are fully configurable via JSON.

default.json → Balanced

strict.json → High-security

custom.json → Domain-specific policies

Rules control:

Thresholds

Hard triggers

Escalation behavior

Benchmarks (v1.0.0)

Dataset: 30 curated phishing, spam, and benign cases
Pipeline: FAST + DEEP (hybrid)

Metric	Result
Accuracy	93.3%
False BLOCK → ALLOW	0
False ALLOW → BLOCK	0
Abort rate	1 case
FAST latency	<5ms
DEEP latency	300–800ms
LLM reduction	70–90%

Benchmarks are reproducible via npm run prompt:bench.

Security Model

SSGF enforces Founded Determinism:

Same input → same output

Decisions based on evidence, not probability

JSON-first, auditable logs

Explicit rationale and flags

Entropy is treated as structural evidence, not model opinion.

What This Is Not

❌ Not a chatbot

❌ Not a moderation prompt

❌ Not a probabilistic classifier

❌ Not cloud-dependent

SSGF is decision infrastructure.

Whitepaper

📄 Semantic Security Gateway Firewall
A Hybrid Deterministic–Semantic Architecture for LLM Protection

→ See /docs/SSGF_Whitepaper_Technical.pdf

Roadmap

Semantic anomaly clustering

Adaptive rulesets

Multi-language phishing detection

Admin dashboard & analytics

Enterprise policy packs

License

Licensed under Apache License 2.0.

You are free to use, modify, and deploy SSGF commercially or privately.

Advisory & Pilots

SSGF is free and open-source.

For:

Enterprise pilots

Regulated environments

Custom rulesets

Audits and architecture reviews

Advisory support is available.
