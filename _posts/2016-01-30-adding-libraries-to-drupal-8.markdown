---
layout: post
title:  "Adding External Libraries to Drupal 8"
date:   2016-01-30 10:30:00
category: drupal
tags:
  - drupal 8
excerpt: Ready to test your Drupal site with Behat and Docker?
image: /assets/images/code-3.jpg
---

When developing modules for Drupal, there inevitably comes a time when you may need to include an external CSS or Javascript plugin or library for your project.

Up through Drupal 7, this was fairly easy to do by leveraging the <a href="https://www.drupal.org/project/libraries" target="_parent" title="Drupal Libraries module">Libraries API module</a> to define and manage dependencies. However, the 8.x version is not complete yet - but there is an easy way to carry on until a solution exists.

Recently, we released two modules for Drupal 8 that make use of external plugins as part of their integrated functionality: <a href="https://www.drupal.org/project/codesnippet" target="_blank" title="CodeSnippet Syntax Highlighting Drupal">CodeSnippet</a> and <a href="https://www.drupal.org/project/igrowl" target="_blank" title="Drupal 8 Growl Messages">iGrowl</a>.

Both modules need plugins, but we don't want to package them into the module as there are <a href="https://www.drupal.org/node/422996" target="_parent" title="3rd party libraries and content on Drupal.org">licensing and policies prohibiting this for good reason</a>. There isn't a way to use Bower or Node either, and that just puts more dependencies on the end user when installing.

One accepted practice in Drupal 8 is to create a **libraries** folder in your Drupal root, which is where these plugins and libraries can live. As an end user, the only thing to do is to download the plugins and place them there, and you&#39;re good to go with those modules. We've also included instructions in the modules on doing this. Do note that the **libraries** folder should be outside of the **/core** folder.

From there, you can point your module to look for code in the libraries folder either in your classes or from your modulename.libraries.yml file. Look at <a href="https://www.drupal.org/project/codesnippet" target="_blank" title="CodeSnippet Syntax Highlighting Drupal">CodeSnippet</a> to see how this works.

Until the <a href="https://www.drupal.org/project/libraries" target="_parent" title="Drupal Libraries module">Libraries API module</a> catches up or a better method comes along, this is how I have been solving the problem and decoupling libraries/plugins from modules.
