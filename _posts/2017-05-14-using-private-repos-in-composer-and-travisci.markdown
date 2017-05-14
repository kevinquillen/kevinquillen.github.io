---
layout: post
title: Using Private Repos in Composer and TravisCI
date: 2017-05-14 12:00:00
category: automation
tags:
 - travisci
 - drupal
 - composer
image: /assets/images/tmux.jpg
---

In my <a href="http://localhost:4000/drupal/2017/04/09/adding-your-pattern-lab-as-a-composer-dependency">last post</a>, I detailed how you can add new repository endpoints in your composer.json file for your own repos.

This is working great for the projects we are currently working on, but I ran into a snag when I setup a TravisCI build - TravisCI was unable to authenticate and pulldown from that repository. Since it is private, even if you change the url from the ssh url to the https url for the repo, it will still return a 404 error.

The 404 error is _actually_ an access denied error, it just returns 404 for security reasons. Better for people to think something doesn't exist when poking around, although this can be confusing at first.  

The way around this was to log in to my GitHub account and create a <a href="https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/" target="_blank">personal access token</a>. Back in the TravisCI build settings, I added the token with the label "GITHUB_TOKEN" - the value is encrypted and then injected as an environment variable for the build to use.

The final step was to grant composer this token by updating the `.travis.yml` file `before_install` stage and setting it into the Composer config:

<pre class="language-yaml"><code class="language-yaml">
before_install:
  - phpenv config-rm xdebug.ini
  - composer self-update
  - composer config github-oauth.github.com ${GITHUB_TOKEN}
  - composer validate --no-check-all --ansi
  - composer install -n
</code></pre>

After this change, the build finally turned from red to green and stopped failing on the private dependency we are pulling in. Composer uses the token which then grants it access to fetch the dependency.

In the future, it is likely easier to create a dedicated CI user that has access instead of using tokens. To note, I was initially using the `CI_USER_TOKEN` and setting a value. This worked for a day, when for no reason I could see, stopped working. I would advise not relying on that.
