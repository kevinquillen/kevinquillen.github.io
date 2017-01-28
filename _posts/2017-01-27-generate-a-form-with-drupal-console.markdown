---
layout: post
title: Generating a Form with Drupal Console
subtitle: As easy as drupal generate:form
date: 2017-01-27 12:00:00
category: drupal
tags:
 - console
image: /assets/images/code-3.jpg
---

Today I had an excellent opportunity to put Drupal Console to work for me. I also wanted to show a colleague what was possible and how fast you can move with it.

I had a requirement to create a couple of simple forms that consist of a text field and a submit. It then should post to a URL to a Views owned page, and perform a search. Great opportunity to use Drupal Console.

While I _could_ do this from memory, I wanted to see how fast I could get this code out without making a mistake.

First, you will need to add the Drupal Console to your project via Composer. Note that this is now advised, and the global launcher still  _works_, but is not recommended.

In your project, run these Composer commands to add the Drupal Console to your project:

<pre class="language-bash"><code class="language-bash">
composer require drupal/console:~1.0 --prefer-dist --optimize-autoloader --sort-packages
composer update drupal/console --with-dependencies
</code></pre>

You can now utilize the console from your project by typing:

<pre class="language-bash"><code class="language-bash">
vendor/bin/drupal (command)
</code></pre>

But first, you need to set some defaults with `drupal init`. At the prompt, type:

<pre class="language-bash"><code class="language-bash">
vendor/bin/drupal init
</code></pre>

This will inspect and generate a starting configuration for you, in `HOME/.console`. It will also ask you some basic questions regarding how you want the console to behave (if you want learning mode enabled, if you want to see chained output, etc). For now, it's fine to use the defaults.

Note, some users _may_ get an error about `--shellexec_output` option not existing. In this case, edit your config at `HOME/.console/config.yml` and remove that line from it and save (<a href="https://github.com/hechoendrupal/drupal-console/issues/2754#issuecomment-251450025" target="_blank">track the issue history here, if you like</a>).

Back in your project directory (hint, enter `cd -` in the console to return to the last directory), enter the list command for the console, like so:

<pre class="language-bash"><code class="language-bash">
vendor/bin/drupal list
</code></pre>

If installation was successful, you should see a full list of commands that Drupal Console makes available to you.

At this point, lets have some fun.

The first thing we need is a module that will hold our search form. We can begin generating our module with the `generate:module` command:

<pre class="language-bash"><code class="language-bash">
vendor/bin/drupal generate:module
</code></pre>

After a few seconds, the console will ask you some questions about your module, such as the module name, module title, module description, and if you want to add a `.module` file. Enter what you'd like for the name and description. If you choose to add a `.module` file, Drupal Console will generate a boilerplate `hook_help` implementation based on the information you entered. You can choose either way, and you can always add or remove it later.

Next, we need our form. The `generate` command is very robust, and has a method to generate a form too:

<pre class="language-bash"><code class="language-bash">
vendor/bin/drupal generate:form
</code></pre>

Again, Drupal Console will ask you some basic questions about the form you want to generate. Specify the module name you created in the previous step (Drupal Console will autocomplete the name for you). You also supply the form class name, the form id, if you want to inject some services to the form constructor (like, request_stack), and even the kinds of form fields you'd like to generate. 

The end result will look similar to the following. Note that I added a few things like classes to my form fields, and a submit redirect. Other than that, it came ready made to be used in Drupal.

<pre class="language-php"><code class="language-php">
namespace Drupal\mymodule_search_forms\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Drupal\Component\Utility\Xss;
use Drupal\Component\Utility\Unicode;

/**
 * Class SearchForm.
 *
 * @package Drupal\mymodule_search_forms\Form
 */
class SearchForm extends FormBase {

  /**
   * Symfony\Component\HttpFoundation\RequestStack definition.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  public function __construct(
    RequestStack $request_stack
  ) {
    $this->requestStack = $request_stack;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('request_stack')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'search_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $keywords = Xss::filter(\Drupal::request()->get('keywords'));

    $form['keywords'] = [
      '#type' => 'textfield',
      '#maxlength' => 128,
      '#size' => 64,
      '#default_value' => Unicode::strlen($keywords) ? $keywords : '',
      '#prefix' => '<div class="search-box__input">',
      '#suffix' => '</div>',
      '#attributes' => [
        'class' => [
          'search-box__form'
        ],
        'placeholder' => Unicode::strlen($keywords) ? $keywords : $this->t('Search Site'),
      ]
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Search'),
      '#attributes' => [
        'class' => [
          'search-box__button',
        ],
        'data-twig-suggestion' => 'search_results_submit'
      ]
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $form_state->setRedirect(
      'view.acquia_search.results', 
      [
        'keywords' => $form_state->getValue('keywords')
      ]
    );
  }
}
</code></pre>

Granted, I have some adjustments to make, such as how I am obtaining/setting `$keywords` variable - but I wanted to demonstrate to my colleague how fast this was. All in all, it took about 5 minutes to get to this point. I would estimate that by doing it manually, I would have spent upwards of 30-45 minutes getting everything setup, and thats without making a mistake in filenames or `use` statements or any random typos. Drupal Console will produce a consistent result each and every time, quickly.

From here, all I need to do is use the form builder service to build and render the form so I can inject it into a few templates in my theme, and we're done.

If you want to add another form to your module, simply repeat the process with `vendor/bin/drupal generate:form`, specify your module, and a new form class, and it will generate another one (_and_ automatically update your routing.yml as well).
