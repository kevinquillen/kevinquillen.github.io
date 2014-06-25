---
layout: post
title:  "More scraping magic with Ruby: UTF-8 and XPath"
subtitle: Slice and dice content in high gear
date:   2014-06-26 14:00:00
category: programming
tags: ruby, drupal
body-color: darkgreen
excerpt: In Nokogiri, the <code>css</code> method is simple, straightforward, and familiar if you have a background in jQuery. But, if you have multiple elements on the page to select, suddenly that method is lacking in power. We need to be able to select multiples of anything, anywhere in the DOM. This is where <code>XPath</code> comes in, and is much more efficient than the <code>css</code> selector.
published: false
---

What? Thought we were done? There are still things left to learn here. There are always things to learn.

In Nokogiri, the <code>css</code> method is simple, straightforward, and familiar if you have a background in jQuery. But, if you have multiple elements on the page to select, suddenly that method is lacking in power.
We need to be able to select multiples of anything, anywhere in the DOM. This is where <code>XPath</code> comes in, and is much more efficient than the <code>css</code> selector.

This time, we also have more pesky non UTF-8 characters floating around causing us trouble. Taking the skills we had from the previous post, let's break it down and get XPath to do a lot of the heavy lifting.

Assume we need to migrate a static page of testimonials, and there are a couple dozen similar pages with testimonials we need to migrate too. These were copied and pasted in with MS Word and other editors, resulting in bad character
encoding. On the upside, each testimonial was wrapped in the same HTML markup that we can easily target. Here is an example:

<pre class="language-markup"><code class="language-markup">
&lt;li class="clearfix"&gt;
    &lt;header&gt;
        &lt;h2 class="resident_name">Test User&lt;/h2&gt;
        &lt;h3 class="resident_comm">Charlestown Resident&lt;/h3&gt;
        &lt;a class="popVideo" href="http://player.vimeo.com/video"&gt;
        &lt;img src="/images/testimonials/Test-User.jpg" alt="Test User"/&gt;
    &lt;/header&gt;
    &lt;section class="clearfix"&gt;
    &lt;p>You always have the freedom to drive anywhere you want to and keep up with the clubs that you’ve kept up with before."&lt;/p&gt;
    &lt;a class="testimonialLink popVideo" href="http://player.vimeo.com/video">Watch the video&lt;/a&gt;
    &lt;/section&gt;
&lt;/li&gt;
</code></pre>

Not bad. It certainly helps that the li has a class on it. No matter how many there are in each file, we can pick them out easily. This time, we are going to use XPath. XPath will let us use a DOM selector that matches all nodes against the criteria, with some
cool tricks in between.

All we need to do is, like before, recursively parse our directory for testimonials, get all of them on the page, and put them into an array for CSV exporting.

<pre class="language-markup"><code class="language-ruby">
# this is the main logic that recursively searches from the current directory down, and parses the ASP files.
def parse_asp_files
  Find.find(Dir.getwd) do |file|
    if !File.directory? file and File.extname(file) == '.asp'
      # exclude and skip if in a bad directory
      # we may be on an asp file, but some we just do not want
      current = File.new(file).path

      if not current.match(/(testimonial)/)
        next
      end

      # open file, pluck content out by its element(s)
      page = Nokogiri::HTML(open(file), nil, 'utf-8');

      page.xpath('//li[\@class="clearfix"]').map do |item|
        title = item.at_xpath('.//h2').text.strip
        video = item.at_xpath('.//a[\@class="popVideo"]')['href']
        tagline = item.at_xpath('.//section/p').text.strip
        image = item.at_xpath('.//img')['src']

        $count += 1
        puts "Processing " + tagline

        # insert into array
        data = {
          'key' => $count,
          'title' => title,
          'video' => video,
          'image' => image,
          'tagline' => tagline,
        }

        $pages.push data
      end
    end
  end

  write_csv($pages)
  report($count)
end
</code></pre>

