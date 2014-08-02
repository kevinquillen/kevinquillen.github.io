---
layout: post
title:  "Using the Migrate Framework with a remote database on Pantheon"
subtitle: Define your database connections on the fly, not in settings.php.
date:   2014-08-02 14:00:00
category: migration
tags: 
 - drupal planet
 - drupal
 - migrate
 - pantheon
body-color: mustard
excerpt: If you host your Drupal site on the Pantheon platform, you may already know that you do not need to include a settings.php file because they provide the connection information for you automatically. However, you _can_ provide one if you are setting up database connections. What was unclear, at least to me, is that you can only define connections for local development. Fortunately, there is a way around this.
published: true
---

If you host your Drupal site on the Pantheon platform, you may already know that you do not need to include a settings.php file because they provide the connection information for you automatically. However, you _can_ provide one if you are
setting up database connections. What was unclear, at least to me, is that you can only define connections for local development. Connections are otherwise ignored on the Pantheon environment, I assume for security reasons (since the user/pass/host would be 
out in the open) and probably other technical reasons I am unaware of.

Combined with that, you can only have one database per environment on Pantheon. So, you can't create two databases and set them up side by side. You would need to have two Pantheon sites going, in that case, if the other site is hosted on Pantheon.

If you are trying to migrate data between two databases with the Migrate Framework, this can pose a problem, because we are accustomed to keeping our connection keys in settings.php. What you'll quickly find is that nothing you do to define more keys seems to work.
Fortunately, there is a way around this - we can define database connections on the fly at runtime, and _this is allowed_ in the Pantheon environment.

What I've done is I simply defined a connection info when my parent migration class is instantiated. I typically have a parent class that contains utility and/or shared methods, like generating redirects, creating menu links, stripping HTML from text and other data-massaging
utilities. They extend this class, and inherit the database connection. We then set the <code>$connection</code> and <code>$connection_key</code> property to what we defined, and all getConnection calls leverage these values. Bam, you are now hooked into a remote database in Pantheon.

### Parent migration class

<pre class="language-markup"><code class="language-php">
<?php
abstract class YourParentMigration extends Migration {
  protected $rules = array();
  protected $connection = '';
  protected $connection_key = '';

  public function __construct($arguments) {
    parent::__construct($arguments);

    Database::addConnectionInfo('legacy', 'default', array(
      'driver' => 'mysql',
      'database' => 'DATABASE',
      'username' => 'USER',
      'password' => 'PASSWORD',
      'host' => 'HOST',
      'port' => 'PORT',
    ));

    $this->connection = 'default';
    $this->connection_key = 'legacy';
  }
  
  // other methods ...
}
</code></pre>

### Extending the parent migration class to leverage the connection

<pre class="language-markup"><code class="language-php">
<?php
class YourChildMigration extends YourParentMigration {
  public function __construct($arguments) {
    parent::__construct($arguments);
    
    $query = Database::getConnection($this->connection, $this->connection_key);
    // other query arguments to execute
  }
}
</code></pre>

You should be good to go now as far as running Migrations goes for Drupal. I believe I could change the connection info to be any server I want, but, I have only tried it with Pantheon database servers. Your mileage may vary.