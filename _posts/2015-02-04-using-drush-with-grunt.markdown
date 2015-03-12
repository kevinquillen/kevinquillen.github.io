---
layout: post
title:  "Using Drush Automatically with Grunt"
subtitle: Take your Drush-Fu to the next level and let Grunt do the legwork.
date:   2015-02-04 14:00:00
category: grunt
tags:
 - drupal
 - drupal planet
body-color: seagreen
excerpt: Ever find yourself working on a Drupal theme and unable to figure out why templates aren't recognized, CSS isn't changing, or JS is still acting funky only to realize you haven't done something as simple as clear cache? We all have. Fortunately, we can do this automatically via Grunt.
image: /assets/images/code-1.jpg
---

Ever find yourself working on a Drupal theme and unable to figure out why templates aren't recognized, CSS isn't changing, or JS is still
acting funky only to realize you haven't done something as simple as clear cache? We all have. Fortunately, we can do this automatically via Grunt.

I can't count how many times I have been defining a custom entity, adding/changing javascript, doing theme work or adding .inc files to Drupal and forgetting
to clear the cache so files and aggregates are regenerated to reflect the changes. It's one of those tedious tasks that gets so repetative it is easy
to forget to do it. Lucky for us, Grunt is built to handle such tasks for us.

In this example, I am going to have Grunt clear the theme registry and css/js aggregates for me automatically as I work. Your workflow is likely different
than mine; I use [Zurb Foundation](https://www.drupal.org/project/zurb_foundation) exclusively (which I am co-maintainer of). It acts as the base theme, with easy commands to generate a subtheme.

I also assume you are familiar at least with how to install node modules, Grunt, and how to get Grunt setup in a theme project. [Zurb Foundation](https://www.drupal.org/project/zurb_foundation) comes
with it's own Gruntfiles that you can modify to your liking.

To make the most out of this, you will need the following Grunt plugins along with the Grunt Drush plugin:

* grunt-contrib-watch
* grunt-sass
* node-sass
* node-bourbon

The Sass plugins aren't technically required - but if you are using the Foundation theme, they are. The Sass preprocessor generates compiled CSS for you
and this lets us take better advantage of caching and Drush.

#### Get the Grunt Drush plugin

Firstly, there is a generic Drush Grunt plugin that we are going to need to communicate to Drush. You can install that to your project by adding it to
the package.json file and running npm update (<code>"grunt-drush": "*"</code>) or, with this command in your subtheme directory:

<pre class="language-markup"><code class="language-markup">
npm install grunt-drush --save-dev
</code></pre>

This command will also add it to your package.json for you.

#### Define your Drush configuration

As with most Grunt plugins, we need to add some configuration and hook up our task in the Gruntfile. The Grunt Drush plugin is pretty straightforward, and has two parameters:
args and dest. Args is an array that takes a Drush command and arguments to pass to Drush. Dest points it to a path if required. In this example, I don't need to
make use of Dest.

<pre class="language-markup"><code class="language-javascript">
drush: {
  cc_theme_registry: {
    args: ['cc', 'theme-registry']
  },
  cc_css_js: {
    args: ['cc', 'css-js']
  }
}
</code></pre>

Here, I basically defined two custom tasks. One to clear the theme registry, another to clear the css/js cache. I can call either one at-will and instruct
Grunt exactly when I want them executed.

#### Adding to the watcher

Now that we have defined our basic Drush config, we can leverage <code>watch</code> and start telling Grunt when we want to execute the tasks. Below,
I have added <code>drush:cc_css_js</code> to be executed whenever the Sass tasks executes. This will clear css/js cache after CSS files have been updated.

I am also defining my own watcher, <code>templates</code>, which tells the watch task to look for changes in the templates directory for any file matching <code>(filename).tpl.php</code>.
When new files are added, changed, or deleted, the theme registry is cleared to reflect those changes.

<pre class="language-markup"><code class="language-javascript">
watch: {
  grunt: { files: ['Gruntfile.js'] },

  sass: {
    files: '<%= global_vars.theme_scss %>/**/*.scss',
    tasks: ['sass', 'drush:cc_css_js'],
    options: {
      livereload: true
    }
  },

  templates: {
    files: 'templates/*.tpl.php',
    tasks: ['drush:cc_theme_registry']
  }
}
</code></pre>

This leaves us with the ability to leave page caching, CSS and JS aggregation on in our Drupal site for local development. Anytime we make changes to SCSS or
template files, Grunt will trigger Drush to clear the applicable cache.

#### Extra example

How about clearing the registry when we add a new inc file, new class definition, or update a module .info file? Add a new task to the Drush config:

<pre class="language-markup"><code class="language-javascript">
drush: {
  cc_theme_registry: {
    args: ['cc', 'theme-registry']
  },
  cc_css_js: {
    args: ['cc', 'css-js']
  }
  cc_registry: {
    args: ['cc', 'registry']
  }
}
</code></pre>

And in the Gruntfile.js:

<pre class="language-markup"><code class="language-javascript">
watch: {
  grunt: { files: ['Gruntfile.js'] },

  sass: {
    files: '<%= global_vars.theme_scss %>/**/*.scss',
    tasks: ['sass', 'drush:cc_css_js'],
    options: {
      livereload: true
    }
  },

  templates: {
    files: 'templates/*.tpl.php',
    tasks: ['drush:cc_theme_registry']
  },

  includes: {
    files: ['/sites/all/modules/custom/**/*.inc', '/sites/all/modules/custom/**/*.info'],
    tasks: ['drush:cc_registry'],
  }
}
</code></pre>

This would clear the Drupal registry when inc files are added or modified in custom Drupal modules, same for the module .info file. This may be a little heavy
handed, but it does illustrate what you can do with Drush and Grunt.

#### Full Gruntfile.js example

<pre class="language-markup"><code class="language-javascript">
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var theme_name = 'YOUR_SUBTHEME_NAME';
  var base_theme_path = '../zurb_foundation';

  var global_vars = {
    theme_name: theme_name,
    theme_css: 'css',
    theme_scss: 'scss',
    base_theme_path: base_theme_path
  };

  var bourbon = require('node-bourbon').includePaths;

  grunt.initConfig({
    global_vars: global_vars,
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      dist: {
        options: {
          outputStyle: 'compressed',
          includePaths: ['<%= global_vars.theme_scss %>', '<%= global_vars.base_theme_path %>/scss/'].concat(bourbon)
        },
        files: {
          '<%= global_vars.theme_css %>/<%= global_vars.theme_name %>.css': '<%= global_vars.theme_scss %>/<%= global_vars.theme_name %>.scss'
        }
      }
    },

    drush: {
      cc_theme_registry: {
        args: ['cc', 'theme-registry']
      },
      cc_css_js: {
        args: ['cc', 'css-js']
      }
    },

    watch: {
      grunt: { files: ['Gruntfile.js'] },

      sass: {
        files: '<%= global_vars.theme_scss %>/**/*.scss',
        tasks: ['sass', 'drush:cc_css_js'],
        options: {
          livereload: true
        }
      },

      templates: {
        files: 'templates/*.tpl.php',
        tasks: ['drush:cc_theme_registry']
      }
    }
  });

  grunt.registerTask('build', ['sass']);
  grunt.registerTask('default', ['build', 'watch']);
};
</code></pre>
