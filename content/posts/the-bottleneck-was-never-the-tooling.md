---
title: "The Bottleneck Was Never the Tooling"
description: What I learned building a self-service SSO onboarding prototype.
summary: SSO onboarding is slow because of the queue, not the tooling. A working prototype shows the routine path does not need an administrator, and the one checkpoint that should stay human.
date: 2026-09-14T00:00:00Z
lastmod: 2026-09-14T00:00:00Z
author:
  - Prithvi Poreddy
tags:
  - IAM
  - SSO
  - Okta
  - Automation
  - Self-Service
  - Provisioning
categories:
  - Identity and Access Management
draft: false
featured: false
ShowReadingTime: true
ShowShareButtons: true
ShowBreadCrumbs: false
slug: bottleneck-was-never-the-tooling
og_type: article
robots: index, follow
---

Onboarding an app to SSO is a five-minute configuration task, which is why nobody can explain why it takes three weeks.

A product team ships on Thursday and files the request on Monday. The configuration itself takes ten minutes whenever someone gets to it. The application goes live three weeks later, and nobody involved can point to the part that consumed three weeks, because there isn't one. It was waiting, spread thin across a dozen small handoffs.

Most identity functions have the same quiet failure mode. Every new application that needs single sign-on has to pass through an identity administrator. Someone fills out a ticket, someone else reads it, interprets it, translates it into Okta configuration, tests it, and hands it back. The work is not hard. It is just serialized through a small number of people who are also doing everything else.

I wanted to know how much of that was necessary, so I built a prototype to find out.

## The assumption worth testing

When onboarding is slow, the instinct is to ask for more headcount or better tooling. Both are expensive, and both assume the constraint is capacity. The constraint is usually position. The identity team sits in the request path, and anything in a request path becomes a queue no matter how fast it runs. Adding people does not fix that. It makes a slightly faster queue.

The fix is to remove the identity team from the path for the routine cases and keep them in it for the cases that need judgment. That is an operating model claim, not a software claim, and you cannot argue it without evidence. The cheapest evidence is a working prototype.

## The constraint that shaped the design

Self-service portals for infrastructure usually pick an audience and lose the other one. Build a web form and the platform teams route around it, because they already manage everything else as code and will not hand-configure one system. Build a Terraform module and the application teams cannot use it, because they are product engineers who have never written HCL and should not have to learn.

Picking a side means half your users bypass the system, and a self-service system that half the organization bypasses is worse than no system at all. You now have two sources of truth and no idea which one is current.

So the design requirement was that both views had to be the same object. An application team fills out a form. A platform team edits HCL. Each view updates the other in real time, because they are two renderings of one configuration rather than two systems that need reconciling. The form generates HCL. The HCL parses back into the form. Neither is the primary.

That decision drove almost everything else in the build.

## What got built

The prototype supports SAML and OIDC application types with optional SCIM provisioning. A Python backend handles the bidirectional translation between form state and HCL, and calls the Okta Management API to create the application live. The frontend is deliberately unremarkable, a single page that renders both views side by side.

I tested it end to end by creating a real OIDC application through the form and completing a full authorization code flow against it with a third-party debugger acting as the client. The application was created, the flow worked, and nobody touched the Okta admin console at any point.

That is the whole proof. It is not a large system. The point was never to build something impressive. It was to establish that the routine path does not require an administrator, which turns an operating model argument into an observation.

## Where should automation stop?

SCIM attribute mapping cannot be fully automated through the API. You can create the application, enable provisioning, and get most of the way there, but the mapping itself needs a human to confirm.

The reflex is to treat that as a gap and go looking for a workaround. I left it in place deliberately, and that is the right call whether or not the API allowed it.

Attribute mapping is where provisioning decisions get made. It determines what identity data flows into a downstream application and in what shape, which means it determines what that application knows about your workforce and what it can do with that knowledge. A mistake there does not surface as an error. It surfaces months later as an access review finding, or a privacy question nobody can answer, or an application holding data it was never supposed to receive.

Everything upstream of that point is mechanical. Application type, redirect URIs, grant types, assignment rules. Get those wrong and the application does not work, which is a fast and obvious failure. Get attribute mapping wrong and everything appears to work.

So the checkpoint is not a limitation I worked around. It is the one place in the flow where a human should be, and the API limitation happened to agree with the design.

This is the part of self-service that gets skipped. Self-service is not the removal of control. It is the deliberate placement of control at the points where a bad decision is silent and expensive, and its removal everywhere else. A portal that automates everything including the mapping is not more mature. It has just moved the review to after the damage.

## What it means for how the function runs

If the routine path is self-service and the judgment path is not, your identity function changes shape.

Your team stops being an execution queue and becomes the owner of the path itself. The work moves from configuring applications to defining what a valid configuration looks like, reviewing the cases that carry real risk, and maintaining the guardrails that make the routine cases safe to hand over. That is a smaller volume of work at a higher level, which is how a small function covers a large portfolio without the queue growing with it.

Approvals move too. When onboarding is a ticket, your team is the approver by accident, because they are the ones doing the work. When onboarding is self-service, approval becomes an explicit decision about who owns the application and who accepts the risk of the configuration. That is usually the application owner, and making it explicit is an improvement regardless of the tooling.

None of this requires the prototype. The prototype just removes the excuse. Once you have demonstrated that the routine path does not need an administrator, keeping an administrator in it is a choice, and choices can be discussed on their merits.

## The honest scope

This is a prototype, not a program. It has not run in production, it has not survived contact with a real application portfolio, and the failure modes that matter at scale have not shown up yet. Drift between the portal state and the actual Okta configuration is the obvious one. So is what happens when someone edits an application outside the portal, which they will.

The core argument holds anyway, because it does not depend on the prototype being good. It depends on the routine path being genuinely routine, and on the risky path being small enough to keep a human in. Both of those were true before I wrote any code. The prototype just made them hard to dispute.
