---
layout: post
title: Routing Client Requests from Javascript to Drupal 8 to Remote Services
date: 2018-08-18 12:00:00
category: drupal
tags:
 - symfony
 - reactjs
 - controllers
image: /assets/images/code-1.jpg
---

On a recent project that was built on Drupal 8, we had a requirement to integrate with three different search platforms.

One of them was private access only, requiring a whitelisted IP to talk to it. On the front end, we designed and built the search form and result list logic as a ReactJS component. The component did it all, making the request and listing the results back from the response.

Since only our web server is permitted access, we have to provide a way for the client (Javascript) to talk through Drupal to make the request. Drupal 8 makes this very simple thanks to Symfony components and the Guzzle HTTP client - all we have to do is provide a route for the ReactJS app to make the request to. Thus, the request will originate from our whitelisted server and work as intended.

But you may think, wait a second - don't standard controllers in Drupal 8 return `#build` arrays and the end result being the entire page viewed at that route? You'd be right, and normally, that is the case. The ReactJS app is expecting to get back an XML document with search result items in it, so how can we do that?

Drupal controllers have a few things they can return. The default is a `#build` array. You can also return a plain `Response` Symfony object - which is exactly what we want to do:

<pre class="language-php"><code class="language-php">
namespace Drupal\mymodule\Controller;

use Drupal\Core\Controller\ControllerBase;
use GuzzleHttp\Client;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class SearchController.
 *
 * @package Drupal\mymodule\Controller
 */
class SearchController extends ControllerBase {

  /**
   * The base url to do searches against.
   *
   * @var string
   */
  protected $baseSearchUrl = "http://EXTERNALSERVICE.COM/api";

  /**
   * Symfony\Component\HttpFoundation\RequestStack definition.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * GuzzleHttp\Client definition.
   *
   * @var \GuzzleHttp\Client
   */
  protected $httpClient;

  /**
   * Psr\Log\LoggerInterface definition.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * Constructor for our class.
   */
  public function __construct(RequestStack $request_stack, Client $http_client, LoggerInterface $logger) {
    $this->requestStack = $request_stack;
    $this->httpClient = $http_client;
    $this->logger = $logger;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('request_stack'),
      $container->get('http_client'),
      $container->get('logger.factory')->get('mymodule')
    );
  }

  /**
   * Controller action. Theme/twig contains the ReactJS component.
   */
  public function index() {
    return [
      '#theme' => 'mymodule_search_results',
    ];
  }

  /**
   * Fetch results from the search endpoint.
   *
   * @return \Symfony\Component\HttpFoundation\Response
   *   A Symfony response object.
   */
  public function results() {
    $data = '';
    $uri = $this->baseSearchUrl . $this->requestStack->getCurrentRequest()->getQueryString();

    try {
      $response = $this->httpClient->get($uri, ['headers' => ['Accept' => 'text/xml']]);
      $data = (string) $response->getBody();
    }
    catch (RequestException $e) {
      $this->logger->error("Error returned from search service, error was @error", ['@error' => $e->getMessage()]);
    }

    return new Response($data, 200);
  }

}
</code></pre>

A 200 OK response and the response body is returned. Every request also attaches any incoming query strings from the ReactJS app and sends them along - they are already formatted to conform with what the API expects (paging, search terms, sort filters, etc). We still return a 200 even if the request fails for whatever reason for the users sake. The frontend will handle informing the user, instead of throwing or breaking the experience.

With the `#theme` property on the action, we can signal a theme hook for the page when it renders the `page.content` from the outer template:

<pre class="language-html"><code class="language-html">
&lt;div class="js-search-listing-app" data-request-url="/search/results"&gt;
  Loading...
&lt;/div&gt;
</code></pre>

React binds to this and populates everything we need (search input, result list). The `data-request-url` attribute tells the React code what to make its request to.

The end result is the client app sending a request to our Drupal application, which then sends the request along to the external search service and returns the result.

