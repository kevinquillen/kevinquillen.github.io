---
layout: post
title:  "Up and Running with Behat, Drupal, & Vagrant"
subtitle: There be no dragons here, I promise.
body-color: blue
date:   2014-06-03 14:00:00
category: general
body-color: seagreen
---

<h3>The Initiation
<br><small>Why you came.</small></h3>

<p>Alright. This is it. You're here because you've heard of this mysterious 'Behat' while searching for best practices in
testing Drupal.</p>

<p>Up through Drupal 7, core and contrib relied on a method of testing leveraging the SimpleTest library. While it has served a
purpose, some of us need a much faster and clearer way of testing.</p>

#### But... what is Behat really?

<h3>The Setup
<br><small>Okay, there <em>may</em> be a few dragons here. Suit up, prepare for battle.</small></h3>

<pre class="language-markup"><code class="language-gherkin">
  @api
  Feature: Dashboard
    In order to prove the anonymous dashboard experience is working properly
    As a developer
    I need to use the step definitions of this context to prove my user story

    Scenario: An administrative user should be able to use the Outage Stats admin settings form
      Given I am logged in as a user with the "administrator" role
      When I go to "admin/config/services/outage-stats"
      Then I should not see "Access Denied"

    Scenario: An administrative user should be able to use the SunEdison Integration admin settings form
      Given I am logged in as a user with the "administrator" role
      When I go to "admin/config/services/sunedison"
      Then I should not see "Access Denied"
</code></pre>