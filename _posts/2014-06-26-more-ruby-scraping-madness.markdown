---
layout: post
title:  "More scraping magic with Ruby: UTF-8 encoding and XPath"
subtitle: So much magic, even David Copperfield can't compete.
date:   2014-06-26 14:00:00
category: programming
tags: ruby, drupal
body-color: darkgreen
published: false
---

What? Thought we were done? There are still things left to learn here. In Nokogiri, the <code>.css</code> method is simple, straightforward, and familiar if you have a background in jQuery.

But, if you have multiple elements on the page to select, suddenly that method is lacking in power. We want to select multiples of anything, anywhere in the DOM. This is where <code>XPath</code> comes in.