---
title: "Identity Security for AI (MCP) Agents: A Four-Layer Continuous Authorization Model"
date: 2025-09-06
draft: false
showToc: true
TocOpen: false
ShowReadingTime: true
ShowShareButtons: true
ShowBreadCrumbs: false
canonicalURL: "https://www.linkedin.com/pulse/beyond-iam-architecting-identity-workloads-ai-agents-prithvi-poreddy-tvj0c/?trackingId=NuSg2ggeGolUCNuRuWxSpw%3D%3D"
---

> *I think therefore IAM*

OAuth validates requests. Agents create sequences. The gap between the two is where risk lives.

Most teams building with the Model Context Protocol treat it like a normal API: put OAuth in front, validate a token, move on. That won’t work.

OAuth can confirm that a caller is authenticated and has some permissions. What it can’t do is prevent an autonomous agent from chaining multiple legitimate tools in a way that produces an unauthorized outcome. Each individual call might be allowed, but the combined action — the emergent behavior — is outside what the system was designed to allow.

MCP is the control plane for AI agents. These systems plan, chain tools, and follow paths you didn’t design. Identity security here isn’t a one-time check. It’s continuous verification of who the human is, who the agent is, and exactly what each step is allowed to do.

---

### What Changed

Agent behavior is unpredictable. They combine tools in ways you didn’t plan for.
Every request has multiple actors — a human user and a non-human agent.
Showing tools creates risk: if an agent can see a tool, it becomes a target.
Parameters matter more than endpoints: the right tool with wrong data is a breach.

---

### What to Build

- Separate human and agent identity on every call.
- Give agents and tools their own cryptographic identities with mutual TLS.
- Filter what tools agents can see based on who’s using them and return **signed permission grants**, not just API docs.
- Create single-use tokens for each tool call that lock in the exact action and resource.
- Control data access at the database level with field and row filtering that works even if upstream checks fail.
- Add controls for memory access, background jobs, instant revocation, rate limits, and tool supply chain security.

If you can’t answer *“who is the subject, who is the actor, and what specific permission authorized this exact step,”* you don’t have identity security for agents.

---

### The Four-Layer Continuous Authorization Framework

```mermaid
graph TD
    A[Gateway Layer] --> B[Discovery Layer]
    B --> C[Invocation Layer]
    C --> D[Execution Layer]
    style A fill:#00b5ad,stroke:#333,stroke-width:1px,color:#fff
    style B fill:#ff7f0e,stroke:#333,stroke-width:1px,color:#fff
    style C fill:#2185d0,stroke:#333,stroke-width:1px,color:#fff
    style D fill:#21ba45,stroke:#333,stroke-width:1px,color:#fff
    A:::title
    B:::title
    C:::title
    D:::title