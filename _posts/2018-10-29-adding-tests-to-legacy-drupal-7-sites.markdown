---
layout: post
title: Adding Tests to Legacy Drupal 7 Sites
date: 2018-10-29 12:00:00
category: drupal
tags:
 - testing
image: /assets/images/code-1.jpg
---

Most developers at some point or another will inevitably need to add custom code to a site. In Drupal, this could be anything from extending core functionality, altering forms, or creating entirely new functionality.

When using best practices and having knowledge of the API/framework Drupal provides, you can scaffold functionality fairly quickly and "hook" into the right events to build custom features. It's often so easy to do that sometimes we neglect to write tests and just hop to writing code, because its fun. I am guilty of that, I believe we all are, no matter what language or platform you use.

Recently, I had to pick up a project first launched in 2015 and add a lot of new functionality to it. This was a fairly successful, highly flexible Drupal 7 site that featured half data visualizations, and half managed content. We had to deliver a large new feature set for the site for October, and glancing at some of the new designs and functionality, I knew it would be wise to set aside a day or two to provide tests for what already works. This would provide a path for introducing new code with the confidence we were not breaking existing code. It also helped me to identify areas of improvement later on to refactor existing code into more performant, smaller pieces. 

This wouldn't have been possible without the tests.

When I sat down to tackle new functionality, I wrote the tests first to provide a sensible path to whats expected of the implementation code. We will look at a few examples.

### Enable SimpleTest

To do unit and functional tests in Drupal 7, you will need SimpleTest. In my opinion, easiest way to do this is to setup a second site in your local development environment. If you have settings in your settings.php file like Memcache settings for example, this will interfere with SimpleTest's ability to execute tests. This second installation can just use the minimal profile, and have SimpleTest enabled.

In a Docker based setup like <a href="https://github.com/lando/lando">Lando</a>, this was as simple as creating a second database and host in my app service. I then added a site folder representing the hostname in Drupal (simpletest.lndo.site), and added that folder to gitignore. Now I have my own testing sandbox that won't interfere with other developers working on the project.

### Setup Composer

Some tests may require mocking of services or classes. We can use a library like <a href="https://github.com/phpspec/prophecy">Prophecy</a> to assist with this. To do that, we need to get the package with Composer.

In Drupal 7, I would strongly advise against using the Composer Manager module and to just use Composer directly. On this particular project, the first thing I did was remove Composer Manager and just use Composer directly to reduce complexity. This also makes it easier to build the project normally with a service like TravisCI or a local script.

Previously, Composer Manager was installed to fetch packages like Mailchimp API and Guzzle. A few years ago this was a practical approach, but revisiting the project this year it had proven to be another layer of complexity we simply don't need.

Adding Composer to the project is easy. From the root:

<pre class="language-bash"><code class="language-bash">
composer require --dev phpspec/prophecy:~1.0
</code></pre>

Depending on how you have your project set up, you need to add the autoloader so the application understands how to find packages added with Composer. I won't go into detail on how to do that in this post, or how to deploy a site with Composer packages. 

If you are wondering why I did not add PHPUnit for unit tests, its due to keeping things simple. While SimpleTest in Drupal 7 does not provide the robust options and depth of PHPUnit, it will get us where we need to go without adding more dependencies. We want to balance our time so that we are providing value and buying efficiency without sacrificing a lot of budget or getting behind schedule. It's also why I did not also try to add in another test harness like Behat.

Use your best judgement and try not to get lost in the weeds. 

### Writing Your First Test

The simplest kind of test you can do is a unit test. One of the new requirements I had was that while processing data from an API response, I was to pass a color value in the result to a rendered visualization. This color would be used say, in the case of a bar graph, to make the bar green or yellow - whatever the data manager deemed appropriate.

There were a few parameters surrounding it:

- The color value must be a string (not a hex)
- If no color provided, the color used would be 'purple'
- The color must be a value in an approved list of colors, if not, 'purple' will be used

