---
layout: post
title:  Basic behavior testing with Behat in Drupal
subtitle: Take your first step into a larger world.
date:   2014-06-08 14:00:00
category: bdd
body-color: darkgreen
excerpt: We have all at some point or another faced projects where wasted minutes and/or hours on regressions or redo work not only eat into the current project budget, but hurt long term numbers too on the books. Fortunately, we can crush this leveraging Behat and covering our bases with tests, and everyone goes home happy.
---

How many times have you faced this?

#### Scenario 1: The "okay, try now" loop

**Developer:** Hey manager, I just completed tickets 2, 3, 4, and 5. I am moving on to 6, 7 and 8 now.<br>
**Manager:** Cool, thanks Developer. Hey wait, how come when I log in I can't edit content?<br>
**Developer:** Ohhh ahhhh one second<br>
*... 15 minutes later ... *<br>
**Developer:** Try now<br>
**Manager:** Okay yeah, I can see the edit links now.<br>
**Developer:** Great!<br>
**Manager:** I just created some test content though and I can't delete it.. I need to get rid of it before I train the client!<br>
**Developer:** Ohh, one second.....

#### Scenario 2: Stepping on each others toes

**Developer 1:** So, right now in the project we are in a good position to- hey, why isn't this working? Where is Menu X? WTF BROKE!<br>
**Developer 2:** What's up? Yeah I made some changes for the work I was doing. Something wrong?<br>
**Developer 1:** All the work I did last week isn't working anymore!<br>
**Developer 2:** It's not? Hmm.. Are you sure?<br>
**Developer 1:** omgwtfbbq!<br>
**Developer 2:** ...... One second..

##### I've been in both!

Yes, we all have at some point or another, and more frequently than we think. It's frustrating, common, and the wasted minutes and/or hours
not only eat into the current project budget, but hurt long term numbers too on the books.

Not only that, but the second you start having to redo work, developer morale begins a downward slide. Once that starts to happen, the
overall health of the project can be in jeopardy, because with mounting tasks to redo work that was already completed, the people in charge
of executing the work are not happy.

We can stop that.

### Behavior testing with Behat

Super. [Building on the example test in the previous post](/bdd/2014/06/06/behat-drupal), let's look at ways we can prevent the scenarios above.

Here was our example test. Let's recap:

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

A basic Behat test lives inside a <code>.feature</code> file in a <code>features</code> folder. This folder is created when you first run
<code>vendor/bin/behat --init</code> in your project.

I like to structure feature tests as follows:

<pre class="language-markup"><code class="language-bash">
features
  bootstrap
  content
    admin.feature
    editor.feature
  commerce
    anon.feature
    member.feature
  ...
</code></pre>

For each epic a project contains, I create a folder. Within the epic are defined user stories per role, which I like to group into each feature test. Therefore,
each filename is typically <code>rolename.feature</code> per feature name, which makes it pretty clear to me.

So, for the test example above, that would be in <code>features/content/admin.feature</code>. It's up to you how you want to organize your
tests, but this is the way I currently prefer to do it.

Every <code>.feature</code> starts out with the declaration or user story, the experience we are tasked with implementing. It's described almost
verbatim from the user stories in the project.

#### Scenarios

Okay. So now we have our user story defined, and our feature test created and waiting. Our project manager has asked that administrators should
be able to create, edit, and delete page content.

<code>Scenarios</code> are individual instances to test pieces of the feature that make up the whole and in the end let us know that our feature is working correctly.

We have one above, but we need a few more to check on editing and deleting.

<pre class="language-markup"><code class="language-gherkin">
Feature: Content Management
  When I log into the website
  As an administrator
  I should be able to create, edit, and delete page content

  Scenario: An administrative user should be able create page content
    Given I am logged in as a user with the "administrator" role
    When I go to "node/add/page"
    Then I should not see "Access denied"

  Scenario: An administrator should be able to edit page content
    Given "page" nodes:
      | title      | body          | status  |
      | Test page  | test content  | 1       |
    When I go to "admin/content"
    And I click "edit" in the "Test page" row
    Then I should not see "Access denied"

  Scenario: An administrator should be able to delete page content
    Given "page" nodes:
      | title      | body          | status  |
      | Test page  | test content  | 1       |
    When I go to "admin/content"
    And I click "delete" in the "Test page" row
    Then I should not see "Access denied"
</code></pre>

Running this test is simple, and backs up the integrity of your system be it permissions, interfaces or input forms.

If you installed the Drupal Behat Extension, the extra step definitions it provides allows us to create nodes on
the fly with <code>Given</code> statements.

#### Step Definitions

A step definition is a written statement that Behat maps to a PHP method. Everything above starting with <code>Given, When, Then</code> are
step definitions. Behat matches them with regular expressions to know which PHP method to fire for that step.

