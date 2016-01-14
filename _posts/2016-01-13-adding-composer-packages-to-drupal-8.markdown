---
layout: post
title:  "Adding Composer Packages to Drupal 8"
date:   2016-01-13 9:30:00
category: drupal
tags:
 - composer
excerpt: Adding Composer packages to Drupal 8 is pretty easy.
image: /assets/images/code-2.jpg
---

Adding Composer packages to Drupal 8 is pretty easy.

There is a module called Composer Manager that can be used to add packages that modules require, but there are instances where you just need a package (and no need to create a module).

A great example of this is the [Drupal Behat Extension](https://github.com/jhedstrom/drupalextension). If you're like me and do a lot of behavior driven development, you likely have this, and if not, you need to get it.

To get the extension, run this in the command line (make sure you are **not** in the /core folder!):

<pre class="language-markup">
<code class="language-bash">
composer require drupal/drupal-extension='3.1.5'
</code>
</pre>

Voila!

Now you can get a jumpstart with Behat on any Drupal project.