This is a great candidate to write unit test(s) for. It has zero external dependencies, it does not rely on any other modules needing to be enabled, and doesn't care if Drupal is installed or not. We just need to take some values, and execute code against it and evaluate the return.

First, I start out by stubbing the test class, based on what I know from the above requirements:

<pre class="language-php"><code class="language-php">
/**
 * Class ColorTest.
 */
class ColorTest extends DrupalUnitTestCase {

  /**
   * Defines information about our test scenario.
   *
   * @return array
   */
  public static function getInfo() {
    return array(
      'name' => 'Color Tests',
      'description' => 'Validate our function(s) handle color values.',
      'group' => 'My Custom Module',
    );
  }

  /**
   * Check that our constant for default color is defined 
   * and is set to the color per spec.
   */
  public function testDefaultColorIsDefined() {}

  /**
   * Test the validator passes on approved colors.
   */
  public function testColorValueIsValid() {}

  /**
   * Test the validator fails unapproved color values.
   */
  public function testColorValueIsNotValid() {}

  /**
   * Test that the function returns the color or the default if
   * not approved.
   */
  public function testColorIsValidElseDefault() {}
}
</code></pre>

This is a solid start. These test stubs sound like it will cover our use case.

So where to now? Well, we can start filling in the code that will create a passing test. Having a default color available could be provided by a constant. Lets check that the constant exists, and is set to purple:

<pre class="language-php"><code class="language-php">
/**
 * Check that our constant for default color is defined 
 * and is set to the color per spec.
 */
public function testDefaultColorIsDefined() {
  $this->assertTrue(DEFAULT_COLOR, "Asserting DEFAULT_COLOR is defined.");
  $this->assertEqual(DEFAULT_COLOR, 'purple', "Asserting DEFAULT_COLOR is 'purple'.");
}
</code></pre>

Running the test will fail obviously, so now you can add the actual code in our module that will make it pass:

<pre class="language-php"><code class="language-php">
define('DEFAULT_COLOR', 'purple');
</code></pre>

Now the first test passes! Great. Anytime we use `DEFAULT_COLOR`, we know it will be 'purple'. We could add a million lines of code, but as long as that test passes, we have confidence that it does exactly what we need it to do.

Moving on, we now need to validate that an incoming color value is valid. By valid, it has to be in the approved list of colors: purple, green, red, orange, blue, grey, or yellow. The names are kept simple for datasheet editors to remember, when applied to our chart renderings they will trigger different shades to color the chart and its values via CSS. It's not a one to one mapping, but for simplicity sake, we discuss it like it was. The editors don't need to know anything more than "I need to add 1 of 7 possible values here to make it look how I want."

Setting up the test:

<pre class="language-php"><code class="language-php">
/**
 * Test the validator passes on approved colors.
 *
 * @covers datacenter_api_validate_hex_value
 */
public function testColorValueIsValid() {
  $colors = [
    'PurPle',
    'grEen',
    'red',
    'orANge',
    'Blue',
    'grey',
    'yelLOW'
  ];

  foreach ($colors as $color) {
    $valid_color = mymodule_validate_color_value($color);
    $this->assertTrue($valid_color, "Asserting passed value '$color' is a valid color.");
  }
}
</code></pre>

_Note that `mymodule_` is simply a naming convention. `mymodule` would be the name of your custom module._

Cool - now we have a second test, we have a list and a loop and we expect our function to return `true`. Now we can write the function in our module and run the test against it:

<pre class="language-php"><code class="language-php">
/**
 * This is a validator that checks that the passed string is a valid color.
 *
 * @param string $color
 * @return bool
 */
function mymodule_validate_color_value(string $color) : bool {
  $approved_colors = [
    'purple',
    'green',
    'red',
    'orange',
    'blue',
    'grey',
    'yellow'
  ];

  return in_array(drupal_strtolower($color), $approved_colors);
}
</code></pre>

Super simple. The tests pass, we convert input to all lowercase (never trust the user!). But that is only half the story. Lets write a test to ensure we have functional code:

