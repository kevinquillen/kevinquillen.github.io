---
layout: post
title:  Spiff up your Drupal AJAX interactions.
subtitle: For the users sake, kill throbber.gif.
date:   2014-06-04 14:00:00
category: javascript
body-color: coral
excerpt: There are things I love about Drupal. There are also things I flat out hate about Drupal, too. One of them is the throbber.gif activity indicator. Guys, we can do better. Let's add some shine.
---

Every time I see the throbber.gif appear it pains me, because with some simple changes, we can make the feel of it so much better.

##### Y U NO LIKE POOR LITTLE GIF?

It's not the image used, don't get me wrong. The default UX of displaying AJAX activity just blows. Depending on wherever the form field
or element is that is leveraging an AJAX callback, the activity gif can appear anywhere in the page. The only thing it looks like is a small
spinner image simply appears for no reason then goes away.

How does the user really know what is happening?

##### OK WELL... WHAT CAN WE DO?

One way I recently approached this was taking a step back and looking at the bigger picture. Indicating activity is more than just having
a spinner on the screen somewhere. Short of using a modal overlay blocking input that says "**LOADING LOL PLEASE WAIT**", the UI needs a more effective
and clear presentation for the user.

This is possible through the use of jQuery 1.10 and intercepting events to append our own. If you don't have jQuery 1.10, you can grab the
[jQuery Update](http://drupal.org/project/jquery_update) which will implement this for you.

##### So we're going to use Javascript. I think see where you're going...

Yep. Intercepting AJAX events.

Unfortunately, it is not easy to catch at a generic level what element triggered the AJAX event. So, what I did in a recent project was grab
the trigger element with <code>ajaxSend</code>, which is aware of what was clicked.

For the application I built, there is a property booking form that lets the user select from an optional list of amenities they can add on to their room.
Each one carries an additional charge. So, when one is checked, I wanted to update the table to show the charge was activated, and update other
applicable cells too in a meaningful way. The first thing I saw when I hit a checkbox was that dreaded throbber appearing way down the page
where it doesn't belong. Grr.

First thing you will want to do to eliminate this issue is style the throbber container to <code>display: none;</code> - and in your custom form,
set the <code>#ajax</code> array to have <code>'progress' => 'none'</code>. The first will hide it from sight, and the second will tell
Drupal AJAX callbacks not to inject the throbber. Now we know it's not going to appear at all. Good.

The second part of this is adding the Javascript magic. For me, I created a JS file in my module and attached it to the form. From there, it was just
a few short jumps to getting to a better user experience.

<pre class="language-markup"><code class="language-javascript">
(function($) {
  $(document).ajaxSend(function(e, xhr, settings){
    var trigger = settings.extraData._triggering_element_name;
    var parent = $('input[name="' + trigger + '"]').closest('tr').attr('id');
    $('#' + parent + ' td.subtotal').fadeTo('150', '.5');
    settings.extraData.parentElement = parent;
  }).ajaxComplete(function(e, xhr, settings) {
    $('#' + settings.extraData.parentElement + ' td.subtotal').fadeTo('150', '1');
  });
})(jQuery);
</code></pre>

When AJAX fires, it grabs the input (checkbox) that was checked, and the table row it resides in (that has been themed to have a unique ID).

It then fades that table row while AJAX activity is happening. So, until the AJAX completes, the table row is faded and the row is blocked. <code>ajaxComplete</code>
is called when AJAX is done, and there, we grab our custom setting that contains our parent ID, and fade the subtotal cell back to 1 (100% visible).

So now, checking the boxes animates any affected rows, and in my PHP callback I have additional AJAX commands that change prices in activated rows to
green to convey that they are added to the total - when unchecked, they are set back to black.

Now, you may notice that I am being very loose in my selectors and that if this script was on every page, it would be doing this any time
AJAX is happening. You would be right. However I am only using this script on one specific form in the application.

Otherwise, I would have more checks and conditions to know that I am working on the correct form. If I wanted to add on more here, I certainly
could. All you would need to do is track your selectors in the settings, so you can set the animations or other effects that you want.

**Posted on: {{ page.date | date: "%B %-d, %Y" }}**