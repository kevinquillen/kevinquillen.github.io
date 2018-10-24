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

Previously, Composer Manager was installed to fetch packages like Mailchimp API and Guzzle. A few years ago this was a practical approach, but revisiting the project this year it had proven to be another layer of complexity we don't need.

Adding Composer to the project is easy. From the root:

<pre class="language-bash"><code class="language-bash">
composer require --dev phpspec/prophecy:~1.0
</code></pre>

Depending on how you have your project set up, you need to add the autoloader so the application understands how to find packages added with Composer. I won't go into detail on how to do that in this post, or how to deploy a site with Composer packages. 

### Writing Your First Test

The simplest kind of test you can do is a unit test. One of the new requirements I had was that while processing data from an API response, I was to pass a color value in the result to a rendered visualization. This color would be used say, in the case of a bar graph, to make the bar green or yellow - whatever the data manager deemed appropriate.

There were a few parameters surrounding it:

- The color value must be a string (not a hex)
- If no color provided, the color used would be 'purple'
- The color must be a value in an approved list of colors, if not, 'purple' will be used

This is a great candidate to write unit test(s) for. Before we need to write any code in our custom Drupal module, we can provide practical tests.

First, I start out by stubbing the test class, based on what I know from the above requirements:

<pre class="language-php"><code class="language-php">
/**
 * Class VizColorCheckTest.
 */
class VizColorCheckTest extends DrupalUnitTestCase {

  /**
   * Defines information about our test scenario.
   *
   * @return array
   */
  public static function getInfo() {
    return array(
      'name' => 'Viz Color Tests',
      'description' => 'Unit tests that validate our function(s) that validate color values coming from an API response.',
      'group' => 'My Custom Module',
    );
  }

  /**
   * Check that our constant for default color is defined and is set to the color per spec.
   */
  public function testDefaultColorIsDefined() {}

  /**
   * Test the validator passes on approved colors.
   *
   * @covers datacenter_api_validate_hex_value
   */
  public function testColorValueIsValid() {}


  /**
   * Test the validator fails unapproved color values.
   *
   * @covers datacenter_api_validate_color_value
   */
  public function testColorValueIsNotValid() {}

  /**
   * Test that the function returns the color or the default if
   * not approved.
   *
   * @covers datacenter_api_get_viz_color
   */
  public function testColorIsValidElseDefault() {}
}
</code></pre>
