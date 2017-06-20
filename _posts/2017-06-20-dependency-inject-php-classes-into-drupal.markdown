---
layout: post
title: Dependency Inject PHP Classes into Drupal
date: 2017-06-20 12:00:00
category: drupal
tags:
 - symfony
 - dependency injection
image: /assets/images/tmux.jpg
---

In my latest adventures in Drupal 8, I had to build out a multisite search with Solr.

While I will touch on that later, I wanted to call out something I learned today, which is how to inject dependencies to your Drupal class with non-native Drupal code.

What do I mean by that?

For example, while iterating over my controller for the search results page, I simply used `$client = new Solarium\Client();` because I did not know how to inject that into Drupal properly.

When I reached a point that I could refactor, this was one of the things on the list to fix up.

Turns out, all I needed to do was create a services.yml file in my module, define a service namespace and what class to inject.

It doesn't matter if the class is in the vendor folder (in this case, Solarium) - after all, Drupal is using Symfony components from here, too.

#### In mymodule.services.yml:

<pre class="language-yaml"><code class="language-yaml">
services:
  iana_solr_search.solarium_client:
    class: Solarium\Client
</code></pre>

With a cache clear in Drupal, I could now inject that to my controller.

My second problem was that I not only needed the client to be injected, but I also needed it to be configured, too.

I was able to do that by defining parameters and adding my configuration to it. Then, I can pass that parameter as an argument to my service.

<pre class="language-yaml"><code class="language-yaml">
parameters:
  iana_solr_search.solarium_client.config:
    endpoint:
      localhost:
        host: "localhost"
        port: "8983"
        path: "/solr/iana"

services:
  iana_solr_search.solarium_client:
    class: Solarium\Client
    arguments: ['%iana_solr_search.solarium_client.config%']
</code></pre>

Now, when the Solarium Client class is injected when called, and configured how I need it. From here, we simply add our new service to the `create()` method of our controller and pass it to our constructor: 

<pre class="language-php"><code class="language-php">
  /**
   * Symfony\Component\HttpFoundation\RequestStack definition.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * Solarium\Client definition.
   *
   * @var \Solarium\Client
   */
  protected $client;

  /**
   * Constructor for our class.
   */
  public function __construct(RequestStack $request_stack, Client $solarium_client) {
    $this->requestStack = $request_stack;
    $this->client = $solarium_client;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('request_stack'),
      $container->get('iana_solr_search.solarium_client')
    );
  }
</code></pre>

Just like other injected dependencies, we can now use it anywhere in our class:

<pre class="language-php"><code class="language-php">
    // Create a select query and dismax component.
    $query = $this->client->createSelect();
    $dismax = $query->getDismax();

    // Create the offset.
    $query->setStart($offset);

    // If keyword was found in the query string, add to query.
    $keywords = $this->requestStack->getCurrentRequest()->get('keywords');

    if (!empty($keywords)) {
      $dismax->setQueryFields('ss_title tm_rendered_item terms_tm_full_html_render');
      $query->setQuery($keywords);
      $dismax->setBoostQuery('tm_rendered_item^2.0 terms_tm_full_html_render^5.0 ss_title^2.0');
    }
</code></pre>
