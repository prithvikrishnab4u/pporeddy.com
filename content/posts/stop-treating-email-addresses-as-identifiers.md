---
title: Stop Treating Email Addresses as Identifiers
description: Why email addresses make poor system identifiers and how to build
  better identity architecture
summary: Email addresses as identifiers create security risks, audit gaps, and
  technical debt. Learn the three-layer approach to proper identity management.
date: 2025-11-08T00:00:00Z
lastmod: 2025-11-08T00:00:00Z
author:
  - Prithvi Poreddy
tags:
  - identity management
  - IAM
  - email addresses
  - system identifiers
  - immutable identifiers
  - identity architecture
  - authentication
  - security
categories:
  - Identity Security
  - IAM
draft: false
featured: false
ShowReadingTime: true
ShowShareButtons: true
ShowBreadCrumbs: false
ShowPostNavLinks: true
ShowCodeCopyButtons: true
ShowWordCount: true
ShowRssButtonInSectionTermList: true
UseHugoToc: true
canonicalURL: https://www.linkedin.com/pulse/stop-treating-email-addresses-identifiers-prithvi-poreddy-ytbnc/?trackingId=f8udmIVUqS6NuO2A71lOYw%3D%3D
slug: stop-treating-email-addresses-as-identifiers
og_type: article
robots: index, follow
historic_views: 951
---

An employee leaves your company. Eighteen months later, their email address is reassigned to a new hire.

Within days, two things start happening:

First, password reset emails arrive for services IT never knew about; things the previous employee signed up for using their corporate email.

Second, and more concerning: in your provisioned SaaS applications, the new employee's email address matches a 'disabled' account that was never fully deleted. When they authenticate via SSO, they inherit the previous employee's roles, permissions, and data access in systems like Salesforce, Workday, or Slack.

These aren't edge cases. They're predictable outcomes of treating email addresses as recyclable identifiers. This scenario reveals three broader problems that emerge from poor identifier strategy.

Predictable usernames like jsmith, jsmith1, jsmith2 enable account enumeration. Attackers discover valid accounts without triggering alerts, making credential stuffing and targeted phishing trivial.

When Jane Doe marries and becomes Jane Smith, what should be a simple attribute update becomes a three-week project touching forty systems. Technical debt compounds with every name change.

Consider the compliance impact: your auditor asks you to prove terminated employees lose all access within 24 hours. You show IdP deactivation timestamps but can't explain why logs show a terminated employee accessing data because it's the reused email from eighteen months ago.

## What Changed

Twenty years ago, name-based identifiers like ckey or jsmith and reusable email addresses were reasonable choices. Email was primarily for communication, not authentication. Everything ran internally behind your firewall. Identity systems managed hundreds of users.

Today's reality looks fundamentally different. Email addresses function as security credentials across dozens of external systems. Users authenticate to twenty or more SaaS applications as part of their normal workday. Privacy regulations make personally identifiable information in system identifiers problematic. Audit frameworks demand complete traceability. You must trace every access decision back to a specific person, even years after they've left.

The context changed. The identifiers didn't.

## How to Think About Identifiers:

Stop thinking about "the username" as a single thing. You need three distinct layers:

**System Identifier (Immutable)** What the computer uses internally. UUID, A123456, permanent employee number. Users never see it. Applications reference it. Databases use it as foreign keys. Audit logs tie back to it. It's plumbing, not user interface.

**Authentication Credential (Flexible)** What users type when logging in. Email, badge number, chosen username, passkey. Can change or evolve without breaking anything because it maps back to Layer 1. Authentication is a user experience concern. Identity is a data integrity concern.

**Display Name (Human-Readable)** What appears in reports and UIs. "Jane Smith submitted this request." Changes when names change. That's fine; it's display logic, not identity logic.

Most organizations conflate these three layers. That's the source of most identifier problems.

## Identity vs. Attributes: The Fundamental Shift

Think of identity as constant, everything else as mutable attributes.

When Jane Doe marries and becomes Jane Smith, her identity (A123456) remains unchanged while her attributes (name, possibly email) get updated. Every system referencing her identity automatically reflects current attributes.

When she transfers from CompanyA to CompanyB within your corporate family, same identity, different attributes like legal entity, cost center, and manager. No orphaned accounts. No broken audit trails.

One person, one identity, many changing attributes. Legal entity is an attribute, not part of the identity. Employment status is an attribute. Department is an attribute. The identity is the anchor that doesn't move.

## Best Practices

### Establish an immutable system identifier

Choose a system-generated identifier that carries no semantic meaning. Sequential numbers with prefix (A123456), UUIDs, or HR's permanent employee number if truly permanent.

Don't encode information about the person into the identifier. Role, department, employment type: those are attributes that change. The identifier is permanent plumbing.

For existing systems, identify your canonical reference (HR employee ID, directory ObjectGUID, identity system internal ID) and map everything to it.

### Never reuse email addresses

When someone leaves, deactivate the address and mark it unavailable for reuse permanently. Handle collisions at creation time with clear rules: firstname.lastname, then firstname.lastname2.

The temporary awkwardness of john.smith3 beats the security risk of recycling john.smith.

Exception: same person returning within 12-18 months isn't reuse. It's reactivation. Restore their original identity and email.

### Separate login from identity

Users authenticate with email, badge number, chosen username, or passkey. All map back to the immutable identifier. This separation means changing authentication methods doesn't break identity references across systems.

### Tombstone departed identities

Deactivate, don't delete. Preserve the identity record and audit history. Never reuse the identifier or email. You must answer "who had access to what and when" years later. Deleted or reused identities make this impossible.

Tombstone, don't recycle.

## What Not to Do

### Don't use names in system identifiers

Names change through marriage, legal changes, and cultural conventions. Names collide at scale. Names contain PII. Technical debt compounds with every name change.

### Don't use email as the primary key in databases

Email needs to change for name changes, domain changes, and collision resolution. If email is the identifier, changing it requires updating every system. If email is an attribute, changing it is a simple update.

### Don't create new identities for internal transfers

When someone moves from Division A to Division B, same person, same identity. Division is an attribute, not an identity boundary. Creating new identities breaks audit trails and forces users to manage multiple credentials for the same employer.

### Don't encode meaning in identifiers

C123456 for contractors and E123456 for employees looks logical until contractors become employees. The identifier shouldn't change when the relationship changes.

## Key Questions for Your Organization

Can you trace all access decisions back to a specific person across all systems? What happens when an employee changes their name? What's your current policy on email address reuse? How many different identifier types exist for a single person in your organization? When someone transfers between divisions or legal entities, do they get a new identity?

If you can't answer these quickly and consistently, you've found your starting point.

## Moving Forward

Establish the right pattern for new identities now. Map existing identifiers to a canonical source. Migrate opportunistically during natural trigger events: name changes, transfers, application upgrades.

A mixed environment is manageable if you have canonical mapping and new identities follow the new pattern. Don't let perfection block progress.

The organizations that succeed aren't the ones with pristine systems. They're the ones that acknowledge the mess, create a path forward, and execute consistently over time.

In the next article, I'll tackle the practical reality that complicates this model: most SaaS platforms insist on using email addresses as identifiers, and you can't change that.

***

What identifier challenges are you dealing with in your organization? How many different identifier types have accumulated over the years? I'd like to hear about your experiences.