Nothing to it! You may notice there is a numeric key field added this time. If you are doing additional data massaging in [Google Sheets, you can maintain lookup tables in a new spreadsheet](https://support.google.com/docs/answer/3256570?hl=en) so you can adjust data or add more, while locking the source
data rows. This is handy when you may have to replace the original CSV multiple times as you get the export correct.

So what's occurring?

<pre class="language-markup"><code class="language-ruby">
page.xpath('//li[@class="clearfix"]').map do |item|
</code></pre>

This says, hey Nokogiri, for the page object, return all list items with a class of 'clearfix' on them - and lets [map and iterate](http://www.ruby-doc.org/core-2.1.2/Array.html) over them.

<pre class="language-markup"><code class="language-ruby">
title = item.at_xpath('.//h2').text.strip
video = item.at_xpath('.//a[@class="popVideo"]')['href']
tagline = item.at_xpath('.//section/p').text.strip
image = item.at_xpath('.//img')['src']
</code></pre>

Once we are inside the loop, <code>item</code> is the current list item we are working with. We can then use local xpath expressions with Nokogiri's <code>[at_xpath](http://nokogiri.org/Nokogiri/XML/Node.html#method-i-at_xpath)</code> method - the <code>.//</code> selector tells XPath to look at the current level down, whereas just <code>//</code> would
search the entire document (and produce incorrect results).

For some elements, we don't want their raw text value. For instance, the video link, we just want to preserve the Vimeo URL. You can dereference the attribute with the XPath selector inline <code>item.at_xpath('.//a[@class="popVideo"]')['href']</code>, so we only
retain the URL value.

##### OYYY I HAVE CRAPPY SYMBOLS AND CHARACTERS IN MY TEXT THOUGH!

Yeah. On occasion, non standard characters will worm their way through your best filtering defenses. If you notice, I threw two extra arguments on to the Nokogiri::HTML constructor. <code>utf-8</code> tells Nokogiri to parse the document as UTF-8 encoding.

After that, you can do some extra text filtering like so:

<pre class="language-markup"><code class="language-ruby">
def clean_text(text)
  text.gsub!(/(\r)?\n/, "<br />");
  text.gsub!(/\s+/, ' ');

  # extra muscle, clean up crappy HTML tags and specify what attributes are allowed
  text = Sanitize.clean(text, :elements => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'b', 'strong', 'em', 'img', 'iframe'],
      :attributes => {
        'a' => ['href', 'title', 'name'],
        'img' => ['src', 'title', 'alt'],
        'iframe' => ['src', 'url', 'class', 'id', 'width', 'height', 'name'],
        },
      :protocols => {
        'a' => {
          'href' => ['http', 'https', 'mailto']
        },
        'iframe' => {
          'src' => ['http', 'https']
        }
      })

  # clean start and end whitespace
  text = text.strip;

  fallback = {
    'Š'=>'S', 'š'=>'s', 'Ð'=>'Dj','Ž'=>'Z', 'ž'=>'z', 'À'=>'A', 'Á'=>'A', 'Â'=>'A', 'Ã'=>'A', 'Ä'=>'A',
    'Å'=>'A', 'Æ'=>'A', 'Ç'=>'C', 'È'=>'E', 'É'=>'E', 'Ê'=>'E', 'Ë'=>'E', 'Ì'=>'I', 'Í'=>'I', 'Î'=>'I',
    'Ï'=>'I', 'Ñ'=>'N', 'Ò'=>'O', 'Ó'=>'O', 'Ô'=>'O', 'Õ'=>'O', 'Ö'=>'O', 'Ø'=>'O', 'Ù'=>'U', 'Ú'=>'U',
    'Û'=>'U', 'Ü'=>'U', 'Ý'=>'Y', 'Þ'=>'B', 'ß'=>'Ss','à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a',
    'å'=>'a', 'æ'=>'a', 'ç'=>'c', 'è'=>'e', 'é'=>'e', 'ê'=>'e', 'ë'=>'e', 'ì'=>'i', 'í'=>'i', 'î'=>'i',
    'ï'=>'i', 'ð'=>'o', 'ñ'=>'n', 'ò'=>'o', 'ó'=>'o', 'ô'=>'o', 'õ'=>'o', 'ö'=>'o', 'ø'=>'o', 'ù'=>'u',
    'ú'=>'u', 'û'=>'u', 'ý'=>'y', 'ý'=>'y', 'þ'=>'b', 'ÿ'=>'y', 'ƒ'=>'f', '’' => '', '…' => '...', '”" => '"',
    '“' => '"', '—' => '-'
  }

  return text.encode('utf-8', :fallback => fallback)
end
</code></pre>

An improvement from before - <code>clean_text</code> has a fallback table of characters to replace if not found.