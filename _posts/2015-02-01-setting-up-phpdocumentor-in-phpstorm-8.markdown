---
layout: post
title:  "Setting up PHPDocumentor in PHPStorm 8"
subtitle: Keep solid and meticulous code comments - turn it into documentation automatically.
date:   2015-02-01 14:00:00
category: ide
tags:
 - phpstorm
body-color: brightred
excerpt: PHPStorm is a fantastic IDE for PHP. I've been a fan of JetBrains' products for quite some time.
---

PHPStorm is a fantastic IDE for PHP. I've been a fan of JetBrains' products for quite some time. Whether it's RubyMine,
WebStorm, PHPStorm, or PyCharm, their IDEs are one of the most developer friendly tools I have ever come across.

One of my favorite things to assist in my development needs is adding external tools in to support the work I am doing. 
[PHPDocumentor](http://www.phpdoc.org/) is a great tool that can review and parse all of your code and generate navigable code documentation based on the 
code comments that precede functions and methods. This is helpful because you can navigate them faster than code files, and still 
see a swath of relative information. The better you comment your code, the better the documentation will become.

I try to keep my tool(s) project agnostic and workable in any project. Therefore, my requirements for setting up something like 
[PHPDocumentor](http://www.phpdoc.org/) is to install it cleanly and make it available anywhere. While it is possible to install it as a dependency via 
Composer, the advised method is to install it via PEAR. This makes it available system-wide.

Once you have it installed via PEAR, follow the installation guide on the [PHPDocumentor](http://www.phpdoc.org/) website. Now, you can 
hook it up as an external tool for PHPStorm and use it in any project you desire. We also are going to supply a boilerplate configuration file to 
use, so it is configurable on a per project basis.

First, in PHPStorm, open the preferences and go to Tools > External Tools, and click "+" to add a new external tool.

In the prompt, name it 'PHPDocumentor'. The default settings are fine here. At the bottom of the window, under Tool settings, enter the following:

<pre class="language-markup"><code class="language-gherkin">
Program: /usr/bin/php
Parameters: /Users/kevinquillen/pear/bin/phpdoc --config="$ProjectFileDir$/phpdoc.dist.xml"
Working directory: /usr/bin
</code></pre>

I am using the supplied PHP bin path that comes with OSX. If your PHP is located in a different part of the file system, use that instead.

I am also supplying a runtime argument specifying the configuration file to use. PHPStorm will understand that $ProjectFileDir$ is the current project we 
are working on when we want to execute PHPDocumentor.

Save and close the dialog window. You will now see 'PHPDocumentor' as a new available tool when you right click in the IDE and scroll down to 'External Tools'.

Now, we can add a File Template to make it easy to add this configuration file to any project.

In Preferences, go to Editor > File and Code Templates. Click the "+" to add a new template and name it "PHPDoc Configuration". Paste the XML code
below:

#### File Template for phpdoc.dist.xml

<pre class="language-markup"><code class="language-markup">
&lt;?xml version="1.0" encoding="UTF-8" ?&gt;
&lt;phpdoc&gt;
  &lt;title&gt;${PROJECT_NAME}&lt;/title&gt;
  &lt;parser&gt;
    &lt;target&gt;phpdocs/output&lt;/target&gt;
    &lt;extensions&gt;
      &lt;extension&gt;module&lt;/extension&gt;
      &lt;extension&gt;inc&lt;/extension&gt;
      &lt;extension&gt;php&lt;/extension&gt;
    &lt;/extensions&gt;
  &lt;/parser&gt;
  &lt;transformer&gt;
    &lt;target&gt;phpdocs/docs&lt;/target&gt;
  &lt;/transformer&gt;
  &lt;files&gt;
    &lt;ignore&gt;tests/*&lt;/ignore&gt;
    &lt;ignore&gt;Tests/*&lt;/ignore&gt;
  &lt;/files&gt;
&lt;/phpdoc&gt;
</code></pre>

Save and close the dialog window.

Now in your project, right click in the project root, File > New > PHPDoc Configuration. This will supply the configuration template for you, which 
PHPDocumentor will abide by when you execute it. By default, I exclude any 'tests' directory - and for Drupal, I tell PHPDocumentor to parse files with 
module, inc, and php extensions. All documentation generated will reside in the project root under 'phpdocs'.

After generating a set of documentation, you will wind up with [beautiful navigable docs just like this](http://demo.phpdoc.org/Clean/).