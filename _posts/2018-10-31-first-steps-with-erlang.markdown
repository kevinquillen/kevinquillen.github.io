---
layout: post
title: First Steps with Erlang
date: 2018-10-31 12:00:00
category: erlang
tags:
 - functional programming
 - elixir
image: /assets/images/code-3.jpg
---

I have done a lot of research this year on what I believe will be some of the next great generation of tools and languages. I strongly believe PHP is on a fantastic road with 7.x, but there is another language that has been on my radar for quite some time, Elixir. Elixir is based on Erlang and has been deployed in many production level apps, some of them you have probably heard of.

Before I jump into that, I first wanted to learn a bit about Erlang for foundational knowledge.

I first heard of Erlang in 2010 when some startups were posting about how some of their tools and infrastructure was based on it. Some of these companies were very large. At the time, the documentation was very lacking and the existing examples were hard to understand, from a cognitive and readability standpoint. But I never forgot about it.

Earlier this month I picked up the "Introducing Erlang" book by O'Reilly. It's fantastic. I have everything set up and running, did some of the examples in the shell, and then wanted to take something I have built and port it to Erlang.

As mentioned in the <a href="/drupal/2018/10/29/adding-tests-to-legacy-drupal-7-sites">previous post</a>, I launched new features to a site this month. One of the modules had a function that took input, checked it against a list, and returned the value if found or "purple" otherwise.

Here are the two functions in PHP:

<pre class="language-php"><code class="language-php">
define('DEFAULT_COLOR', 'purple');

/**
 * This is a validator that checks that the passed string is a valid color.
 *
 * @param string $color
 * @return bool
 */
function datacenter_api_validate_color(string $color) : bool {
  $approved_colors = [
    'purple',
    'green',
    'red',
    'orange',
    'blue',
    'grey',
    'yellow'
  ];

  return in_array(drupal_strtolower($color), $approved_colors);
}

/**
 * This returns the passed color if valid, the global default otherwise.
 *
 * Use this function in custom code when dealing with setting viz colors.
 *
 * @param string $color
 * @return string
 */
function datacenter_api_get_color(string $color) : string {
  return (datacenter_api_validate_color($color)) ? $color : DEFAULT_COLOR;
}
</code></pre>

Here it is in Erlang:

<pre class="language-ruby"><code class="language-ruby">
-module(color).
-export([get/1]).

-define (DefaultColor, "purple").
-define (Approved, ["purple", "green", "blue", "yellow", "grey", "red"]).

get(Color) ->
  X = string:lowercase(Color),
    case lists:member(X, ?Approved) of
      true -> X;
      false -> ?DefaultColor
    end.
</code></pre>

This creates a module called `color` that has one function, `get/1`. It provides the same exact functionality as the PHP code:

<pre class="language-bash"><code class="language-bash">
color:get("geen")
> "purple"
color:get("GREEN")
> "green"
color:get("blue")
> "blue"
color:get("    ")
> "purple"
</code></pre>

I didn't convert the unit tests first or anything like that, as these are just my first steps. Its a very different world and causing me to think in a very different way, which isn't a bad thing. I'm still learning about how to define constants and data types like tuples and lists, but I like what I see so far and look forward to learning more.
