---
layout: post
title: Adding Parameters to Dependency Injected Objects
date: 2017-06-29 12:00:00
category: drupal
tags:
 - php
 - symfony
 - dependency injection
image: /assets/images/code-3.jpg
---

In the last post, I touched on how you can define a service in your `mymodule.services.yml` file and pass it parameters to configure the object when it is injected as a dependency into other classes.

Following on that, I ran into a scenario where I needed to define multiple Solr cores on the servers that house the dev/qa sites, and one for staging and production. Each one would also be defined in Search API as a server, and each of the sites I am indexing would have their own index under each core per environment.

Why?

In our setup, we are indexing multiple sites worth of content into the same core.

For example, lets say on our QA server:

- Site A is indexed to sitea_qa
- Site B is indexed to siteb_qa
- Site C is indexed to sitec_qa

Each of these indexes are stored on projectname_qa core in Solr.

Since we have a search on each site that searches all content for any site, we aren't using Views/Search API. Instead, I setup a controller at `/search` and used Solarium client and some elbow grease to get a search stood up. I'll show that off in a future post. But since we went this route, two things happened:

- Our site id was a static value, no matter what env/core the indexed item was in
- On dev/qa box, all 6 sites had the wrong results because they were getting mixed between dev or qa (same Solr instance, using same core, before we made this change)

I decided to just be pragmatic and direct and add a core for each site and namespace the index in Search API as `sitekey_env` (ex. abcd_dev). This general house cleaning set me up for the real task - informing the Solarium client what core I wanted to query from.

This turned out to be easier than I expected.

The Solarium client allows for multiple endpoints to be defined in its configuration. All I had to do was add on to my endpoints definition in the services file:

<pre class="language-yaml"><code class="language-yaml">
parameters:
  iana_solr_search.solarium_client.config:
    endpoint:
      localhost:
        host: "localhost"
        port: "8983"
        path: "/solr/local"
      dev:
        host: "localhost"
        port: "8983"
        path: "/solr/dev"
      qa:
        host: "localhost"
        port: "8983"
        path: "/solr/qa"
      prod:
        host: "localhost"
        port: "8983"
        path: "/solr/prod"
</code></pre>

Cool. Now my Solarium client object config comes with those endpoints loaded up. The first one listed is always the default that Solarium uses - now I just had to work out the switching logic, and tell Solarium what endpoint I wanted to use by adding a method to my implementation:

<pre class="language-php"><code class="language-php">
  /**
   * Gets the endpoint to what environment we are running in.
   *
   * @return object
   *   The appropriate endpoint for the environment.
   */
  protected function selectEndpoint() {
    $host = $this->requestStack->getCurrentRequest()->getHttpHost();
    
    switch ($host) {
      case 'dev.site-a.com':
      case 'dev.site-b.com':
      case 'dev.site-c.com':
        $endpoint = 'dev';
        break;
      case 'qa.site-a.com':
      case 'qa.site-b.com':
      case 'qa.site-c.com':
        $endpoint = 'qa';
        break;
      case 'www.site-a.com':
      case 'www.site-b.com':
      case 'www.site-c.com':
        $endpoint = 'prod';
        break;
      default:
        $endpoint = 'localhost';
        break;
    }

    return $this->client->getEndpoint($endpoint);
  }
</code></pre>

I really hope I have time to refactor this into using ENV variables or something better instead of host name, but for now I just needed to get up and running. Anyway, this takes care of the method, and now we just tell Solarium client want to do:

<pre class="language-php"><code class="language-php">
$endpoint = $this->selectEndpoint();

// code ... applying filters, scoring, etc

return $this->client->select($query, $endpoint);
</code></pre>

Thats all there was to it. The above code is tucked away in the implementation, I don't need to continually call it.

Now, no matter what site I am on, there is no fear of:

- Getting the incorrect results back from lower environment sites
- Different index names per site/env ensure items are not accidentally overwritten/removed
- I don't need to logic switch on which endpoint to use, the code will get it before executing the query

This was a pretty fun discovery, and I hope I have time to refactor and expand on this a little more.
