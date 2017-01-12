---
layout: post
title: Simple Functions & Snippets
date: 2017-01-12 12:00:00
category: zsh
tags:
 - vim
 - snippets
image: /assets/images/code-1.jpg
---

So part of what I want to do this year is write a bit more, and start making more use out of zsh/terminal. While I do have a few books on the subject to help me get 
a deeper grasp on what is possible, I figured an easy way to start would be to think of common problems I have and apply solutions for it.

When it comes to writing, one of the things that annoys me is that the Jekyll filenames have to be named as Y-m-d-(title).markdown format. 

Sounds easy until you have a couple of ideas, or you are typing too fast, or simply not paying attention and get a typo in the date or title. When that happens, your post 
isn't visible on the site because it's likely buried at the bottom or just not parsed.

So I set out to create a function that doesn't waste any time or require any thought from me other than a title.

#### In .zshrc

<pre class="language-bash">
<code class="language-bash">
function new_post() {
  cd ~/Sites/kevinquillen.com/_posts
  today=$(date +"%F")
  title=$1:l
  clean_title=${title//[^a-zA-Z0-9]/-}
  filename="$today-$clean_title.markdown"

  if [[ ! -a ./$filename ]]; then
    vim $filename -c 'w'
  else
    echo "File $filename already exists. Aborting."
  fi
}
</code></pre>

It takes todays date (Y-m-d), and the first argument (which is the post title), and creates the markdown file if it does not already exist (don't want to accidentally overwrite an existing file!). Otherwise it does nothing if the post exists, so I don't clobber content I may have started and forgot about. Then, it pops open Vim so I can start writing ASAP and autosaves the file.

Second, adding post headers and code blocks for prism in a markdown post can get tedious. There is a plugin for Vim called <a href="https://github.com/SirVer/ultisnips">UltiSnips</a>, so I read some of the documentation and created two snippets to make this easier. 

#### From markdown.snippets

<pre class="language-yaml"><code class="language-yaml">
snippet post_header "Insert a post header for a Jekyll post." b
---
layout: post
title: TITLE
subtitle: SUBTITLE
date: `date +%Y-%m-%d` 12:00:00
category: CATEGORY
tags:
 - TAG
image: /assets/images/code-3.jpg
---
endsnippet
</code></pre>

<pre class="language-bash"><code class="language-bash">
snippet codeblock "Insert a block of code highlighted by prism.js" b
&lt;pre class="language-LANG"&gt;&lt;code class="language-LANG"&gt;
	// write code here
&lt;/code&gt;&lt;/pre&gt;
endsnippet
</code></pre>

Now when I am editing a markdown file and type `post_header<tab>`, a boilerplate header is injected for me. Same for `codeblock<tab>`.
