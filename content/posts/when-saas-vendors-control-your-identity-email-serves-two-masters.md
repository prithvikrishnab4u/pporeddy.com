---
title: "When SaaS Vendors Control Your Identity: Email Serves Two Masters"
description: How to manage identifiers when SaaS platforms require email as the primary identifier, and you can't change their architecture.
summary: Practical strategies for maintaining immutable identifier architecture internally while working within SaaS platform constraints that require email as the primary identifier.
date: 2025-11-19T00:00:00Z
lastmod:
author:
  - Prithvi Poreddy
tags:
  - identity management
  - SaaS
  - email identifiers
  - enterprise identity
  - IAM
  - immutable identifiers
  - identity architecture
  - provisioning
  - offboarding
  - SCIM
categories:
  - Identity and Access Management
  - Enterprise Security
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
canonicalURL: https://www.linkedin.com/pulse/when-saas-vendors-control-your-identity-email-serves-two-poreddy-dai9c
slug: when-saas-vendors-control-your-identity-email-serves-two-masters
og_type: article
robots: index, follow
series: ["Enterprise Identifiers"]
historic_views: 1908
---

In the [previous article](https://iam.ninja/posts/stop-treating-email-addresses-as-identifiers/), we established the principle: use immutable system identifiers internally and treat email as a mutable attribute. One person, one identity. Then you try to implement it.

Your SaaS vendors don't care about your immutable identifiers. Salesforce wants an email address. Workday wants an email address. Slack, Microsoft 365, Google Workspace all want email addresses. Not as one attribute among many, but as the primary identifier that defines the user account.

You can't change this. It's their architecture.

Email serves two masters: it's both your business communication tool and a technical identifier in systems you don't control. This creates fundamental tension with the principles from [Article 1](https://iam.ninja/posts/stop-treating-email-addresses-as-identifiers/).

## Why This Creates Problems

SaaS vendors don't care about your canonical mapping.

Some platforms treat email changes as a simple update. You send the new email via SCIM or API, they update their internal records, and everything continues working. Historical data remains intact. Roles and permissions stay attached to the account.

Other platforms treat email changes as essentially creating a new user. The old email address's account gets orphaned with all its historical data, roles, and permissions still attached but inaccessible. The new email address creates a fresh account that starts from zero. Now you're manually migrating data, reconfiguring permissions, and explaining to users why half their work disappeared.

The worst case is platforms that disable accounts on email change but don't properly clean them up. Eighteen months later when you assign that old email to a new employee, they inherit the disabled account with all its residual permissions. This is exactly the scenario from Article 1's opening, and it's not hypothetical.

## Understanding SaaS Email Behavior

Before you deploy any SaaS application, test how it handles email address changes. Set up a test account with realistic data and permissions. Change the email address and observe what happens.

Does the account continue working seamlessly? Does historical data remain accessible? Do group memberships and permissions stay intact? Or does the platform create a new account and orphan the old one?

Some platforms handle this well. Some don't. Some behave differently depending on whether you change email through SCIM, their admin console, or SSO attribute mapping.

For platforms that don't handle email changes well, factor this into your email collision strategy. Sometimes accepting jane.smith2 is less painful than forcing an email change that breaks everything. This isn't ideal. It's pragmatic.

## Proper SaaS Offboarding

The email reuse problem stems from improper offboarding in SaaS applications. Disabling an account often just sets a status flag without actually removing access grants.

When someone leaves, your provisioning system should follow a four-step process for each SaaS application:

**First**, suspend or deactivate the account immediately. Don't delete the account yet. Preserve audit trails and handle data ownership.

**Second**, remove all roles and permissions explicitly. Don't rely on suspension to block access.

**Third**, reassign ownership of any data or resources. Documents they created, workflows they own, reports they built.

**Fourth**, after a retention period of 90 to 180 days, fully delete the account from the platform's user directory entirely.

The goal: if email reuse somehow happens despite your policy against it, there's no residual access or data in SaaS applications. The new person with that email gets a truly fresh start.

Most provisioning automation stops at step one. Steps two through four require enhanced automation or documented procedures. Test your offboarding process with real accounts in real systems.

## The Pragmatic Approach

You can't force SaaS vendors to change their architecture. Salesforce isn't going to redesign their identity model because you prefer immutable identifiers.

What you can control:

- **Maintain immutable identifiers internally as your source of truth.** Your identity system knows that A123456 is Jane Smith, currently using jane.smith@company.com, previously jane.doe@company.com. Every access decision, every audit query, every integration traces back to A123456.

- **Treat email as a mutable attribute that happens to be required by external systems.** When email changes, your identity system updates the attribute and pushes the change to connected systems through provisioning.

- **Never reuse email addresses to minimize the blast radius.** This remains the most important control you have.

- **Test email change handling before deploying new applications.** Make it part of vendor evaluation.

- **Document proper offboarding procedures and test them periodically.**

This isn't perfect architecture. It's minimizing risk in a world you don't fully control.

## Moving Forward

The gap between how identity should work and how SaaS vendors force it to work isn't going away. Maintain architectural integrity internally while pragmatically handling external constraints.

What SaaS platforms have you encountered that handle email changes particularly well or particularly poorly? How are you managing the tension between internal identity architecture and external platform constraints? I'd like to hear what's worked in your experience.