---
layout: post
category: lessons
tags:
  - intro
  - tutorial
  - phpunit
title: Setting up PHPUnit testing in Drupal 7 with PHPStorm.
tagline: "Drupal 8 ships with PHPUnit tests in its core, replacing SimpleTest. Here is how to get it running in Drupal 7."
icon: cog
published: true
---

{% include JB/setup %}

## Why PHPUnit over SimpleTest?

If you're developing custom applications, SimpleTest may either not do enough of what you need, or way too much - or take too long. In most cases, you likely just want to test parts
of your code that make up the whole - unit tests.

Unit tests can be executed outside of Drupal, and very quickly. The speed and efficiency of it make it a good tool to use in concert with TDD. Editors like PHPStorm also support PHPUnit
for testing and is really simple to setup. On top of that, you can also add a little more to your test scripts to gain the functionality in Drupal you may need to create assertions.

### Requirements

- PHPStorm
- Composer

### Step 1: Get and configure Composer for your project.
