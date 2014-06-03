---
layout: post
title:  "Up and Running with Behat, Drupal, & Vagrant"
subtitle: There be no dragons here, I promise.
body-color: blue
date:   2014-06-03 14:00:00
category: general
body-color: seagreen
excerpt: Simplify your Drupal testing with Behat, Mink, Vagrant with Behavior Driven Development.
---

<h3>The Initiation
<br><small>Why you came.</small></h3>

Alright. This is it. You're here because you've heard of this mysterious 'Behat' while searching for best practices in
testing Drupal.

Up through Drupal 7, core and contrib relied on a method of testing leveraging the SimpleTest library. While it has served a
purpose, some of us need a much faster and clearer way of testing. Also, if you're a designer, you're probably looking for a easier
point of entry to not only testing your front or backend UI, but contributing to testing functional (behaviors) pieces of the application. You
may not have the best programming chops, or maybe OOP scares you.

Or simply, *maybe you just need to get shit done without much hassle*.

Writing tests where you look to test behaviors from a user perspective is called **"Behavior Driven Development"**. Adding up multiple
tests together into feature testing forms a solid group of user acceptance tests. When the tests pass, you know you are facilitating the
user stories of the features you were asked to implement. You don't have to go back to your QA team or project manager and say "okay I'm done"
and wait for them to click around for hours and tell you things are still missing.

#### Wait, so Behat is... ?

From the official Behat site:

>Behat is a tool that makes behavior driven development (BDD) possible. With BDD, you write human-readable stories that describe the behavior of your application. These stories can then be auto-tested against your application. And yes, it’s as cool as it sounds!

Your OOP skills to work with other testing suites may be rusty or non-existent. But everyone is able to write and understand basic descriptive sentences.

#### Right... but what is Behat really?

[Behat](http://behat.org/) is a PHP implementation of the Gherkin language, which powered [Cucumber](http://cukes.info/) for Ruby. It provides a way to tell the system in plain English how to go about
testing your feature points *as if it were the user doing it*. Not only is this a great way to automate tests, it cuts down hours of tedious
clicking by a human to say that something is working or not. Human testing is also highly unreliable for building confidence in the
functional stability of a whole application.

#### I think I understand... can I have a real world example?

Let's take the simplest user test we can think of in Drupal. A site administrator should be able to create and edit page content. Now, you should know how to
do this in Drupal manually, it's very straightforward. But, let's get Behat to do it for us, and tell us the results:

<pre class="language-markup"><code class="language-gherkin">
  Feature: Content Management
    When I log into the website
    As an administrator
    I should be able to create, edit, and delete page content

    Scenario: An administrative user should be able create page content
      Given I am logged in as a user with the "administrator" role
      When I go to "node/add/page"
      Then I should not see "Access denied"
</code></pre>

Now, we execute Behat from the command line:

<pre class="language-markup">
<code class="language-bash">
vendor/bin/behat

..................

1 scenarios (1 passed)
3 steps (3 passed)
0m1.398s
</code>
</pre>

Bingo! Your first test. Not only does this serve as an example, it's a real useful test as well. More importantly, it took about a second total to
 run this test.

#### That sounds great, but it probably can't test Javasc-

Yes, it can. With the additional Selenium2 driver, you can test front end interactions like AJAX events or filling out a form just as easy.

Try to contain your excitement. I couldn't believe it either until I saw it happen. But seeing is believing, so lets get ready.

<h3>Setting up your machine
<br><small>Okay, there <em>may</em> be a few dragons here. Let's slay them.</small></h3>

This post is from a perspective of a developer (me) running virtualized environments with Vagrant. If you don't use Vagrant, you probably won't
be able to follow along very well. For that, my heart goes out to you, but do consider switching - it's an exceptional tool. For you Windows
folks... wish I could help you too.

#### What you'll need

- OSX 1.7+ or modern flavor of Linux
- Homebrew or other package management tool
- Composer
- An IDE (I live and die by [PHPStorm](http://www.jetbrains.com/phpstorm/))
- Terminal/command line access

First, if you have a Vagrant LAMP stack going, great. If not, you may want to grab one. There are many online to pick from or you can make
your own box setup at [PuPHPet](https://puphpet.com/). I don't want to get into the nitty gritty of setting up Vagrant itself - there are
already many posts on the subject. Everything we have will run on Vagrant which is tuned to be just like our production environments on our
host server.

Secondly, install [Composer](https://getcomposer.org/). [Composer](https://getcomposer.org/) is what will bring the necessary third party
PHP libraries together so we can run tests.