With the Drupal Behat Extension, many are provided for you out of the box so you don't have to make them. If you type <code>vendor/bin/behat -dl</code> in
terminal, Behat will list all the available step definitions.

Here they are:

<pre class="language-markup"><code class="language-gherkin">
Given /^(?:that I|I) am at "(?P[^"]*)"$/
 When /^I visit "(?P[^"]*)"$/
 When /^I click "(?P&lt;link&gt;[^"]*)"$/
Given /^for "(?P&lt;field&gt;[^"]*)" I enter "(?P&lt;value&gt;[^"]*)"$/
Given /^I enter "(?P&lt;value&gt;[^"]*)" for "(?P&lt;field&gt;[^"]*)"$/
Given /^I wait for AJAX to finish$/
 When /^(?:|I )press "(?P&lt;button&gt;(?:[^"]|\\")*)"$/
 When /^(?:|I )press the "(?P&lt;button&gt;[^"]*)" button$/
Given /^(?:|I )press the "([^"]*)" key in the "([^"]*)" field$/
 Then /^I should see the link "(?P&lt;link&gt;[^"]*)"$/
 Then /^I should not see the link "(?P&lt;link&gt;[^"]*)"$/
 Then /^I (?:|should )see the heading "(?P&lt;heading&gt;[^"]*)"$/
 Then /^I (?:|should )not see the heading "(?P&lt;heading&gt;[^"]*)"$/
 Then /^I should see the heading "(?P&lt;heading&gt;[^"]*)" in the "(?P&lt;region&gt;[^"]*)"(?:| region)$/
 Then /^I should see the "(?P&lt;heading&gt;[^"]*)" heading in the "(?P&lt;region&gt;[^"]*)"(?:| region)$/
 When /^I (?:follow|click) "(?P&lt;link&gt;[^"]*)" in the "(?P&lt;region&gt;[^"]*)"(?:| region)$/
 Then /^I should see the link "(?P&lt;link&gt;[^"]*)" in the "(?P&lt;region&gt;[^"]*)"(?:| region)$/
 Then /^I should not see the link "(?P&lt;link&gt;[^"]*)" in the "(?P&lt;region&gt;[^"]*)"(?:| region)$/
 Then /^I should see (?:the text |)"(?P&lt;text&gt;[^"]*)" in the "(?P&lt;region&gt;[^"]*)"(?:| region)$/
 Then /^I should not see (?:the text |)"(?P&lt;text&gt;[^"]*)" in the "(?P&lt;region&gt;[^"]*)"(?:| region)$/
Given /^I press "(?P&lt;button&gt;[^"]*)" in the "(?P&lt;region&gt;[^"]*)"(?:| region)$/
Given /^(?:|I )fill in "(?P&lt;value&gt;(?:[^"]|\\")*)" for "(?P&lt;field&gt;(?:[^"]|\\")*)" in the "(?P&lt;region&gt;[^"]*)"(?:| region)$/
Given /^(?:|I )fill in "(?P&lt;field&gt;(?:[^"]|\\")*)" with "(?P&lt;value&gt;(?:[^"]|\\")*)" in the "(?P&lt;region&gt;[^"]*)"(?:| region)$/
 Then /^(?:I|I should) see the text "(?P&lt;text&gt;[^"]*)"$/
 Then /^I should not see the text "(?P&lt;text&gt;[^"]*)"$/
 Then /^I should get a "(?P&lt;code&gt;[^"]*)" HTTP response$/
 Then /^I should not get a "(?P&lt;code&gt;[^"]*)" HTTP response$/
Given /^I check the box "(?P&lt;checkbox&gt;[^"]*)"$/
Given /^I uncheck the box "(?P&lt;checkbox&gt;[^"]*)"$/
 When /^I select the radio button "(?P&lt;label&gt;[^"]*)" with the id "(?P&lt;id&gt;[^"]*)"$/
 When /^I select the radio button "(?P&lt;label&gt;[^"]*)"$/
Given /^I am an anonymous user$/
Given /^I am not logged in$/
Given /^I am logged in as a user with the "(?P&lt;role&gt;[^"]*)" role$/
Given /^I am logged in as "(?P&lt;name&gt;[^"]*)"$/
Given /^I am logged in as a user with the "(?P&lt;permission&gt;[^"]*)" permission(?:|s)$/
Given /^I click "(?P&lt;link&gt;[^"]*)" in the "(?P&lt;row_text&gt;[^"]*)" row$/
Given /^the cache has been cleared$/
Given /^I run cron$/
Given /^I am viewing (?:a|an) "(?P&lt;type&gt;[^"]*)" node with the title "(?P&lt;title&gt;[^"]*)"$/
Given /^(?:a|an) "(?P&lt;type&gt;[^"]*)" node with the title "(?P&lt;title&gt;[^"]*)"$/
Given /^I am viewing my "(?P&lt;type&gt;[^"]*)" node with the title "(?P&lt;title&gt;[^"]*)"$/
Given /^"(?P&lt;type&gt;[^"]*)" nodes:$/
Given /^I am viewing (?:a|an) "(?P&lt;type&gt;[^"]*)" node:$/
 Then /^I should be able to edit (?:a|an) "([^"]*)" node$/
