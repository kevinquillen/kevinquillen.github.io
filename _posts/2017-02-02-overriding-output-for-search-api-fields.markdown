---
layout: post
title: "Overriding Output for Search API Fields in Views"
date: 2017-02-02 12:00:00
category: drupal
tags:
 - views
 - search api
 - twig
 - theming
image: /assets/images/code-3.jpg
---

Just wanted to share a quick example of overriding a field output from Search API if the value isn't exactly what you want.

In my case, I am indexing the URI of a node and have a design requirement to output it as a link in the result, but it has to contain the host and scheme (http://www.example.com/path/to/node). Out of the box, Search API is only returning the "/path/to/node" portion, which QA quickly kicked back to me.

I was able to solve the problem quickly by just using `hook_preprocess_views_view_field()`. I didn't really see any other configuration in Search API Solr to facilitate this, and I suppose you can go through the process to create a new field to store this in (or maybe alter/append to the value when indexing), but that seemed like overkill because this only took a few minutes. I also did not see an option in Views to prepend this to the result item, either.

<pre class="language-php"><code class="language-php">
/**
 * Implements hook_preprocess_views_view_field().
 * @param $variables
 */
function mytheme_preprocess_views_view_field(&$variables) {
  if ($variables['view']->id() == 'acquia_search') {
    // needs the full URL, not just the path that solr indexes
    if ($variables['field']->realField == 'search_api_url') {
      $path = $variables['row']->search_api_url[0];
      $path = \Drupal::request()->getSchemeAndHttpHost() . $path;
      $url_object = Url::fromUri($path);
      $url = Link::fromTextAndUrl($path, $url_object)->toRenderable();
      $variables['output'] = $url;
    }
  }
}
</code></pre>

Now, when the field is rendered in the respective Views template, it displays the entire URL and not just the URI.

`Link::fromTextandUrl` provides me with a `Link` object, and I call `toRenderable()` to get a renderable array to pass on.

Here is another example. This time, I wanted to ensure that - even if no 'exact' text match was found, the search excerpt would not be empty. I don't want to show an empty excerpt, I have to at least show something. Plus, I was having an issue where the excerpt was including the entire full view mode (stripped of HTML) which made result items bloated on the page.

<pre class="language-php"><code class="language-php">
/**
 * Implements hook_preprocess_views_view_field().
 * @param $variables
 */
function pncb_preprocess_views_view_field(&$variables) {
  if ($variables['view']->id() == 'acquia_search') {
    // needs the full URL, not just the path that solr indexes
    if ($variables['field']->realField == 'search_api_url') {
      $path = $variables['row']->search_api_url[0];
      $path = \Drupal::request()->getSchemeAndHttpHost() . $path;
      $url_object = Url::fromUri($path);
      $url = Link::fromTextAndUrl($path, $url_object)->toRenderable();
      $variables['output'] = $url;
    }

    if ($variables['field']->realField == 'search_api_excerpt') {
      $excerpt = $variables['row']->search_api_excerpt;
      $excerpt = Unicode::truncate($excerpt, 256, TRUE, TRUE);
      $excerpt = Markup::create($excerpt);
      $variables['output'] = $excerpt;
    }
  }
}
</code></pre>

Now I get excerpts that are consistent in length. Granted, it's not truly an 'excerpt' now per se, I am investigating why I am having trouble displaying one. But that's another issue entirely.
