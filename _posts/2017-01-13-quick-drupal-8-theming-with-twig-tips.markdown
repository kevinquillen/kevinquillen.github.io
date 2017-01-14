---
layout: post
title: Quick Drupal 8 Theming Tips
date: 2017-01-13 12:00:00
category: drupal
tags:
 - twig
 - theming
image: /assets/images/code-4.jpg
---

If you are theming an entity (in this case, node) and you want to display the created or changed date in a different format, you can use the following to do just that. In my case, I am creating a couple of view modes with their respective twig templates and need to show post dates in a few different formats.

Use `getCreatedTime` to fetch the node created date, and use `format_date` against it, supplying a date format machine name:

<pre class="language-twig"><code class="language-twig">
&#123;&#123; node.getCreatedTime|format_date('homepage_article') &#125;&#125;
</code></pre>

The same works for changed, too, with `getChangedTime`:

<pre class="language-twig"><code class="language-twig">
&#123;&#123; node.getChangedTime|format_date('last_changed') &#125;&#125;
</code></pre>

Granted, you could install modules like Display Suite to expose these as 'extra fields' in the display and adjust the formatting options, but I am running my first Drupal 8 projects as lean and mean as possible.

Here is another case. Perhaps you have a component that is wrapped entirely in a link. This would mean that you can't really rely on the field formatter to do the job, because this field wraps any other field and links to the destination. This would be a common case for a call to action block type, for example, or a card component. Maybe it just links to the node - lets look at both cases.

Linking to a node:

<pre class="language-twig"><code class="language-twig">
&lt;a href="&#123;&#123; path('entity.node.canonical', &#123;'node': node.id&#125;) &#125;&#125;"&gt;
  // other fields/markup and output in between
  &#123;&#123; content.field_image &#125;&#125;
  &#123;&#123; content.field_description &#125;&#125;
&lt;/a&gt;
</code></pre>

Linking from a field value:

<pre class="language-twig"><code class="language-twig">
&lt;a href="&#123;&#123; content.field_link.0.value['#url']&#125;&#125;"&gt;
  &#123;&#123; content.field_image &#125;&#125;
  &#123;&#123; content.field_description &#125;&#125;
&lt;/a&gt;
</code></pre>

The second one isn't particularly clean, although I haven't seen a consensus on if it is better to preprocess and inject new variables or to just do it this way.

There are more useful twig filters listed on the <a href="https://www.drupal.org/docs/8/theming/twig/filters-modifying-variables-in-twig-templates" target="_blank">Drupal theming docs page</a>.
