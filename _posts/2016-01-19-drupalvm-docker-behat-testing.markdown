---
layout: post
title:  "Behat Testing with DrupalVM and Docker"
date:   2016-01-19 3:30:00
category: drupal
tags:
 - composer
 - drupalvm
 - behat
 - selenium
 - docker
excerpt: Ready to test your Drupal site with Behat and Docker?
image: /assets/images/code-1.jpg
published: false
---

I worked quite a bit at getting Behat working in the DrupalVM for
doing behavioral testing of Drupal sites, and while that part was relatively easy, the _ideal_
testing setup took a bit more work to get going.

My goal was this:

1. Use a testing language everyone can use and understand (Behat)
2. Test under different screen resolutions
3. Test in Chrome and Firefox
4. Take screen shots on errors
5. Create a file with the window HTML on error
6. Be able to connect and view tests running with a VNC client

I use [DrupalVM](http://www.drupalvm.com) for al Drupal development, it is the best VM out there for Drupal. Jeff Geerling had added an optional Selenium add on in 2015, creating a server hub running in the VM.

If you have ever done work before with Selenium, you know it can be kind of a pain to set up. With [DrupalVM](http://www.drupalvm.com) it's a matter of including the add on.

Simple enough, that will get you started. But with vanilla Selenium, you'll be limited to just Firefox. If you want to use Chrome, it's kind of a pain in the ass to amend the VM to add the needed packages on. That is where Docker comes in to play.

### Get the Drupal Behat Extension

First, you'll need the [Drupal Behat Extension](https://github.com/jhedstrom/drupalextension) in your project. It's easiest to install with Composer. The extension already comes with Behat 3.0 and all the necessary dependencies, so that's all you need to grab.

Now, depending on your setup, the following steps may work a little differently for you.

First, setup your behat.yml file like this.
