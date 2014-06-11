---
layout: post
title:  When Internet Explorer Strikes
subtitle: Strike back.
date:   2014-06-11 14:00:00
category: ie
tags: javascript
body-color: mustard
published: false
---

There really aren't many platforms or technologies out there that a developer dreads more than Internet Explorer. Nothing out there has caused more wasted hours on a project
than possibly [reddit](http://reddit.com) or an aging Windows installation.

We all know the deal. Internet Explorer chooses to interpret CSS/JS in the way it sees fit and typically winds up behaving different than any other browser out there. This is not
a good thing, by the way - but the IE team thinks it is. Things have gotten better since version 8, but, I say that in a subjective manner.

The most common problem that bites people in the ass is one that seems fairly innocuous and is always overlooked in the course of debugging - since itself is a tool *used for debugging*.

<pre class="language-markup"><code class="language-javascript">
console.log(foo);
</code></pre>