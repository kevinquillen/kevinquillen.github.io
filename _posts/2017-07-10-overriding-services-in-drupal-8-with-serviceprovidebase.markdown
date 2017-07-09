---
layout: post
title: Overriding Services in Drupal 8 with ServiceProvideBase
date: 2017-07-10 12:00:00
category: drupal
tags:
 - services
 - symfony
image: /assets/images/tmux.jpg
---

Overriding a service in Drupal 8 is pretty easy. Within your sites directory, you will see a file called `default.services.yml`. You can adjust these defaults by adding a `services.yml` file in the sites directory. This is common when you want to enable twig debugging when in development (as `development.services.yml`).

In this example, I needed to change the core User Authentication service from what Drupal provides, to my own service. This was necessary because I am authenticating all users, with exception to user 1, against a Netforum member database.

Doing this is pretty easy, I just copied the default definition from `core.services.yml` into my `services.yml` file, and added the arguments I needed:

<pre class="language-yaml"><code class="language-yaml">
services:
  user.auth:
    class: Drupal\mymodule\UserAuth
    arguments: ['@entity.manager', '@password', '@language_manager', '@logger.factory', '@mymodule.netforum_client']
</code></pre>

However, when I finished the module and deployed to the dev server, I realized I made an error.

Since the service I am overriding points to a class that a module defines, and that module is not yet enabled, attempting to clear the cache led to a fatal error. The class I am pointing to is not yet registered in the autoloader, because I have not yet enabled the module. But I could not enable the module either, because of the same error. For the time being, I had to edit the services.yml file on the server with vim to bring the site back up.

Instead, whenever overriding a service, it is better to encapsulate the behavior in your module by extending `ServiceProviderBase`. To register this class, the name of it has to be `YourModuleNameServiceProvider` under `src/` directory for it to be detected.

<pre class="language-php"><code class="language-php">
<?php

namespace Drupal\mymodule;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;
use Symfony\Component\DependencyInjection\Reference;

/**
 * Class MyModuleServiceProvider.
 *
 * @package Drupal\mymodule
 */
class MyModuleServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritdoc}
   */
  public function alter(ContainerBuilder $container) {
    $definition = $container->getDefinition('user.auth');
    $definition->setClass('Drupal\mymodule\UserAuth');
    $definition->setArguments(
      [
        new Reference('entity.manager'),
        new Reference('password'),
        new Reference('language_manager'),
        new Reference('logger.factory'),
        new Reference('mymodule.netforum_client'),
      ]
    );
  }

}
</code></pre>

This is the equivalent of the yaml override in the first example, except now this is not overridden until the module is enabled and the cache is cleared out. Therefore, you will not run into a fatal error on deployment now, unless you spelled the class path incorrectly.

The one caveat to this approach is if there were multiple modules trying to override the same service, as there is no guarantee which module will "win" the override. I'd like to think this could be solved by setting your modules weight in the install process, but I am not entirely sure.

I think that in many cases this is discouraged for contrib modules because it drastically changes expected behavior. However, in the case of user authentication, there is no other path to take, as you have to implement your own authentication using the UserAuthInterface as a blueprint.

Also note that arguments being passed to this service must be done as `new Reference('argument')`. Unlike yaml, they cannot be passed as a string here.

In a future post, I will demonstrate what this user auth override is doing, and how easy it can be to implement or alter the authentication in Drupal 8.

Update: Yes, it does appear you can dictate your service authority by <a href="https://drupal.stackexchange.com/a/241283/57" target="_blank">setting a higher module weight than others</a>.
