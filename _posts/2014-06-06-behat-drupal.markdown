---
layout: post
title:  "Up and Running with Behat, Drupal, & Vagrant"
subtitle: There be no dragons here, I promise.
date:   2014-06-06 14:00:00
category: testing
body-color: seagreen
excerpt: Behat is a PHP implementation of the Gherkin language, which powered Cucumber for Ruby. It provides a way to tell the system in plain English how to go about testing your feature points as if it were the user doing it. Not only is this a great way to automate tests, it cuts down hours of tedious clicking by a human to say that something is working or not.
---

<div class="panel panel-warning">
  <div class="panel-heading">
    <h3 class="panel-title">Whoa there!</h3>
  </div>
  <div class="panel-body">
    This post will be applicable to you if you develop within a Vagrant virtual environment in OSX/Linux. If not, or you are a Windows user,
    it may not be much help! But if you're curious anyway, read on.
  </div>
</div>

<br>
<hr>
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

#### What we'll be using

- Vagrant LAMP box
- Behat
- Mink
- [Drupal Behat Extension](http://dspeak.com/drupalextension/intro.html)

The [Drupal Behat Extension](http://dspeak.com/drupalextension/intro.html) is what kicked off my entire foray into the world of Behat.

With the extension, it adds lots of prebuilt step definitions for you that are ready to use. A step definition is what Behat uses to evaluate
your expressions, and we will look at those in a little bit.

First, if you have a Vagrant LAMP stack going, great. If not, you may want to grab one. There are many online to pick from or you can make
your own box setup at [PuPHPet](https://puphpet.com/). I don't want to get into the nitty gritty of setting up Vagrant itself - there are
already many posts on the subject. Everything we have will run on Vagrant which is tuned to be just like our production environments on our
host server.

##### Append your Vagrantfile

One thing we need to do is append the end of your Vagrantfile to execute a shell script. This script will setup the necessary packages
needed on the virtual machine to run Selenium tests. The reason we implement this shell script instead of downloading the jar file directly is so
that the less technical people on distributed teams do not have difficulty running it - Vagrant will take care of that for us.

Create a setup.sh file in your Vagrant project and paste in the following:

<pre class="language-markup">
<code class="language-bash">
#!/bin/sh
#set -e

if [ -e /.installed ]; then
  echo 'Already installed.'

else
  echo ''
  echo 'INSTALLING'
  echo '----------'

  # Install Java, Firefox, Xvfb, and unzip
  apt-get -y install openjdk-7-jre-headless firefox xvfb unzip

  wget "http://selenium-release.storage.googleapis.com/2.42/selenium-server-standalone-2.42.1.jar"
  mv selenium-server-standalone-2.42.1.jar /usr/local/bin

  # So that running `vagrant provision` doesn't redownload everything
  touch /.installed
fi

# Release old locks
echo "Releasing old XVFB locks from /tmp..."
cd /tmp
sudo rm -rf .X*-lock

echo "Starting Selenium Server. Default screen resolution: 1280x1024."
cd /usr/local/bin
DISPLAY=:1 xvfb-run --server-args="-screen 0 1280x1024x8" java -jar ./selenium-server-standalone-2.42.1.jar &amp;

echo "Give Selenium Server a few minutes to fireup, then run your BDD tests."
</code>
</pre>

This looks like a lot - but really, the script only needs to run this once. It goes through and downloads Java and Firefox and installs it
into the virtual machine. When Selenium releases new .jar files, update the URL it is pointing at.

At the top, the <code>.installed</code> file prevents reinstallation on every <code>vagrant provision</code>. But you can easily ssh into
the machine, delete this file, and it will run the whole process again on the next revision.

Other packages, like <code>xvfb</code> enable the virtual machine to run a headless version of Firefox so Selenium can use it as a client. Now,
all you need to do is share your Vagrantfile and Puppet/chef/Ansible config with your team, and they now have this in their arsenal too.

<br>
<hr>
<h2 class="text-center">Whoa whoa whoa damn, I need a break!</h2>
<p class="text-center">Me too. Grab a drink or coffee. We are halfway there now.</p>
<hr>
<br>

Okay. Ready? It's all downhill from here.

##### Install Composer

Secondly, install [Composer](https://getcomposer.org/). [Composer](https://getcomposer.org/) is what will bring the necessary third party
PHP libraries together so we can run tests. Install [Composer](https://getcomposer.org/) globally so it can be run from any directory on
your machine.

Once you have [Composer](https://getcomposer.org/) installed, we need to provide a simple composer.json file telling it what libraries
we need. If you have a composer file already, just add to it.

<pre class="language-markup">
<code class="language-javascript">
{
  "name": "YOURNAME/PROJECTNAME",
  "description": "PROJECTNAME",
  "require": {
    "behat/mink": "1.5.*@stable",
    "behat/mink-goutte-driver": "*",
    "behat/mink-selenium2-driver": "*",
    "drupal/drupal-extension": "*"
  }
}
</code>
</pre>

This file should sit in the root of your project (outside of the docroot). Next, we are going to tell Composer to fetch and install these
packages.

In terminal:

<pre class="language-markup">
<code class="language-bash">
composer install
</code>
</pre>

That's it! It will process and download the libraries to a new 'vendor' folder. Add this folder to your .gitignore - it's not something you
want to have version controlled.

##### Configure Behat

Now, we need to create a simple config file for Behat. Create a file in your project root and name it 'behat.yml'.

Inside of the behat.yml file, paste in this basic config:

<pre class="language-markup">
<code class="language-javascript">
default:
  context:
    class: 'FeatureContext'
  paths:
    features: 'features'
    bootstrap: 'features/bootstrap'
  extensions:
    Behat\MinkExtension\Extension:
      goutte: ~
      javascript_session: selenium2
      selenium2:
        wd_host: http://VHOST_SERVER_ALIAS:4444/wd/hub
      base_url: http://VHOST_SERVER_ALIAS
    Drupal\DrupalExtension\Extension:
      blackbox: ~
      api_driver: 'drupal'
      drupal:
        drupal_root: '/path/to/your/project/docroot'
</code>
</pre>

Above, replace VHOST_SERVER_ALIAS with your local development URL. If your local URL is <code>local.mysite.com</code>, enter that. This hooks up
the Selenium driver and enables it to browse and talk to your site.

Remember the <code>setup.sh</code> file above? We did that so we can use the virtual machine alias in the behat.yml config above instead of
using <code>localhost</code> like a lot of tutorials often tell you to use. Behat will execute Selenium2 tests on the virtual machine now
just like any other tests with Goutte, Zombie, or PhantomJS.

##### Where are we at this point?

We (or you) should now have Composer and Behat successfully installed.

##### How can I tell?

Navigate to your project root in terminal. At the prompt, type:

<code>vendor/bin/behat --init</code>

Behat should generate a features folder in the root and place a bootstrap and basic context there. If it does, great! If not, retrace your
steps to see if you missed something.

Now, for the magic. Composer pulled in an extension for Drupal and Behat. In order to leverage it, we need to tweak one line of code in
the <code>FeatureContext.php</code> file in features/bootstrap:

<pre class="language-markup"><code class="language-php">
class FeatureContext extends \Drupal\DrupalExtension\Context\DrupalContext
</code></pre>

This hooks into the Drupal Behat extension, and grants you access to dozens of step definitions to use in your tests. To see them, type:

<code>vendor/bin/behat -dl</code>

This list is the list of step definitions you can use in your tests that *require absolutely no code to make work*.

I am going to have some mercy on you now, and let you review what we just covered. Get what we have here up and running, and try the example test back
at the start of the article. In the next post, I will go deeper into Behat tests and custom step definitions.

**Questions?** [@kevinquillen](https://twitter.com/kevinquillen)

**Posted on: {{ page.date | date: "%B %-d, %Y" }}**