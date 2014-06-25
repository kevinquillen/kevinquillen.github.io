---
layout: post
title: Web scraping magic with Ruby and Nokogiri
subtitle: Get shit done so you can have a beer.
date:   2014-06-23 14:00:00
category: programming
tags: ruby, drupal
body-color: brightred
excerpt: Every now and then you're going to have one of those projects that will need to be migrated from one platform to another. Occasionally you will have to migrate a static site into a dynamic site. Don't panic. Don't hire a dozen interns to do the grunt work. With Ruby, we can quickly create intelligent scripts to scrape the static files and generate a CSV datasource for us to use.
published: true
---

Every now and then you're going to have one of those projects that will need to be migrated from one platform to another. If you're lucky, it's a system like Drupal that has an excellent [Migration 
framework](https://www.drupal.org/project/migrate). I've migrated lots of sites from the small to the very large, such as this one with [1 million+ records, over a decades worth](http://www.sportsatthebeach.com).

Furthermore, if the legacy datasource is the same as your new datasource, boy - you're probably cracking that beer open right now and grinning. But you won't always have that luxury. Even if the source turns out to be something like 
MSSQL, sqlite, or Oracle, [dbConvert](http://dbconvert.com/convert-mssql-to-mysql-pro.php) has excellent products for converting it to the format of choice. So, that's just a small hurdle where a majority of _that work_ is just paying 
for the license, hooking up your mapping, and exporting the new datasource.

Occasionally though, you will have to migrate a static site into a dynamic site. Don't panic. Don't hire a dozen interns to do the grunt work. With Ruby, we can quickly create intelligent scripts to scrape the static files and generate a 
CSV datasource for us to use.

##### But why can't I just do this manually?

Have you ran the numbers? Is it a site with 10 pages, or 10000? It's a trick question, because it doesn't matter the size. These tools are reusable, for one. For two, you don't want one or more resources dedicated to doing tedious grunt work that 
has to be repeated multiple times (as content is updated, or bugs are found). The hours will add up *really* fast.

The beauty of the Migrate framework is that using a CSV is perfectly valid as a datasource for migrating into Drupal. So, just because the site you are migrating from is static doesn't mean it will be a huge problem.

Ruby can be used as pure web scrapin' muscle to get this done quick.

#### What you'll need

- Ruby 1.9.3 or higher
- RubyGems
- Nokogiri, CSV, Sanitize, and Find gems
- Some working knowledge of the Ruby language, mostly strings, methods and substitutions

##### Errmerrgerrdd I don't have Ruby installed

Can't help you there... it can be a pain in the ass to get installed, I admit. Your best bet is to install [RVM](https://rvm.io/rvm/install) to download the version of Ruby you want.

If you have OSX Mountain Lion or higher, you probably have a version of Ruby already installed (albeit most likely 1.8.x which may not be high enough). 

Alternatively, you can try [JeweleryBox](https://jewelrybox.unfiniti.com/) to install Ruby. I know, it shouldn't be hard to install a language but for some reason there are lots of hoops to jump through.

##### Okay, let's get Ruby to kick some ass then

If you don't have the required gems, getting them is easy. For the uninitiated, hop into terminal:

<pre class="language-markup"><code class="language-bash">
gem install nokogiri
gem install csv
gem install find
gem install sanitize
</code></pre>

Essentially what we are going to do is tell Ruby to crawl the files in the site and generate a CSV inventory of content that we want to migrate. This requires having a copy of the site locally, either FTP or whatever means you have at your disposal. You can 
also remotely crawl a site, but that has two caveats:

- You may not be able to see all the URLs you need to crawl
- All the crawling can bring cheaper hosting to a halt
- Local crawling can be infinitely faster

Right. So, let's say we have a generic site of HTML files. It's an old school static site where every .html file has the header and footer in it, and main navigation. Our task is to pull out all of the posts in the <code>/blog</code> folder. However, we do not want 
to crawl and save the posts in the <code>old</code>, <code>draft</code> or <code>archive</code> folders within the <code>blog</code> folder. Also, we only want to crawl <code>.html</code> files, and nothing else.

In your text editor of choice, start a new file in the root of the directory to crawl. Name the file <code>scrape.rb</code>. It will be executable by Ruby at the command line. Ruby will interpret it line by line, so the order in which things appear is critical. If 
you reference a function within the script, that function has to be defined before it is called, similar to Javascript.

At the top, we need to declare what gems we need first.

<pre class="language-markup"><code class="language-ruby">
# include required gems
require 'find'
require 'rubygems'
require 'nokogiri'
require 'sanitize'
require 'csv'
</code></pre>

Speaking for myself, I like to create some global variables to echo back to me while the script is working:

<pre class="language-markup"><code class="language-ruby">
# set up some global variables
$count = 0
$posts = Array.new
$base_path = "{FULL PATH TO SCRIPT LOCATION ON YOUR MACHINE}"
</code></pre>

Now, if you've done this sort of thing before, you know that one of the major time killers is bad symbols or characters in content. I really strive to dump them all before they are migrated in, so we aren't poisoning the well. The ones I hate the most are MS Word 
characters, and this takes care of smart quotes, MS Word apostrophes and the like. <code>[gsub](http://www.ruby-doc.org/core-2.1.2/String.html#method-i-gsub-20)</code> is dang powerful.

<pre class="language-markup"><code class="language-ruby">
# generic function to replace MS word smart quotes and apostrophes
def strip_bad_chars(text)
  text.gsub!(/"/, "'");
  text.gsub!(/\u2018/, "'");
  text.gsub!(/[”“]/, '"');
  text.gsub!(/’/, "'");
  return text
end
</code></pre>

This is a utility function I use to clean any string that could be bad. Body content however, needs a little more special care. Here, I am replacing newlines with break tags, multiple whitespaces with a single space, and stripping any potentially harmful 
attributes from html tags. Sanitize allows us to specify what we allow as it processes the string, stripping down anything that is considered undesirable.

<pre class="language-markup"><code class="language-ruby">
def clean_body(text)
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
  return text
end
</code></pre>

Now we're ready to cook. Using the <code>Nokogiri</code> gem, we can cherry pick parts of the file out similar to say, jQuery selecting DOM elements. This is a very powerful gem that gives us a lot of room to operate in very little code.

<pre class="language-markup"><code class="language-ruby">
# this is the main logic that recursively searches from the current directory down, and parses the HTML files.
def parse_html_files
  Find.find(Dir.getwd) do |file|
    if !File.directory? file and File.extname(file) == '.html'
      # exclude and skip if in a bad directory
      # we may be on an html file, but some we just do not want
      current = File.new(file).path
      
      # stick to just the blog folder
      if not current.match(/(blog)/)
        next
      end
      
      # however, skip these folders entirely
      if current.match(/(old|draft|archive)/)
        next
      end

      # open file, pluck content out by its element(s)
      page = Nokogiri::HTML(open(file));

      # grab title
      title = page.css('title').text.to_s;
      title = strip_bad_chars(title)
      
      # for page title, destroy any pipes and MS pipes and return the first match
      title.gsub!(/[│,|],{0,}(.*)+/, '')

      # grab the body content
      body = page.css('section article').to_html
      body = clean_body(body)

      # clean the file path
      path = File.new(file).path
      path.gsub! $base_path, "/"
      
      # if we have content, add this as a page to our page array
      if (body.length > 0)
        $count += 1
        puts "Processing " + title

        # insert into array
        data = {
          'path' => path,
          'title' => title,
          'body' => body,
        }

        $posts.push data
      end
    end
  end

  write_csv($posts)
  report($count)
end
</code></pre>

It looks like there is a lot happening here, but there really isn't much to it. Ruby will recursively look at every file from the current directory down. If the file is not an html file, it is skipped. If it is not in the blog folder, it is skipped. If it is in 
blog/old, blog/draft, or blog/archive, it is skipped. That leaves us with just the files in the blog directory, the actual live posts, which is what we are after. From here, Nokogiri's <code>.css</code> method lets us pick out the elements we need to comprise 
basic content structure. I also format it further with <code>text</code> or <code>to_html</code> string methods.

For 301's, the path variable at the end returns the static file path, the same way it would appear in the URL. So if the file was at <code>/path/on/your/machine/site/blog/my-first-post.html</code>, the path variable 
would be <code>/blog/my-first-post.html</code> - which is more than likely located at <code>http://www.yoursite.com/blog/first-post.html</code>. We can use these paths to create 301 redirects easily in Drupal or whatever the receiving platform may be.

Now we save our results to a CSV file. With the CSV gem, this is a very simple procedure.

<pre class="language-markup"><code class="language-ruby">
# This creates a CSV file from the posts array created above
def write_csv(posts)
  CSV.open('posts.csv', 'w' ) do |writer|
    writer &lt;&lt; ["path", "title", "body"]
    $posts.each do |c|
      writer &lt;&lt; [c['path'], c['title'], c['body']]
    end
  end
end
</code></pre>

Finally, a simple function to echo the result to you:

<pre class="language-markup"><code class="language-ruby">
# echo to the console how many posts were written to the CSV file.
def report(count)
  puts "#{$count} html posts were processed to #{Dir.getwd}/posts.csv"
end
</code></pre>

We also need to trigger the script when Ruby executes it:

<pre class="language-markup"><code class="language-ruby">
# trigger everything
parse_html_files
</code></pre>

Voila! So, altogehter, here's what we have in our <code>scrape.rb</code> file:

<pre class="language-markup"><code class="language-ruby">
# include required gems
require 'find'
require 'rubygems'
require 'nokogiri'
require 'sanitize'
require 'csv'

# set up some global variables
$count = 0
$posts = Array.new
$base_path = "{FULL PATH TO SCRIPT LOCATION ON YOUR MACHINE}"

# generic function to replace MS word smart quotes and apostrophes
def strip_bad_chars(text)
  text.gsub!(/"/, "'");
  text.gsub!(/\u2018/, "'");
  text.gsub!(/[”“]/, '"');
  text.gsub!(/’/, "'");
  return text
end

# extra muscle for body content cleaning
def clean_body(text)
  text = strip_bad_chars(text)
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
  return text
end

# this is the main logic that recursively searches from the current directory down, and parses the HTML files.
def parse_html_files
  Find.find(Dir.getwd) do |file|
    if !File.directory? file and File.extname(file) == '.html'
      # exclude and skip if in a bad directory
      # we may be on an html file, but some we just do not want
      current = File.new(file).path
      
      # stick to just the blog folder
      if not current.match(/(blog)/)
        next
      end
      
      # however, skip these folders entirely
      if current.match(/(old|draft|archive)/)
        next
      end

      # open file, pluck content out by its element(s)
      page = Nokogiri::HTML(open(file));

      # grab title
      title = page.css('title').text.to_s;
      title = strip_bad_chars(title)
      
      # for page title, destroy any pipes and MS pipes and return the first match
      title.gsub!(/[│,|],{0,}(.*)+/, '')

      # grab the body content
      body = page.css('section article').to_html
      body = clean_body(body)

      # clean the file path
      path = File.new(file).path
      path.gsub! $base_path, "/"
      
      # if we have content, add this as a page to our page array
      if (body.length > 0)
        $count += 1
        puts "Processing " + title

        # insert into array
        data = {
          'path' => path,
          'title' => title,
          'body' => body,
        }

        $posts.push data
      end
    end
  end

  write_csv($posts)
  report($count)
end

# This creates a CSV file from the $posts array created above
def write_csv(posts)
  CSV.open('posts.csv', 'w' ) do |writer|
    writer &lt;&lt; ["path", "title", "body"]
    $posts.each do |c|
      writer &lt;&lt; [c['path'], c['title'], c['body']]
    end
  end
end

# echo to the console how many posts were written to the CSV file.
def report(count)
  puts "#{$count} html posts were processed to #{Dir.getwd}/posts.csv"
end

# trigger everything
parse_html_files
</code></pre>

#### Here we are

At this point, you would have a CSV file full of content to move with a simple pattern to apply to picking content out from whatever directories need to be transitioned. The script could be improved, but it was a quick and dirty script written in under an hour 
to get years of content moved over without a lot of manual effort.

In the end, the result feels awesome, and beer-worthy too. So crack one open and revel in the power of Ruby and Nokogiri for web scraping.