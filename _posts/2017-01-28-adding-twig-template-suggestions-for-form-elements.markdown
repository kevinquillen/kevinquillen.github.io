---
layout: post
title: Adding Twig Template Suggestions for Form Elements
date: 2017-01-28 12:00:00
category: drupal
tags:
 - twig
 - theming
 - templates
image: /assets/images/code-3.jpg
---

Last week, I had to solve a problem where a prototyped form contained a button element and svg icon for the submit button on three search forms.

While you can change the type of a input from `submit` to `button` in Drupal 8, that does not change the tag the form element uses.

I needed a clean solution that allowed me to provide the markup and svg icon without interfering with the function of the form itself.

Here is the output I needed to achieve:

<pre class="language-html"><code class="language-html">
&lt;button type="button" class="search-box__button"&gt;
  &lt;svg class="icon search-box__open"&gt;
    &lt;use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/build/img/svg-sprite.svg#icon-search"&gt;&lt;/use&gt;
  &lt;/svg&gt;
&lt;/button&gt;
</code></pre>

I did a little digging, and saw that Drupal base theme (classy or stable) provide an `input.html.twig` and the option of overriding an element with `input--(type).html.twig`. That's cool, but I don't want to override _all_ submits on the website, just specific ones.

Fortunately, core provides many ways to hook in and provide more template suggestions if none suit. I had the idea to add a `data-attribute` on my form element that I wanted to override. Then, using `hook_theme_suggestions_input_alter()`, I look to see if this attribute exists, if so, create the suggestion based on that value.

Here it is in action:

<pre class="language-php"><code class="language-php">
/**
 * @param $suggestions
 * @param array $variables
 */
function mytheme_theme_suggestions_input_alter(&$suggestions, array $variables) {
  $element = $variables['element'];

  if (isset($element['#attributes']['data-twig-suggestion'])) {
    $suggestions[] = 'input__' . $element['#type'] . '__' . $element['#attributes']['data-twig-suggestion'];
  }
}

/**
 * @param $form
 * @param \Drupal\Core\Form\FormStateInterface $form_state
 * @param $form_id
 */
function mytheme_form_alter(&$form, FormStateInterface $form_state, $form_id) {
  if ($form['#id'] == 'views-exposed-form-search-results') {  
    $form['actions']['submit']['#attributes']['data-twig-suggestion'] = 'search_results_submit';
    $form['actions']['submit']['#attributes']['class'][] = 'search-box__button';
  }
}
</code></pre>

I simply use the `#attributes` key to add my data attribute. Originally, I was using the `#name` key only, but I figured I would create my own data attribute so nothing else in the system interferes with it, and I can guarantee uniqueness if multiple exist on the page.

Then, I created the necessary twig file. In this case, it is `input--submit--search-results-submit.html.twig`:

<pre class="language-twig"><code class="language-twig">
{#
/**
 * @file
 * Theme override for an 'input' #type form element.
 *
 * Available variables:
 * - attributes: A list of HTML attributes for the input element.
 * - children: Optional additional rendered elements.
 *
 * @see template_preprocess_input()
 */
#}
&lt;button&#123;&#123; attributes &#125;&#125;&gt;
  &lt;svg class="icon search-box__open"&gt;
    &lt;use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/themes/custom/mytheme/build/img/svg-sprite.svg#icon-search"&gt;&lt;/use&gt;
  &lt;/svg&gt;
&lt;/button&gt;
</code></pre>

Now, if I want to apply the same treatment to other submit buttons, I simply pop that data attribute on the end and reload the page.

I suppose you could also create custom theme hooks for this, and I wonder if that is more "proper", but all in all this only took about 10 minutes to put together and gives me the ability to scale out if I need to change how elements are marked up in the future. I assume that if my needs became more complex, a theme hook would be necessary - but for now, I don't think that it is.
