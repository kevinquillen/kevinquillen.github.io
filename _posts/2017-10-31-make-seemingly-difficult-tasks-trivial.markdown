---
layout: post
title: Make Seemingly Difficult Tasks Trivial
date: 2017-10-31 12:00:00
category: scripting
tags:
 - shell
 - zsh
image: /assets/images/code-3.jpg
---

Earlier today there was a ping in Slack for assistance. A coworker needed to update 140 XML files with a new element, and the element value will be populated from an existing element in the node.

For most people, they hear the number "140" and think wow, this will take a while. But the number of documents here isn't the issue, we just need to solve the problem once and apply it everywhere.

My mind quickly jumped to a shell script and some sort of <code>sed</code> magic. Before I opened up Vim, I jotted down what path I needed:

1. loop files in dir
2. find xml node
3. get text value attribute of node
4. append new node with copied value as its value

Once I took a look at 2-4, I figured <code>sed</code> is probably not the best tool here. One small Google search brought me to <a href="http://xmlstar.sourceforge.net/" target="_blank">xmlstarlet</a>.

It doesn't say this on the xmlstarlet site, but for macOS users you can use Homebrew to install it:

<pre class="language-bash"><code class="language-bash">
brew install xmlstarlet
</code></pre> 

The syntax and arguments for xmlstarlet are a little vague, but with my tasks outlined I knew what I was looking to do in general.

I fetched a dummy XML file online with made up data, and put it into a new directory. I then generated 140 files with <code>tee</code>:

<pre class="language-bash"><code class="language-bash">
tee xmltest-{1..140}.xml < xmltest-original.xml >/dev/null
</code></pre>

With our test data ready, I could start tackling the problem at hand. The actual script part was not so bad, I had to look up how to get xmlstarlet to do what I wanted. But it made traversing, selecting, and appending xml _so easy_. I wound up with a working script in about 10 minutes:

<pre class="language-bash"><code class="language-bash">
#!/bin/bash

set -e
shopt -s nullglob

for file in *.xml
do
  SETTING_VALUE=`xmlstarlet sel -t -m "/dataset/record" -v ip_address $file`;
  echo "Appending $SETTING_VALUE as new_ip_address in $file";
  xmlstarlet ed -L -s "/dataset/record" -t elem -n new_ip_address -v "$SETTING_VALUE" $file;
done
</code></pre>

This looks for an existing node called `<ip_address>`, gets the text value, and inserts a new element called `<new_ip_address>` with that value. The result in all 140 test files looked like this:

<pre class="language-xml"><code class="language-xml">
&lt;dataset&gt;
  &lt;record&gt;
    &lt;id&gt;1&lt;/id&gt;
    &lt;first_name&gt;Ambrosius&lt;/first_name&gt;
    &lt;last_name&gt;Alwin&lt;/last_name&gt;
    &lt;email&gt;aalwin0@vk.com&lt;/email&gt;
    &lt;gender&gt;Male&lt;/gender&gt;
    &lt;ip_address&gt;166.77.108.157&lt;/ip_address&gt;
    &lt;new_ip_address&gt;166.77.108.157&lt;/new_ip_address&gt;
  &lt;/record&gt;
&lt;/dataset&gt;
</code></pre>

Exciting stuff. I think I have some XML file tasks coming up for a new project we are working on, so I will keep xmlstarlet in mind as a useful tool depending on what we need to do.
