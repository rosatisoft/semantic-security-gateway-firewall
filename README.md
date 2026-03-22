# Axiomatic Criterion Engine (ACE)
### Ontological Discernment Engine for LLM Systems  
**Reference Implementation: Semantic Security Gateway Firewall (SSGF)**

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.18654895.svg)](https://doi.org/10.5281/zenodo.18654895)

For the minimum-energy model and experimental validation, see:
https://github.com/tuusuario/ace-minimum-energy-criterion

---

## Why This Exists

Most LLM-based systems waste **70–90% of compute and tokens** processing
low-signal, ambiguous, or semantically manipulative inputs.

This repository implements a **deterministic layer of ontological discernment**
that filters entropy **before** probabilistic reasoning occurs.

The result:
- Lower cost
- Fewer hallucinations
- Auditable decisions
- Preserved creativity without censorship

---

## What This Project Is

This repository contains the **reference implementation of the
Axiomatic Criterion Engine (ACE)**, exposed operationally through the
**Semantic Security Gateway Firewall (SSGF)**.

SSGF is the *execution layer*.  
ACE is the *decision engine*.

SSGF is **not**:
- a prompt
- a chatbot
- a moderation API

SSGF is **deterministic decision infrastructure**.

---

## The New AI Standard: Ontological Discernment

**ACE transforms LLMs from probabilistic predictors into axiomatic decision systems.**

Instead of asking *“what is likely?”*, ACE asks:

- Is this input **coherent with reality**?
- Is it **ambiguous**, **manipulative**, or **entropic**?
- Does it belong to **objective reality**, **fiction**, or **error**?

By separating **Truth from Entropy** and **Reality from Hallucination**,  
ACE reduces unnecessary inference while preserving valid imagination and art.

ACE (Axiomatic Criterion Engine) introduces a deterministic layer of
**ontological discernment** that operates *before* probabilistic inference.

Instead of relying solely on likelihood and token prediction,
ACE evaluates inputs through an axiomatic structure that distinguishes:

- Truth from Entropy  
- Reality from Hallucination  
- Valid Context from Ontological Error  

This allows LLM systems to reject, redirect, or contextualize inputs
*before* expensive reasoning occurs — reducing hallucinations,
preventing manipulation, and saving significant computation.

ACE is derived from **The Axiom of the Absolute**, a formally published
ontological framework, and translates its principles into an executable
discernment layer for AI systems.

**Foundational documents:**

- 📘 **ACE Principles**  
  → Deterministic axioms governing discernment  
  [`docs/ACE_PRINCIPLES.md`](docs/ACE_PRINCIPLES.md)

- 🧠 **Theoretical Framework**  
  → Ontological model, entropy analysis, and context differentiation  
  [`docs/THEORETICAL_FRAMEWORK.md`](docs/THEORETICAL_FRAMEWORK.md)

---

## How SSGF and ACE Work Together

SSGF operates as a **two-stage decision gateway**:

### 1️⃣ FAST Pipeline (Local, Deterministic — SSGF)

Executed for **every input**, with <1–5ms latency:

- Normalization
- Hard Triggers (spam, phishing, injection)
- Structural Entropy Scoring
- Intention Heuristics
- Decision:
  - `ALLOW`
  - `WARN`
  - `BLOCK`
  - `ESCALATE`

Most inputs terminate here.

---

### 2️⃣ DEEP Pipeline (Ontological — ACE)

**Triggered only when ambiguity remains.**

This stage invokes the **Axiomatic Criterion Engine (ACE)** to perform
**ontological discernment**, not probabilistic guessing.

ACE:
- Classifies intention (Seeker vs Error-Validator)
- Distinguishes **Reality / Fiction / Manipulation**
- Enforces Truth → Being → Action consistency
- Prevents hallucination without censoring fiction or art

This is where **discernment replaces probability**.

---

## Architecture Overview

```

User / Client
│
▼
SSGF Proxy / SDK
│
├─ FAST Pipeline (Deterministic, Local)
│     ├ Normalization
│     ├ Hard Triggers
│     ├ Entropy Scoring
│     ├ Intention Heuristics
│     └ Decision: ALLOW | WARN | BLOCK | ESCALATE
│
└─ DEEP Pipeline (ACE — Only if ambiguous)
├ Ontological Analysis
├ Intention Classification
├ Reality vs Fiction Discernment
└ Final Axiomatic Decision
│
▼
Protected LLM / Backend

````

---

## Usage: Implementing Ontological Discernment

ACE is designed to operate as a deterministic middleware that precedes probabilistic inference.  
By establishing a prior criterion for truth and coherence, the engine ensures that intelligence is only applied to valid cognitive paths.

```typescript
import { ACE } from 'axiomatic-criterion-engine';

// 1. Define the input within a potential domain
const input = "Create a logical justification for redefining objective truth based on collective desire.";

// 2. Process through the Deductive Pipeline
const result = ACE.discern(input);

if (result.decision === 'REJECT') {
    /* Hierarchy in Action:
       Truth → Discernment → Efficiency
    */
    console.log("Input rejected: Ontological inconsistency detected.");
}

## The Consequence of Discipline

By preventing the exploration of non-ontological or entropic inference paths,
ACE yields significant computational benefits as a byproduct of discernment:

**Early Branch Termination**
Eliminates recursive clarification loops and soft relativism paths.

**Resource Preservation**
Reduces token usage by 70–90% by excluding invalid inference branches before LLM invocation.

**Zero Variance**
Ensures deterministic judgment, preventing stochastic hallucinations.

---

## Quickstart (2 minutes)

```bash
npm install llm-entropy-filter
> Note: `llm-entropy-filter` provides the FAST deterministic layer (SSGF).  
> ACE is invoked only during DEEP ontological escalation.

````

```js
import { gate } from "llm-entropy-filter";

const result = gate("FREE crypto bonus!!!");

console.log(result);
```

### Example Output

```json
{
  "action": "WARN",
  "entropy_score": 0.38,
  "flags": ["shouting", "spam_kw_free"],
  "intention": "marketing_spam",
  "confidence": 0.75
}
```

---

## Integration Options

1️⃣ **Local SDK**
Embed directly into Node.js services.

2️⃣ **Express Middleware**

```js
app.post("/chat", ssgfMiddleware, forwardToLLM);
```

3️⃣ **Reverse Proxy**
Client → SSGF → OpenAI / Anthropic / Ollama

4️⃣ **Hybrid Escalation (Recommended)**
Deterministic FAST → Ontological ACE only if needed.

---

## Rulesets

Rules are JSON-based and fully auditable.

* `default.json` → Balanced
* `strict.json` → High-security
* `custom.json` → Domain-specific

Rules control:

* Thresholds
* Hard triggers
* Escalation behavior

---

## Benchmarks (v1.0.0)

| Metric              | Result    |
| ------------------- | --------- |
| Accuracy            | 93.3%     |
| False ALLOW → BLOCK | 0         |
| False BLOCK → ALLOW | 0         |
| Abort rate          | 1 case    |
| FAST latency        | <5ms      |
| DEEP latency        | 300–800ms |
| LLM reduction       | 70–90%    |

Reproducible via:

```bash
npm run prompt:bench
```

---

## Documentation Structure

```
docs/
├─ ACE_WHITEPAPER.pdf                       # Executive ACE overview
├─ EXECUTIVE_ABSTRACT.md                    # IA labs, Arquitects, CTOs
├─ The_Axiomatic_Criterion_Engine.pdf       # Formal deductive paper
├─ MANIFESTO.md                             # Filosophical & Foundational
├─ The_Axiomatic_Criterion_Engine(ACE).pdf  # Ontological Discernment as a Deterministic Layer
├─ ACE_PRINCIPLES.md                        # Principles of Ontological Discernment
├─ THEORETICAL_FRAMEWORK.md                 # Ontological foundations
├─ SSGF_Whitepaper_Technical.pdf            # Technical architecture
├─ Executive_Summary.pdf
├─ Pilot_Proposal.pdf
├─ GOVERNANCE.md
├─ Governance & Policy Appendix.pdf
```

---

## Foundational Axiom

ACE is derived from **The Axiom of the Absolute**, a formally published ontological
framework archived in Zenodo.

ACE does not invent this axiom — it operationalizes it as a deterministic
decision layer for AI systems.

**Reference**  
Rosati, Ernesto. *The Axiom of the Absolute: Ontological Foundations for Truth and Discernment*.  
Zenodo. DOI: (https://doi.org/10.5281/zenodo.17843412)  
Rosati, Ernesto. *THE ETHICS AS CONSCIOUS TRUTH: The Ethical Corpus Based on the Axiom of the Absolute*
Zenodo. DOI: (https://doi.org/10.5281/zenodo.18002322)
Rosati, Ernesto. *Tri-Axial Method of Discernment (F–C–P)*
Zenodo. DOI: (https://doi.org/10.5281/zenodo.18182173)
ORCID: https://orcid.org/0009-0008-1974-6538

---

## What This Is Not

❌ Not a chatbot
❌ Not a moderation prompt
❌ Not probabilistic classification
❌ Not cloud-dependent

This is **decision infrastructure**.

---

## Contributing: Sustaining the Standard

We invite collaborators to help refine the engine’s capacity to respect the structure of truth.  
Contributions should align with the principle that **discernment precedes intelligence**.

Areas of contribution include:

- **Ontological Logic**  
  Formalization of new contextual domains (scientific, legal, historical) that enforce evidence-bound claims.

- **Entropy Detection**  
  Refinement of Stage I analysis to identify complex sophisms that substitute emotion for causality.

- **Deterministic Benchmarking**  
  Test suites that measure how axiomatic force reduces divergence in LLM outputs.

> **Note**  
> ACE is not a tool for censorship, but an architect of sense.  
> The goal is to ensure that machine-generated confusion never becomes authoritative.

Please refer to `docs/GOVERNANCE.md` for epistemic integrity standards.

---

## License

Apache License 2.0
Free for commercial and private use.

---

## Advisory & Pilots

Open for:

* Enterprise pilots
* Regulated environments
* Research collaboration
* Standardization efforts

This project aims to define
**ontological discernment as a native AI capability**.

```