Given /^I am viewing (?:a|an) "(?P&lt;vocabulary&gt;[^"]*)" term with the name "(?P&lt;name&gt;[^"]*)"$/
Given /^(?:a|an) "(?P&lt;vocabulary&gt;[^"]*)" term with the name "(?P&lt;name&gt;[^"]*)"$/
Given /^users:$/
Given /^"(?P&lt;vocabulary&gt;[^"]*)" terms:$/
 Then /^I should see the error message(?:| containing) "([^"]*)"$/
 Then /^I should see the following &lt;error messages&gt;$/
Given /^I should not see the error message(?:| containing) "([^"]*)"$/
 Then /^I should not see the following &lt;error messages&gt;$/
 Then /^I should see the success message(?:| containing) "([^"]*)"$/
 Then /^I should see the following &lt;success messages&gt;$/
Given /^I should not see the success message(?:| containing) "([^"]*)"$/
 Then /^I should not see the following &lt;success messages&gt;$/
 Then /^I should see the warning message(?:| containing) "([^"]*)"$/
 Then /^I should see the following &lt;warning messages&gt;$/
Given /^I should not see the warning message(?:| containing) "([^"]*)"$/
 Then /^I should not see the following &lt;warning messages&gt;$/
 Then /^I should see the message(?:| containing) "([^"]*)"$/
 Then /^I should not see the message(?:| containing) "([^"]*)"$/
Given /^I run drush "(?P&lt;command&gt;[^"]*)"$/
Given /^I run drush "(?P&lt;command&gt;[^"]*)" "(?P&lt;arguments&gt;(?:[^"]|\\")*)"$/
 Then /^drush output should contain "(?P&lt;output&gt;[^"]*)"$/
 Then /^drush output should not contain "(?P&lt;output&gt;[^"]*)"$/
 Then /^(?:|I )break$/
Given /^(?:|I )am on (?:|the )homepage$/
 When /^(?:|I )go to (?:|the )homepage$/
Given /^(?:|I )am on "(?P&lt;page&gt;[^"]+)"$/
 When /^(?:|I )go to "(?P&lt;page&gt;[^"]+)"$/
 When /^(?:|I )reload the page$/
 When /^(?:|I )move backward one page$/
 When /^(?:|I )move forward one page$/
 When /^(?:|I )follow "(?P&lt;link&gt;(?:[^"]|\\")*)"$/
 When /^(?:|I )fill in "(?P&lt;field&gt;(?:[^"]|\\")*)" with "(?P&lt;value&gt;(?:[^"]|\\")*)"$/
 When /^(?:|I )fill in "(?P&lt;field&gt;(?:[^"]|\\")*)" with:$/
 When /^(?:|I )fill in "(?P&lt;value&gt;(?:[^"]|\\")*)" for "(?P&lt;field&gt;(?:[^"]|\\")*)"$/
 When /^(?:|I )fill in the following:$/
 When /^(?:|I )select "(?P&lt;option&gt;(?:[^"]|\\")*)" from "(?P&lt;select&gt;(?:[^"]|\\")*)"$/
 When /^(?:|I )additionally select "(?P&lt;option&gt;(?:[^"]|\\")*)" from "(?P&lt;select&gt;(?:[^"]|\\")*)"$/
 When /^(?:|I )check "(?P&lt;option&gt;(?:[^"]|\\")*)"$/
 When /^(?:|I )uncheck "(?P&lt;option&gt;(?:[^"]|\\")*)"$/
 When /^(?:|I )attach the file "(?P[^"]*)" to "(?P&lt;field&gt;(?:[^"]|\\")*)"$/
 Then /^(?:|I )should be on "(?P&lt;page&gt;[^"]+)"$/
 Then /^(?:|I )should be on (?:|the )homepage$/
 Then /^the (?i)url(?-i) should match (?P&lt;pattern&gt;"(?:[^"]|\\")*")$/
 Then /^the response status code should be (?P&lt;code&gt;\d+)$/
 Then /^the response status code should not be (?P&lt;code&gt;\d+)$/
 Then /^(?:|I )should see "(?P&lt;text&gt;(?:[^"]|\\")*)"$/
 Then /^(?:|I )should not see "(?P&lt;text&gt;(?:[^"]|\\")*)"$/
 Then /^(?:|I )should see text matching (?P&lt;pattern&gt;"(?:[^"]|\\")*")$/
 Then /^(?:|I )should not see text matching (?P&lt;pattern&gt;"(?:[^"]|\\")*")$/
 Then /^the response should contain "(?P&lt;text&gt;(?:[^"]|\\")*)"$/
 Then /^the response should not contain "(?P&lt;text&gt;(?:[^"]|\\")*)"$/
 Then /^(?:|I )should see "(?P&lt;text&gt;(?:[^"]|\\")*)" in the "(?P&lt;element&gt;[^"]*)" element$/
 Then /^(?:|I )should not see "(?P&lt;text&gt;(?:[^"]|\\")*)" in the "(?P&lt;element&gt;[^"]*)" element$/
 Then /^the "(?P&lt;element&gt;[^"]*)" element should contain "(?P&lt;value&gt;(?:[^"]|\\")*)"$/
 Then /^the "(?P&lt;element&gt;[^"]*)" element should not contain "(?P&lt;value&gt;(?:[^"]|\\")*)"$/
 Then /^(?:|I )should see an? "(?P&lt;element&gt;[^"]*)" element$/
 Then /^(?:|I )should not see an? "(?P&lt;element&gt;[^"]*)" element$/
 Then /^the "(?P&lt;field&gt;(?:[^"]|\\")*)" field should contain "(?P&lt;value&gt;(?:[^"]|\\")*)"$/
 Then /^the "(?P&lt;field&gt;(?:[^"]|\\")*)" field should not contain "(?P&lt;value&gt;(?:[^"]|\\")*)"$/
 Then /^the "(?P&lt;checkbox&gt;(?:[^"]|\\")*)" checkbox should be checked$/
 Then /^the checkbox "(?P&lt;checkbox&gt;(?:[^"]|\\")*)" (?:is|should be) checked$/
 Then /^the "(?P&lt;checkbox&gt;(?:[^"]|\\")*)" checkbox should not be checked$/
 Then /^the checkbox "(?P&lt;checkbox&gt;(?:[^"]|\\")*)" should (?:be unchecked|not be checked)$/
 Then /^the checkbox "(?P&lt;checkbox&gt;(?:[^"]|\\")*)" is (?:unchecked|not checked)$/
 Then /^(?:|I )should see (?P&lt;num&gt;\d+) "(?P&lt;element&gt;[^"]*)" elements?$/
 Then /^print current URL$/
 Then /^print last response$/
 Then /^show last response$/
