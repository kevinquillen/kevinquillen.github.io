---
layout: post
title:  Using Live Templates in PHPStorm
date:   2014-07-01 10:10:00 AM
category: tools
tags:
 - ide
 - phpstorm
 - drupal planet
body-color: mustard
excerpt: PHPStorm and the JetBrains suite of products are without a doubt, the best IDEs on the market for their respective applications. If you do a lot of custom development, you owe it to yourself to learn and use every tool this IDE can afford you.
subtitle: Put more tools in your toolbelt
published: TRUE
---

[PHPStorm](http://www.jetbrains.com/phpstorm/) and the [JetBrains suite](http://www.jetbrains.com/products.html) of products are without a doubt, the best IDEs on the market for their respective applications. I have tried damn near
every IDE out there, going as far back as HotDog HTML (remember that?) all the way over to VisualStudio 2014 and everything in between.

For years I was basically stuck using Dreamweaver because there wasn't really an alternative at the time, besides Notepad++ (which for me, on Windows,
is still my goto editor). Eclipse and Netbeans were free, but they always felt bloated, buggy, and lacking.

[JetBrains](http://www.jetbrains.com/products.html) knows just what I need - I do not have to look further for my One True IDE&trade;.

One of my favorite features of any IDE is code sense where you start typing a function name or class, then tab to automatically complete it. [PHPStorm](http://www.jetbrains.com/phpstorm/)
allows you to add on and define your own code templates to do this too, called LiveTemplates. For any syntax or language, you can write a snippet
that will autocomplete and fill in what you want to type. For some of us, this can save minutes to hours of typing which adds up in the long run.

#### EXAMPLE 1

Let's assume you're on the hook for cranking out a HTML prototype of a dynamic application. Before the brains are put in, the team wants to see the
front end interactions represented. Given the amount of dummy markup you need to put in to simulate these interactions, that can be a lot of
redundant entry. It would be nice to cut down and reduce dozens of keystrokes to just a handful.

Suppose you need to represent [multiple block grids](http://foundation.zurb.com/docs/components/block_grid.html) in [Foundation](http://foundation.zurb.com/docs/components/block_grid.html) on
multiple pages. Sure, you can refer back to the docs each time to see what the markup is, or... we can just enter this once.

Given a common block grid of 3, 4, and 5:

<pre class="language-markup"><code class="language-markup">
&lt;ul class="large-block-grid-3"&gt;
  &lt;li&gt;Grid Item&lt;/li&gt;
  &lt;li&gt;Grid Item&lt;/li&gt;
  &lt;li&gt;Grid Item&lt;/li&gt;
&lt;/ul&gt;

&lt;ul class="large-block-grid-4"&gt;
  &lt;li&gt;Grid Item&lt;/li&gt;
  &lt;li&gt;Grid Item&lt;/li&gt;
  &lt;li&gt;Grid Item&lt;/li&gt;
  &lt;li&gt;Grid Item&lt;/li&gt;
&lt;/ul&gt;

&lt;ul class="large-block-grid-5"&gt;
  &lt;li&gt;Grid Item&lt;/li&gt;
  &lt;li&gt;Grid Item&lt;/li&gt;
  &lt;li&gt;Grid Item&lt;/li&gt;
  &lt;li&gt;Grid Item&lt;/li&gt;
  &lt;li&gt;Grid Item&lt;/li&gt;
&lt;/ul&gt;
</code></pre>

This is simple enough to copy paste in and change the grid number, but when you have to do a lot of them, copy and pasting is tedious. Plus, we've
paid good money for our IDE, it has tools, we should use them. Let's simplify this.

##### Create a LiveTemplate

1. Go into Preferences, navigate to IDE Settings and then LiveTemplates.
2. Create a new "Template Group" and name it "Foundation 5".
3. Create a new LiveTemplate under the Foundation 5 group
4. For the abbreviation, type 'zg-bg-3'
5. For the description, type 'Block Grid 3'
6. In the Template Text box, paste in the block grid 3 example from above
7. Define the context to only be for HTML files
8. Apply and Save

Now, create a new HTML file. Type 'zf-bg-3' and hit tab. Bam! There's our skeleton code in just a few strokes. We didn't have to go look at the docs page
and we didn't have to copy and paste around from the other end of the internet.

You can name the abbreviation anything you want as long as you remember what it is. Repeat the steps above for grids 4 and 5. Create as many as you need or want,
there is no limit.

Go back into the LiveTemplate settings and peruse the ones that come with PHPStorm. These are all ready to use.

#### EXAMPLE 2

How about something more dynamic? In Drupal, I do a lot of custom development to facilitate unique requirements. Often times, you will be using
the same core hooks a lot, like [hook_menu](https://api.drupal.org/api/drupal/modules%21system%21system.api.php/function/hook_menu/7), [hook_block_view](https://api.drupal.org/api/drupal/modules%21block%21block.api.php/function/hook_block_view/7),
[hook_block_info](https://api.drupal.org/api/drupal/modules%21block%21block.api.php/function/hook_block_info/7), [hook_theme](https://api.drupal.org/api/drupal/modules%21system%21system.api.php/function/hook_theme/7), and [hook_entity_info](https://api.drupal.org/api/drupal/modules%21system%21system.api.php/function/hook_entity_info/7). These hooks can kickstart a module
from scratch and get you up and running. We can use variables in our LiveTemplate to further assist us. Following the steps above, and the following
snippet, create a new LiveTemplate for hook_menu:

<pre class="language-php"><code class="language-php">
/**
 * Implements hook_menu().
 */
function $NAME$_menu() {
  $items = array();

  hook_menu_item$END$

  return $items;
}
</code></pre>

Then, create a second one for hook_menu_item (note that this hook doesn't exist - we are "creating" it for template convenience. It represents a
basic router item):

<pre class="language-php"><code class="language-php">
$items['$NAME$/%'] = array(
  'title' => 'My Item',
  'description' => 'My Item',
  'page callback' => '$NAME$_callback',
  'page arguments' => array(1),
  'access arguments' => array('view $NAME$'),
  'type' => MENU_NORMAL_ITEM,
  'menu_name' => 'my_menu',
);
</code></pre>

Set the context to .module files or simply 'Everywhere' to make this active from any file context.

Now when you type hook_menu and TAB, you get a hook menu with a router item setup for you to fill in quickly. This is a great time saver particularly
when hooks and functions can have arguments and parameters that are hard to remember offhand. The <code>$NAME$</code> variable prefills in with the file
name the snippet is being generated within.

Typing hook_menu_item and tab repeatedly will create router items in rapid fire succession - feel free to create variants of this for dummy items (default local tasks) and tab router items (local tasks).

To get all the functions in Drupal supported, [some users have made a LiveTemplate project for D7 and D8](https://www.drupal.org/project/phpstorm-templates). It's an awesome tool to have to supplement
other tools in PHPStorm.

Grab it: [LiveTemplates for Drupal](https://www.drupal.org/project/phpstorm-templates)

Building up a library of LiveTemplates is well worth your time and effort in the long run. FileTemplates are also a major scaffolding tool - I will cover
that in another post. For now, get ahold of LiveTemplates and start coding quicker.