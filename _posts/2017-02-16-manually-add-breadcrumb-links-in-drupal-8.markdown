---
layout: post
title: Manually Add Breadcrumb Links in Drupal 8
date: 2017-02-16 12:00:00
category: drupal
tags:
 - views
 - breadcrumb
 - navigation
image: /assets/images/code-3.jpg
---

In Drupal, most breadcrumb generation and navigation is sufficient by basing it off of the menu hierarchy with the Menu Breadcrumb module.

This works great except in certain edge cases, such as nodes that do not have menu placement, and Views pages which may exist, but not have a set menu link. Neither Drupal core nor Menu Breadcrumb have a way to handle this scenario.

Fortunately, there is an alter hook that can facilitate instances when you need to modify the breadcrumb, and that is `hook_system_breadcrumb_alter()`. Below is the code I wrote to handle items that have no menu placement yet still need a breadcrumb:`

<pre class="language-php"><code class="language-php">
use Drupal\Core\Breadcrumb\Breadcrumb;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Link;

/**
 * Implements hook_system_breadcrumb_alter().
 *
 * Append node title to breadcrumb for certain content types and views that are 
 * not in the menu.
 *
 * @param \Drupal\Core\Breadcrumb\Breadcrumb $breadcrumb
 * @param \Drupal\Core\Routing\RouteMatchInterface $route_match
 * @param array $context
 */
function mymodule_breadcrumbs_system_breadcrumb_alter(Breadcrumb &$breadcrumb, RouteMatchInterface $route_match, array $context) {
  if ($breadcrumb && !\Drupal::service('router.admin_context')->isAdminRoute()) {
    $node = \Drupal::request()->get('node');
    $types = ['article', 'faq', 'product'];
    $request = \Drupal::request();

    // if the node is a type with no menu placement, attach a breadcrumb
    if ($node && in_array($node->bundle(), $types)) {
      $breadcrumb->addLink(Link::createFromRoute($node->getTitle(), '&lt;nolink&gt;'));
      $breadcrumb->addCacheTags(['node:' . $node->id()]);
    }

    // if the page is a view, attach a breadcrumb
    if (preg_match('/view\./', $route_match->getRouteName())) {
      $title = \Drupal::service('title_resolver')->getTitle($request, $route_match->getRouteObject());
      $view_id = \Drupal::routeMatch()->getMasterRouteMatch()->getParameter('view_id');
      $breadcrumb->addLink(Link::createFromRoute($title, '&lt;nolink&gt;'));
      $breadcrumb->addCacheTags(['config:views.view.' . $view_id]);
      $breadcrumb->addCacheContexts(['route.name']);
    }
  }
}
</code></pre>

Some fairly nifty things occuring here.

First, we are passed a `Breadcrumb` object and `RouteMatchInterface` object. With this, we will easily be able to accomplish our requirement. The first line basically checks that we have a populated `$breadcrumb` object, and that the current route is not an administrative one. Otherwise, our breadcrumb modifications would interfere with any administrative operations like configuring the application or editing content - we only want this to affect public facing routes.

Then I fetch the `$node` from the current request. If we are on any `node/` routes, this `$node` object will be populated. So, if we have a `$node` object, we know it is a node route, and if that node type fits our criteria, then I add a breadcrumb link, consisting of the node title. The route `<nolink>` is used to generate a breadcrumb item that is not linked, because we are already on that page.

To finish that, we have to add the node id as a cache tag. Anytime content is updated, the breadcrumb is invalidated. Essentially, this ensures that if you change the node title when editing that the breadcrumb is regenerated with the new title. Otherwise, it won't update.

Views need a different check. Since the view route is dynamic, we're basically checking if the route fits the pattern of `view.` since view routes are formed as `view.view_name.display_id`. I also use the `TitleResolver` service to fetch the title of the view. It will figure out what the title of the requested object is, so I don't even need the full View object to do this anymore.

However with Views, you need to add both **cache tags** and **cache contexts**. By setting both, we ensure that the breadcrumb is generated for this route, and is invalidated/updated whenever a View is updated. So, if I were to change either the view name or view path, the breadcrumb will reflect that change too.
