---
layout: post
title: Type Hints and Return Types in PHP
date: 2017-07-04 12:00:00
category: php
tags:
 - drupal
 - php 7
image: /assets/images/code-2.jpg
---

Just wanted to drop a quick nod to a long awaited feature in PHP that other languages have enjoyed for a while now... type hints and return types.

On a current project, I had to implement my own user authentication service in Drupal 8. While writing my class, I added new methods that I needed to facilitate the feature scope of the authentication workflow.

One such method checked if the email address entered matched a particular domain. This was so I could short circuit the rest of the authentication process if the user logging in was one of our staff at Velir (otherwise, Drupal will attempt to authenticate the user to an external system). We did not want to add our people into the external system for various reasons.

Initially, the method started out as this:

<pre class="language-php"><code class="language-php">
  /**
   * Check if the email address entered matches the domain we want to check for.
   */
  protected function emailDomainMatch($email_address, $domain) {
    $check_for = explode('@', $email_address);
    return (end($check_for) === $domain);
  }
</code></pre>

This was _okay_... but I had future development in mind. What if the person I hand this off to wants to extend the authentication process? I am assuming the arguments passed in are strings, but how does the developer know that?

I decided to enable a new feature of PHP 7 to allow type hinting. At the top of my file, I added:

<pre class="language-php"><code class="language-php">
<?php

declare(strict_types = 1);
</code></pre>

This is required to use, and you can <a href="https://wiki.php.net/rfc/scalar_type_hints_v5" target="_blank">read more about why right here</a>.

With this enabled, I can type hint arguments to be a `string` - and I can define the return type of the method to `bool`.

<pre class="language-php"><code class="language-php">
  /**
   * Check if the email address entered matches the domain we want to check for.
   */
  protected function emailDomainMatch(string $email_address, string $domain) : bool {
    $check_for = explode('@', $email_address);
    return (end($check_for) === $domain);
  }
</code></pre>

The intent of this method is now very clear. Passing the wrong argument type will throw an error, and an IDE like PHPStorm will mark a call to this method incorrect if the arguments are not strings. The method can now only ever accept strings, and only ever return a bool.

This is a very simple example, but also useful if you were defining an interface. While the interface blueprints the contract a class implementing it must adhere to, adding type hints and return types further solidifies the intent of the methods listed. This can reduce ambiguity during implementation, and help lead to less bugs.

If you can also define what your methods will accept, and what they will return, it can also help in designing solutions to problems. You will also find that you will be writing _less_ code upfront checking arguments and making sure its what you expect, or checking method returns to ensure it is what you want (how many times have you checked a return is set, or not null, not empty, etc, or had warnings/errors thrown because a variable/value wasn't what you thought it would be?).
