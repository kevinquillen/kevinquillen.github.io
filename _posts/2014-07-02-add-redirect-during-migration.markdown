---
layout: post
title: Add 301 Redirects to a Drupal Migration
date:   2014-07-02 8:02 AM
category: drupal
tags:
 - drupal planet
 - migration
 - migrating content
body-color: seagreen
excerpt: a
subtitle: Don't pollute a new site with nasty 404's
published: FALSE
---

Migrating content from one platform to another saves lots of time from doing grunt work and gets data moved fast. However, simply moving the content doesn't mean the job is done. There are other considerations too, such as 301
redirects for example. Since we are moving content, our aliases are likely changing too. We can create 301s while migrating content in all at once.

The way I like to do it is to place the following in my Migration class <code>complete()</code> method:

<pre class="language-php"><code class="language-php">
public function complete($node, stdClass $row) {
  // Create an object with our redirect parameters
  $redirect = new stdClass();
  redirect_object_prepare($redirect);
  $redirect->source = date('Y', $row->post_date) . '/' . date('m', $row->post_date) . '/' . $row->post_name; // Old URL
  $redirect->source_options = array();
  $redirect->redirect = 'node/' . $entity->nid; // New system path
  $redirect->redirect_options = array();
  $redirect->type = 'redirect';
  $redirect->language = LANGUAGE_NONE;

  $alias = db_query('SELECT alias FROM {url_alias} WHERE source = :src_path', array(':src_path' => 'node/'. $entity->nid))->fetchField();

  // Create the redirect, if it does not exist already
  if ($alias && $alias != $redirect->source) {
    redirect_save($redirect);
  }
}
</code></pre>

I also like to go a step further - I usually have a parent Migration class that I inherit from that contains lots of convenient helpers; creating redirects is one of those helpers. In that case,
your parent class would have a method called <code>generateNodeRedirect</code> with the same arguments as the <code>complete()</code> method. Then, any complete method in any number of node Migration classes
then becomes:

<pre class="language-php"><code class="language-php">
public function complete($node, stdClass $row) {
  parent::generateNodeRedirect($node, $row);
}
</code></pre>

Keeping utility functions in a parent class you extend from keeps it located all in one place so you aren't repeating yourself (DRY!). You can repeat this pattern for users, taxonomies and custom entities
too, just change the values being set.