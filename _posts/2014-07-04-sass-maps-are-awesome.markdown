---
layout: post
title:  Using Maps in Sass 3.3
subtitle: Gettin sassy with it
date:   2014-07-05 18:00:00
category: sass
body-color: brightred
tags:
 - ruby
 - sass 3.3
 - sass maps
 - theming
---

Lately I have been exploring whats coming down the pipe for new versions of SASS. Version 3.3.x brings in a lot of new or improved features 
that, as a programmer, are very cool. I've enjoyed using SASS as a means of styling for quite some time now. It is simply a very efficient way 
to generate style for your site in a small amount of code.

While building my new site, I had a little issue that I didn't know how to work around until just now. I typically use Grunt to build my 
projects, including compile SASS. When Grunt fails, I use Compass (which is rare). However, neither the SASS libs or Compass gem support 
Sass version 3.3.x yet. With a little doc diving, I wielded the <code>sass</code> command line tool directly to use the newest build.

One great new feature is the ability to map key value pairs in a sass file. This means you can declare values and variables the same way you 
would define a JSON object. You can also nest maps within maps, which grants even more flexibility.

I use a variety of colors to keep it interesting. One thing that was bothering me was my sass file that controlled the dominant colors on the site:

<pre class="language-scss line-numbers"><code class="language-scss">
$seagreen: #18bc9c;
$lightblue: #3498db;
$coral: lightcoral;
$brightred: #e74c3c;
$mustard: #f39c12;
$slate: #1e2a36;
$darkgreen: #52BB67;

body {
  &.seagreen {
    header {
      background: $seagreen;
    }

    h1, h2, h3, h4, h5, h6, p {
      a {
        color: $seagreen;
      }
    }

    .btn-outline:hover, .btn-outline:focus, .btn-outline:active, .btn-outline.active {
      color: $seagreen;
    }

    .pager a {
      background-color: $seagreen;
    }
  }

  &.blue {
    header {
      background: $lightblue;
    }

    h1, h2, h3, h4, h5, h6, p {
      a {
        color: $lightblue;
      }
    }

    .btn-outline:hover, .btn-outline:focus, .btn-outline:active, .btn-outline.active {
      color: $lightblue;
    }

    .pager a {
      background-color: $lightblue;
    }
  }

  &.coral {
    header {
      background: $coral;
    }

    h1, h2, h3, h4, h5, h6, p, .btn-outline:hover, .btn-outline:focus, .btn-outline:active, .btn-outline.active {
      a {
        color: $coral;
      }
    }

    .btn-outline:hover, .btn-outline:focus, .btn-outline:active, .btn-outline.active {
      color: $coral;
    }

    .pager a {
      background-color: $coral;
    }
  }

  &.brightred {
    header {
      background: $brightred;
    }

    h1, h2, h3, h4, h5, h6, p {
      a {
        color: $brightred;
      }
    }

    .btn-outline:hover, .btn-outline:focus, .btn-outline:active, .btn-outline.active {
      color: $brightred;
    }

    .pager a {
      background-color: $brightred;
    }
  }

  &.mustard {
    header {
      background: $mustard;
    }

    h1, h2, h3, h4, h5, h6, p {
      a {
        color: $mustard;
      }
    }

    .btn-outline:hover, .btn-outline:focus, .btn-outline:active, .btn-outline.active {
      color: $mustard;
    }

    .pager a {
      background-color: $mustard;
    }
  }

  &.slate {
    header {
      background: $slate;
    }

    h1, h2, h3, h4, h5, h6, p {
      a {
        color: $slate;
      }
    }

    .btn-outline:hover, .btn-outline:focus, .btn-outline:active, .btn-outline.active {
      color: $slate;
    }

    .pager a {
      background-color: $slate;
    }
  }

  &.darkgreen {
    header {
      background: $darkgreen;
    }

    h1, h2, h3, h4, h5, h6, p {
      a {
        color: $darkgreen;
      }
    }

    .btn-outline:hover, .btn-outline:focus, .btn-outline:active, .btn-outline.active {
      color: $darkgreen;
    }

    .pager a {
      background-color: $darkgreen;
    }
  }
}
</code></pre>

Bwuh. That's a lot of duplicated code. We don't want to see that, ever. This is a perfect use-case for a map.

Here is the same code after being converted to a map and interpreted:

<pre class="language-scss line-numbers"><code class="language-scss">
$colors: (
  seagreen: #18bc9c,
  lightblue: #3498db,
  coral: lightcoral,
  brightred: #e74c3c,
  mustard: #f39c12,
  slate: #1e2a36,
  darkgreen: #52BB67
);

@each $name, $value in $colors {
  body {
    &.#{$name} {
      header {
        background: $value;
      }

      h1, h2, h3, h4, h5, h6, p {
        a {
          color: $value;
        }
      }

      .btn-outline:hover, .btn-outline:focus, .btn-outline:active, .btn-outline.active {
        color: $value;
      }

      .pager a {
        background-color: $value;
      }
    }
  }
}
</code></pre>

Awww SNAP! Look at how much code that reduced while giving us the same result! From 150 lines to 34. Now in your head, add up all the reductions 
through the codebase this could save you.

Not only that, it builds a better base to style off of. Instead of look at the same blocks of code per color, we now look at a single declaration and can easily add more overrides in per color added.

To use the latest version of Sass, you can run <code>gem install sass</code> to pull the latest version. Sass should then be available from 
the command line. To compile, simply type:

<pre class="language-bash"><code class="language-bash">
sass path/to/your.scss path/to/output.css
</code></pre>

This is fun stuff. Simple changes, a lot of power, awesome results.