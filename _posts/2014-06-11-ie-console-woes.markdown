---
layout: post
title: Internet Explorer console.log Woes
subtitle: Don't let this crappy browser get you down.
date:   2014-06-11 14:00:00
category: ie
tags: [javascript]
body-color: mustard
published: true
---

There really aren't many platforms or technologies out there that a developer dreads more than Internet Explorer. Nothing out there has caused more wasted hours on a project
than possibly [reddit](http://reddit.com) or an aging Windows installation.

We all know the deal. Internet Explorer chooses to interpret CSS/JS in the way it sees fit and typically winds up behaving different than any other browser out there. This is not
a good thing, by the way - but the IE team thinks it is. Things have gotten better since version 8, but, I say that in a subjective manner. IE issues can
cause baldness - this I believe.

The most common problem that bites people in the ass is one that seems fairly innocuous and is always overlooked in the course of debugging - since itself is a tool *used for debugging*.

<pre class="language-markup"><code class="language-javascript">
console.log(foo);
</code></pre>

Yes, little ol <code>console.log();</code> who just wants to help out when debugging Javascript can cause IE to completely stop processing scripts
on the page. To add to the mystery, if you keep watching your page in IE with devtools open - *you won't notice an issue at all*.

#### EX PLAIINNNNN

Calm down, Dalek. The reason for this is the <code>console</code> object is not instantiated unless devtools is open in IE. Otherwise, you will see
one of two things:

 - Javascript won't execute correctly
 - Console has cryptic errors, such as 'object is undefined' or others of that nature

Nine times out of ten, you have an errant console.log in the code somewhere. This does not affect any browser other than IE. Try it for yourself.

##### How can I tell?

A simple test to see if <code>console</code> is the issue in your sites Javascript is to add this just before your body tag, or, after all your sites
Javascript files have loaded:

<pre class="language-markup"><code class="language-javascript">
if(!window.console) {
  var console = {
    log : function(){},
    warn : function(){},
    error : function(){},
    time : function(){},
    timeEnd : function(){}
  }
}
</code></pre>

Reload that in IE. If your script(s) start magically working - your issue is definitely console methods being used. Don't leave this in though, it certainly
is not a fix by any means. It simply defines an object if it is not yet defined.

The simple fix is commenting it out when you're through using it. Often times, we get so gung-ho about debugging our code that sometimes you cannot
see the forest for the trees. This is one of those instances. The minute you try to debug this, you won't get very far, as the very tool you likely
use to debug scripts is the thing causing the issue!

Now think of all the hairs you could still have if you were not trying to chase Javascript bugs in IE.