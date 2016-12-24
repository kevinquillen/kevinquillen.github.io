---
layout: post
title:  Tmux, Vim, Zsh, oh my (zsh)!
subtitle: Yeah, terrible. Terrible pun. Booooo.
date:   2016-12-24 12:00:00
category: productivity
body-color: brightred
tags:
 - zsh
 - shell
 - vim
 - tmux
image: /assets/images/tmux.jpg
---

I decided to give myself a little challenge at the end of this year.

After Thanksgiving I decided I wanted to try something different for a change and start getting better acquainted with the shell, throw my hat in the air and start learning Vim.

Not interested in lengthy discussions over whats better, I simply chose Vim instead of Emacs because I wanted to start somewhere, and I have lightly used Vi and Nano over the years so it is a little familiar.

I began by evaluating what I am currently using for command line. I had a simple setup of iTerm2, a theme, and some aliases. I set fish and oh my fish on top earlier in the year after seeing Jesus Manuel Olivias' blog post about his workflow.

It was pretty nice, but I started running into compatibility issues with fish and other things I was using. The only other shell I knew of was zsh, so I started there.

<code>brew install zsh</code>

Nothing to it.

To be honest, setting up zsh was pretty straightforward and easy, and most of my settings did migrate. I had to tweak some of the custom shell functions I had stored to work, and the same Agnoster theme exists for zsh as well as a tool called <a href="https://github.com/robbyrussell/oh-my-zsh" target="_blank">oh my zsh</a>.

I then went ahead and added zsh-autosuggestions plugin to zsh, and created a global histfile in my home directory. It's a really nice addition and saves time, though some may argue for keeping project specific histfiles and I would agree. For now, it serves me just fine.

The second thing I wanted to do was to default to zsh anytime I opened Terminal or iTerm2. So then I learned a new command, <a href="https://linux.die.net/man/1/chsh" target="_blank">chsh</a>.

<code>chsh</code> lets you change the default user shell.

<code>chsh -s</code> and then follow the prompts to set zsh. Or as a shortcut, you can do:

<code>chsh -s $(which zsh)</code>. This is preferred, as <code>which zsh</code> will return the path to zsh. 

Now anytime I open command line, it will default to zsh instead of bash. If you are using an IDE like PHPStorm, you can also set its configuration to use zsh in its terminal pane instead of bash.

Next, I wanted to bolt on a tool I had heard about over the years but never looked into called tmux. Tmux is short for 'terminal multiplexer'. Among some of the things it can do is split your terminal window into panes, virtual windows, and saved sessions. These features only scratch the surface.

In fact, its easier to understand what tmux is and what its strengths are by simply using it.

<code>brew install tmux</code>

I also highly recommend watching this set of videos on tmux because it makes it really clear why you would want to install and utilize it.

<iframe width="700" height="394" src="https://www.youtube.com/embed/BHhA_ZKjyxo" frameborder="0" allowfullscreen></iframe>

Now, we have a pretty good setup. Tmux can be configured (from what I have seen) as 2 windows, one with a 3 way split and the other as the editing window. While I don't think I will ever replace PHPStorm with Vim + plugins (I simply am not fast enough vs with PHPStorm) I do try to do everything else in command line using it.

Up until now, I used to use the Nano editor which was shown to me ages and ages ago by one of my all time favorite colleagues, Pete. Pete was, by all standards, a command line warrior. It was actually pretty mesmerizing to see him fly around numerous terminal tabs and files in PuTTY, effortlessly navigating and editing without ever leaving the keyboard. Looking back on that was one of the things that inspired me to push my knowledge of command line and editing further.

In fact, this blog post was written in Vim. I have my tmux in a 3 way split, with the main pane editing the post, the top right pane running <code>jekyll serve</code> and the bottom right pane I am using for git operations. 

This leaves me free to toggle between panes to do common tasks for writing, and writing a blog post is a great way to get practice with common Vim actions and shortcuts.

I highly recommend the book <a href="https://pragprog.com/book/bhtmux/tmux" target="_blank">"tmux - Productive Mouse Free Development"</a>. It's a short read at 88 pages that gets you up and running quickly with tmux.

Second, I also recommend watching this video or series of videos by Colby Cheeze on the best features of Vim and how to use Vim as an IDE. While I don't think I will ever be at his point (PHPStorm PHP/Vagrant/XDebug support is just superior to me) its fun to see how fast you can potentially work when you get experienced with Vim and some of its plugins.

<iframe width="700" height="394" src="https://www.youtube.com/embed/YD9aFIvlQYs" frameborder="0" allowfullscreen></iframe>

With that, I would also recommend tailoring your own .zshrc, .vimrc, and modify a zsh theme and make it your own. The more ownership you begin to take within your command line, the more your confidence will grow.

I have also ordered <a href="https://pragprog.com/book/dnvim2/practical-vim-second-edition" target="_blank">Practical Vim</a>. Unfortunately, I cannot say whether or not I recommend picking this up, because it shipped too late before I went on vacation. I have not been able to begin reading it. Although, pretty much every review of it says it is the defacto manual for Vim.

Hopefully these tools will encourage me to blog more, because blogging gives me an opportunity to edit text, and thats what Vim is all about. So far, the only time I had to reach for the mouse when creating and editing this post was to switch over to Chrome and preview my post. Can I truly go mouse free? Maybe not 100%, but I can increase my productivity this way. Plus, this just feels good.
