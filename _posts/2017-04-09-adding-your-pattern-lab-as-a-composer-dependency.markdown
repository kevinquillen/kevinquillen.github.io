---
layout: post
title: Adding Your Pattern Lab as a Composer Dependency
date: 2017-04-09 12:00:00
category: drupal
tags:
 - composer
 - pattern lab
image: /assets/images/code-3.jpg
---

On a recent project, we had taken a Pattern Lab based prototype and created a Drupal 8 theme from it. In order to track updates and stay independent of the work happening by the front end team, I added the Pattern Lab repo to the project as a git submodule. 

This is a practical approach, and for all intents and purposes, it _worked_, but it just didn't feel _right_ within the Drupal 8 architecture.

On a new project we began this year, I wanted to take some time to get us set up correctly. To me, that meant controlling the entire codebase from Composer. The composer.json file should be the blueprint for the entire application. 

Most people think that, like npm, packages for Composer must exist in packagist or they aren't usable via Composer. This is not true. You can definitely add public or private repositories to your composer.json file and pull in your own packages as dependencies. 

In fact, Drupal 8 does this for modules and themes. Taking a cue from that, I added our private GitHub repository that pointed to our Pattern Lab for this project:

<pre class="language-json"><code class="language-json">
    "repositories": {
        "drupal": {
            "type": "composer",
            "url": "https://packages.drupal.org/8"
        },
        "pattern-lab": {
            "type": "vcs",
            "url":  "git@github.com:(orgname)/(repository_name).git"
        }
    },
</code></pre>

After adding that, all I needed to do was have someone add a basic composer.json to the root of the Pattern Lab:

<pre class="language-json"><code class="language-json">
{
  "name": "(orgname)/(repository_name)",
  "description": "The Pattern Lab prototype for this project."
  "require" : {}
}
</code></pre>

Now, to include that Pattern Lab as a dependency, I can execute `composer require`:

<pre class="language-bash"><code class="language-bash">
composer require --dev orgname/repository_name
</code></pre> 

The Pattern Lab is now pulled into `vendor/` like other Composer packages. Whenever there are changes made to the Pattern Lab, getting them is simple:

<pre class="language-json"><code class="language-json">
composer update orgname/repository_name
</code></pre>

It doesn't end here, though. Whenever I get updates, I also want to copy any SASS, Javascript, and SVG files over to the right directory in my Drupal theme. If you have ever dug through a Pattern Lab based prototype, you can get lost pretty quickly and manual copying is tedious and error prone.

I am leveraging the <a href="https://github.com/acquia/blt" target="_blank">Acquia BLT</a> scaffolding tool to control my Drupal 8 build. One of the perks is that it comes with a lot of phing tasks already ready to go for your build. Two of them in particular that are very useful for theming are `frontend:setup` and `frontend:build`.

<pre class="language-yaml"><code class="language-yaml">
target-hooks:
  frontend-setup:
    dir: '${docroot}/themes/custom/mytheme'
    command: 'npm install'
  frontend-build:
    dir: '${repo.root}'
    command: './scripts/frontend/copy-assets.sh && ./scripts/frontend/fixpath.sh && ./scripts/frontend/build-assets.sh;'
</code></pre>

This does two things for me. One, it ensures that every time the project is built, `npm install` is executed to bring in necessary tools to the theme, namely Gulp.js. The great thing about the tasks in BLT is you can provide scripts that should be executed too, you are not limited to just a single command.

These scripts I made copy in the assets from Pattern Lab to the theme, fix any paths (like relative image paths in Pattern Lab to what the path needs to be to work in a Drupal theme), and finally, executing all Gulp tasks needed to build the assets and svg sprite map. All in all, this entire process takes a mere 8 seconds.

For example, here are the fixpath and build-assets scripts:

<pre class="language-bash"><code class="language-bash">
#!/usr/bin/env bash

echo "Correcting paths for Drupal..."
grep -rl "/assets/img" ./docroot/themes/custom/mytheme/assets/scss | xargs sed -i '' "s/\/assets\/img/\/themes\/custom\/mytheme\/assets\/img/g
</code></pre>

<pre class="language-bash"><code class="language-bash">
#!/usr/bin/env bash

cd docroot/themes/custom/mytheme/tools/gulp;
gulp css;
gulp js-libraries;
gulp js;
gulp svg-sprite;
</code></pre>

Overall, this saves a _ton_ of time and is a much more preferred method to me over how I was managing the previous project.
