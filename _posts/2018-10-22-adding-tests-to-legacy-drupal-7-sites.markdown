---
layout: post
title: Adding Tests to Legacy Drupal 7 Sites
date: 2018-10-22 12:00:00
category: drupal
tags:
 - testing
image: /assets/images/code-3.jpg
published: false
---

Most developers at some point or another will inevitably need to add custom code to a site. In Drupal, this could be anything from extending core functionality, altering forms, or creating entirely new functionality.

It's all testable.

Recently, I had to pick up a project first launched in 2015 and add a lot of new functionality to it. I started the work from a test-first or TDD (test driven development) perspective. Along the way, I also added tests for already existing code to cement the fact that the code was working before new work began.

These practices help produce stable, predictable results that provide confidence in your code.

I will walk you through some real tests that were written along with some of the hurdles faced along the way.

### Enable SimpleTest

To do unit and functional tests in Drupal 7, you will need SimpleTest. The easiest way to do this is to setup a second site in your local development site in my opinion. If you have settings in your settings.php file like Memcache settings for example, this will interfere with SimpleTest's ability to execute tests. This second installation can just use the minimal profile, and have SimpleTest enabled.

### Setup Composer

Some tests may require mocking of services or classes. We can use a library like <a href="https://github.com/phpspec/prophecy">Prophecy</a> to assist with this. To do that, we need to get the package with Composer.

In Drupal 7, I would strongly advise against using the Composer Manager module and to just use Composer directly. On this particular project, the first thing I did was remove Composer Manager and just use Composer directly to reduce complexity. This also makes it easier to build the project normally with a service like TravisCI or a local script.

Adding Composer to the project is easy. From the root:

<pre class="language-bash"><code class="language-bash">
composer require phpspec/prophecy:~1.0
</code></pre>

Depending on how you have your project set up, you need to add the autoloader so the application understands how to find packages added with Composer.

### Writing Your First Test

The simplest kind of test you can do is a unit test.
