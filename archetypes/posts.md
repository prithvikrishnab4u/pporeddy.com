---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
description: ""  # meta / SEO description, ~155 characters
summary: ""      # blurb shown on the home page and /posts/
date: {{ .Date | time.Format "2006-01-02" }}T00:00:00Z
lastmod: {{ .Date | time.Format "2006-01-02" }}T00:00:00Z
author: ["Prithvi Poreddy"]
tags: []
# One topic: Continuous Access, AI Agents, Identity Governance, IAM Architecture,
# or Other Writing. It is shown as the blue pill. New topic? Add content/categories/<slug>/_index.md.
categories: []
slug: "{{ .File.ContentBaseName }}"  # the URL; never change it after publishing
draft: true
ShowShareButtons: true
# canonicalURL: ""        # LinkedIn Pulse original, if published there first
# series: ["Series Name"] # then add {{< series >}} to the body
# cover:
#   image: "images/my-cover.png"  # relative to static/, no leading slash
#   alt: ""
#   relative: true
---
