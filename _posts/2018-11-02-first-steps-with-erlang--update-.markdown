---
layout: post
title: First Steps with Erlang (Update)
date: 2018-11-02 12:00:00
category: erlang
tags:
 - testing
image: /assets/images/code-1.jpg
---

Shortly after publishing my last post about Erlang, I noticed a bug in the code which would not have happened if I wrote unit test(s) first. I did not do that simply because I just started learning, and didn't want too many barriers up front to getting started (its hard to write tests when you are learning new syntax and methodology).

Yet when I saw the bug, I couldn't let that slide, as here again is another reinforcement of having tests. So I opened the project back up, pretended I have no awareness of the bug, and went from there.

After some quick reading of the docs, I created an EUnit test file and started filling in what I should expect:

<pre class="language-ruby"><code class="language-ruby">
-module(color_test).
-author("kevinquillen").
-include_lib("eunit/include/eunit.hrl").

simple_test() ->
  ?assertEqual(color:get(""), "purple"),
  ?assertEqual(color:get("vrefn"), "purple"),
  ?assertEqual(color:get("GrEeN"), "green"),
  ?assertEqual(color:get("PURPLE"), "purple"),
  ?assertEqual(color:get("OrAnge"), "orange"),
  ?assertEqual(color:get("BlUe"), "blue"),
  ?assertEqual(color:get("yellow"), "yellow"),
  ?assertEqual(color:get("grey"), "grey"),
  ?assertEqual(color:get("red"), "red"),
  ?assertNotEqual(color:get("BLACK"), "black"),
  ?assertNotEqual(color:get("OrAnge"), "OrAnge"),
  ?assertNotEqual(color:get("orange "), "orange").
</code></pre>

Upon running this test, it would have told me I forgot to include an approved color, orange:

<pre class="language-none"><code class="language-none">
> color_test:simple_test().
** exception error: {assertEqual,[{module,color_test},
                                  {line,10},
                                  {expression,"\"orange\""},
                                  {expected,"purple"},
                                  {value,"orange"}]}
     in function  color_test:'-simple_test/0-fun-4-'/0 (color_test.erl, line 10)
     in call from color_test:simple_test/0 (color_test.erl, line 10)
</code></pre>

Whoops! A quick update to the module and re-running the test results in:

<pre class="language-none"><code class="language-none">
> color_test:simple_test().
ok
</code></pre>

Lesson learned. Although I am not sure why my function has to be called `simple_test` else it won't be recognized.. I am sure I will find out as I go along.

I <a href="https://github.com/kevinquillen/color">added my code on GitHub</a> for reference.