</code></pre>

Holy moly. We have lots of viable definitions to use to write tests with.

Each one of these are usable just the way they are written. For instance, if you wanted to check for "Welcome!" on the homepage, there are
two steps provided that can do that already, <code>Given /^(?:|I )am on (?:|the )homepage$/</code> and <code>Then /^(?:I|I should) see the text "(?P&lt;text&gt;[^"]\*)"$/</code>.
Here's how:

<pre class="language-markup"><code class="language-gherkin">
  Scenario: A user should see "Welcome!" on the homepage
    Given I am on the homepage
    Then I should see the text "Welcome!"
</code></pre>

Nothing to it, right? That's the entire test. Behat matches statements with regular expressions and passes quoted text as arguments to their
respective step definitions.

##### How does this black magic work?

Step definitions like this are already provided to you out of the box. They are defined in their respective providing classes, and Behat matches
the statements back to annotated code comments preceding the PHP methods that execute them. Here is <code>Given /^(?:|I )am on (?:|the )homepage$/</code>:

<pre class="language-markup"><code class="language-php">
/**
 * Opens homepage.
 *
 * @Given /^(?:|I )am on (?:|the )homepage$/
 * @When /^(?:|I )go to (?:|the )homepage$/
 */
public function iAmOnHomepage()
{
    $this->getSession()->visit($this->locatePath('/'));
}
</code></pre>

When the PHP method is used, the Behat driver (the mechanism that simulates client / browser interaction) directs the client to "/" or the root document page
of the site. Make sense now?

Here's <code>Then /^(?:I|I should) see the text "(?P&lt;text&gt;[^"]\*)"$/</code>:

<pre class="language-markup"><code class="language-php">
/**
 * @Then /^(?:I|I should) see the text "(?P&lt;text&gt;[^"]\*)"$/
 */
public function assertTextVisible($text) {
  // Use the Mink Extension step definition.
  return new Given("I should see text matching \"$text\"");
}
</code></pre>

An argument passed to this function, which is the quoted string <code>"Welcome!"</code>. If you followed the class,
you can see that this step is generated dynamically for Mink, and the statement is then evaluated against the page contents.

Before we get deeper into step definitions, backgrounds, contexts, Selenium, and region selectors, take some time to build basic tests with the list of
step definitions above. Get them to pass and get them to fail. Build confidence in the fact that Behat is your second set of eyes and a
helper in facilitating feature development.