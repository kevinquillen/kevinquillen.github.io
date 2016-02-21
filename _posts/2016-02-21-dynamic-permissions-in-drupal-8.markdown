---
layout: post
title:  "Dynamic Permission Creation in Drupal 8"
date:   2016-02-21 12:30:00
category: drupal
tags:
  - drupal 8
excerpt: hook_permission has been removed from Drupal 8, but there is a way to define permissions programmatically.
image: /assets/images/code-1.jpg
---

In recent conversion efforts of [Custom Publishing Options](https://drupal.org/project/custom_pub) and [Taxonomy Views Integrator](https://drupal.org/project/tvi), I had to replicate the permission assignments from Drupal 7 to Drupal 8. hook_permission() has been removed from Drupal 8. Instead, you have to create a
mymodule.permissions.yml and define them there, like so (from node.permissions.yml):

<pre class="language-markup">
<code class="language-yaml">
administer nodes:
  title: 'Administer content'
  description: 'Promote, change ownership, edit revisions, and perform other tasks across all content types.'
  restrict access: true
access content overview:
  title: 'Access the Content overview page'
  description: 'Get an overview of all content.'
access content:
  title: 'View published content'
view own unpublished content:
  title: 'View own unpublished content'
</code>
</pre>

That's great - but how can you define permissions dynamically that depend on say, config entities in the system?

## Permission Callbacks

Turns out we can define permissions_callback in mymodule.permissions.yml, and point it to a controller to return an array of permissions, similar to
hook_permission() from Drupal 7. I do that for both modules mentioned above. In Taxonomy Views Integrator's case, I need a permission set per term and vocabulary,
as the module allows added configuration for each:

<pre class="language-markup">
<code class="language-yaml">
permission_callbacks:
  - Drupal\tvi\TaxonomyViewsIntegratorPermissions::permissions
</code>
</pre>

Drupal will now look to this class and method for permissions. The next part may look a little scary from Drupal 7, but it's actually pretty straightforward:

<pre class="language-markup">
<code class="language-php">
/**
 * @file
 * Contains \Drupal\tvi\TaxonomyViewsIntegratorPermissions.
 */

namespace Drupal\tvi;

use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityManagerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Symfony\Component\DependencyInjection\ContainerInterface;

class TaxonomyViewsIntegratorPermissions implements ContainerInjectionInterface {

  use StringTranslationTrait;

  /**
   * The entity manager.
   *
   * @var \Drupal\Core\Entity\EntityManagerInterface
   */
  protected $entityManager;

  /**
   * Constructs a TaxonomyViewsIntegratorPermissions instance.
   *
   * @param \Drupal\Core\Entity\EntityManagerInterface $entity_manager
   *   The entity manager.
   */
  public function __construct(EntityManagerInterface $entity_manager) {
    $this->entityManager = $entity_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static($container->get('entity.manager'));
  }

  /**
   * Get permissions for Taxonomy Views Integrator.
   *
   * @return array
   *   Permissions array.
   */
  public function permissions() {
    $permissions = [];

    foreach ($this->entityManager->getStorage('taxonomy_vocabulary')->loadMultiple() as $vocabulary) {
      $permissions += [
        'define view for vocabulary ' . $vocabulary->id() => [
          'title' => $this->t('Define the view override for the vocabulary %vocabulary', array('%vocabulary' => $vocabulary->label())),
        ]
      ];

      $permissions += [
        'define view for terms in ' . $vocabulary->id() => [
          'title' => $this->t('Define the view override for terms in %vocabulary', array('%vocabulary' => $vocabulary->label())),
        ]
      ];
    }

    return $permissions;
  }
}
</code>
</pre>

Using dependency injection, our class is constructed with the EntityManager service from the container. This provides access to call for
all sorts of information - in this case we are looping all taxonomy_vocabulary entities in the system to create a permission set for them.

With that set, we can now add access checks where we need them, for instance, before altering a taxonomy form, I check the current user has permission:

<pre class="language-markup">
<code class="language-php">
/**
 * Implements hook_form_BASE_FORM_ID_alter().
 * @param $form
 * @param \Drupal\Core\Form\FormStateInterface $form_state
 * @param $form_id
 */
function tvi_form_taxonomy_vocabulary_form_alter(&$form, FormStateInterface $form_state, $form_id) {
  $entity = $form_state->getBuildInfo()['callback_object']->getEntity();

  if ($entity->id() !== null && Drupal::currentUser()->hasPermission('define view for vocabulary ' . $entity->id())) {
    _tvi_settings_form($form, $form_state, $entity);
  }
}
</code>
</pre>

Nice.

Transitioning away from most of the common or favored hooks in Drupal 7 can be bumpy at first, but the more you work with Drupal 8, the more you realize
why the changes were necessary to scale up, and have a more modular system.

The same permission check above can be applied to #access property too, for instance, with form options (from [Custom Publishing Options](https://drupal.org/project/custom_pub)):

<pre class="language-markup">
<code class="language-php">
/**
 * Implements hook_form_BASE_FORM_ID_alter().
 * Regroup any custom publishing options to be under a grouped tab on the node form.
 * @param $form
 * @param FormStateInterface $form_state
 */
function custom_pub_form_node_form_alter(&$form, FormStateInterface $form_state) {
  $entities = \Drupal::entityTypeManager()->getStorage('custom_publishing_option')->loadMultiple();
  $form_keys = Element::children($form);
  $user = \Drupal::currentUser();
  $custom_publish_options = false;

  foreach ($entities as $machine_name => $entity) {
    if (in_array($entity->id(), $form_keys)) {
      $form[$entity->id()]['#group'] = 'custom_publish_options';
      $form[$entity->id()]['#access'] = $user->hasPermission('can set node publish state to ' . $entity->id());
      $custom_publish_options = true;
    }
  }

  // show the fieldset if we have options the user can use.
  if ($custom_publish_options) {
    $form['custom_publish_options'] = array(
      '#type' => 'details',
      '#title' => t('Custom Publish Options'),
      '#group' => 'advanced',
      '#attributes' => array(
        'class' => array('node-form-custom-publish-options'),
      ),
      '#weight' => 100,
      '#optional' => TRUE,
    );
  }
}
</code>
</pre>

Nothing to it!

The permission callback class in this instance is a fairly common pattern for most use cases. If you use an IDE like PHPStorm, you can create a
File Template or Live Template with the permission class above so that creating them in modules is dead simple. Although, I would advise learning how
class construction, dependency injection and services work first before you rely on boilerplate code generation.