<pre class="language-php"><code class="language-php">
/**
 * Test the validator fails unapproved color values.
 */
public function testColorValueIsNotValid() {
  $colors = [
    'black',
    'greeen',
    '',
    '  ',
    'bleu',
    'brown',
    '80c',
    'AAAAAQ',
    'EFEFEFE',
    'GREAN',
  ];

  foreach ($colors as $color) {
    $valid_color = mymodule_validate_color_value($color);
    $this->assertFalse($valid_color, "Asserting passed value '$color' is not an approved color.");
  }
}
</code></pre>

 Now we're getting pretty far - but that function doesn't quite get us all the way there. Now we know if the color is valid or not, but does nothing if it isn't since the function only returns a bool.

 Lets write a userland function to solve this:

<pre class="language-php"><code class="language-php">
 /**
 * This returns the passed color if valid, the global default otherwise.
 *
 * Use this function in custom code when dealing with setting viz colors.
 *
 * @param string $color
 * @return string
 */
function mymodule_get_viz_color(string $color) : string {
  return (mymodule_validate_color_value($color)) ? $color : DEFAULT_COLOR;
}
</code></pre>

The corresponding test:

<pre class="language-php"><code class="language-php">
/**
 * Test that the function returns the color or the default if
 * not approved.
 */
public function testColorIsValidElseDefault() {
  $colors = [
    'puRple' => 'purple',
    'grEEn' => 'green',
    'ReD' => 'red',
    'orange' => 'orange',
    'Blue' => 'blue',
    'gREy' => 'grey',
    'yellow' => 'yellow'
  ];

  foreach ($colors as $input => $expected) {
    $returned_color = mymodule_get_viz_color($input);
    $this->assertEqual($returned_color, $expected, "Asserting passed input value of '$input' that '$expected' is correctly returned.");
  }

  $colors = [
    'ZZf250',
    '!!45a ',
    '',
    '  ',
    '#$1=-a',
    '80c1',
    '0000',
    '00001',
    '80c1',
    'AAAAAQ',
    'EFEFEFE',
    '8.c6',
    'gray',
    'GRAY',
    'BroWn'
  ];

  foreach ($colors as $color) {
    $this->assertEqual(DEFAULT_COLOR, mymodule_get_viz_color($color), "Asserting passed value '$color' fails and the default color is returned.");
  }
}
</code></pre>

Wow, there we go. We have some solid tests and a great function for developers to utilize with a singly point of entry and predictable, reliable output. `mymodule_get_viz_color` can be used anywhere in the application and do _exactly_ what it should do.

We are also reinforced by new features of PHP 7 with the addition of type hints and return types. If anyone passes an argument that is not a string, or the function did not return a bool, it would cause a fatal error. We did not write tests for those two cases, because we did not need to. However, you _could_ provide a tests to ensure an exception is thrown, but we would need PHPUnit for that to assert an exception was encountered.

Here is an example of catching a custom exception from a pet project I have in Drupal 8:

<pre class="language-php"><code class="language-php">
/**
 * @expectedException \Drupal\mymodule\Exception\InvalidArrayValueException
 */
public function testIntegrityCheck() {
  $this->sortableService->sortAll([10, 5, 'Bad value!', 6, 1, 2, 4, 0, 'A']);
}
</code></pre>

The code:

<pre class="language-php"><code class="language-php">
/**
 * Check to ensure our array values to be sorted are numeric.
 *
 * @param array $items
 *   The array to check.
 *
 * @throws \Drupal\mymodule\Exception\InvalidArrayValueException
 */
protected function integrityCheck(array $items) {
  foreach ($items as $item) {
    if (!is_numeric($item)) {
      throw new InvalidArrayValueException("The array must not contain non numeric values. The passed array contained '$item'.");
    }
  }
}
</code></pre>

In the next post I will demonstrate how we wrote functional tests to validate API responses, and how we refactored complicated code to simpler code from adding new unit tests.