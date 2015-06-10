---
layout: post
title:  "Fixing a Segfault in Drupal"
subtitle: A very unholy error
date:   2015-06-10 12:30:00
category: drupal
tags:
 - gulp
 - grunt
excerpt: If you use Gulp or Grunt in your projects, there is a chance you can may inadvertently trigger a segmentation fault on the server. This is a very unusual error to see in Drupal, and it can be hard to track back what actually caused it.
image: /assets/images/code-3.jpg
---

If you use Gulp or Grunt in your projects, there is a chance you can may inadvertently trigger a segmentation fault on the server. This is a very unusual error to see in Drupal, and it can be hard to track back what actually caused it.

This is [due to a bug in Drupal core](https://www.drupal.org/node/2329453). Some packages that are downloaded may contain .info files in them or in their dependencies. When the Drupal cache is cleared and it parses the system for theme information, it assumes the .info file is within a theme directory and tries to collect information on the theme - but can't, and triggers the segfault.

The only way out of this until Drupal core is fixed is to delete the .info files from node_modules folder(s). You can do this a couple of ways.

To fix the immediate problem, you can execute this command in terminal from the directory that contains npm packages:

<pre class="language-markup"><code class="language-bash">
find node_modules/ -name '*.info' -type f -delete
</code></pre>

To prevent this from happening again, you can add the command to the postinstall section of your Gulp or Grunt file:

<pre class="language-markup"><code class="language-javascript">
"scripts": {
  "postinstall": "find node_modules/ -name '*.info' -type f -delete"
}
</code></pre>

If you have a custom setup, you may need to adapt the path to node_modules above to work for you.

Once the command is completed, your Drupal site should come back to life!
