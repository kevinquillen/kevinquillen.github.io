---
layout: post
title: Give Vagrant Sudoer Permissions on OSX
subtitle: For NFS /etc/exports
date: 2017-01-14 12:00:00
category: osx
tags:
 - vagrant
 - sysadmin
image: /assets/images/code-2.jpg
---

If you want to grant Vagrant the ability to edit your `/etc/exports` file for NFS shares, there is a short write up on <a href="https://www.vagrantup.com/docs/synced-folders/nfs.html" target="_blank">the official Vagrant website</a> for OSX.

However, a few details are left out - particularly for people like me who didn't know what visudo is.

It requires editing the sudoers file using the visudo program, but if you have modified and extended vim on your machine, your terminal window might dump a lot of errors on the screen the moment you try to edit sudoers (for me, it was regarding missing plugins) which is scary. `:q!`'d out.

Turns out, `visudo` defaults to a vim somewhere in the system that isn't the same vim that I use.

First, I had to edit my user `.profile`, and define vim as my default editor:

<pre class="language-bash"><code class="language-bash">
export EDITOR=vim
</code></pre>

Then reload it, and verify it was set:

<pre class="language-bash"><code class="language-bash">
kevinquillen > ~: . ~/.profile
kevinquillen > ~: env | grep EDI
EDITOR=vim
</code></pre>

Now, when I run `sudo visudo` it will default to _my_ vim, and there were no errors.

From there, simply add the following as noted in the documentation:

<pre class="language-vim"><code class="language-vim">
Cmnd_Alias VAGRANT_EXPORTS_ADD = /usr/bin/tee -a /etc/exports
Cmnd_Alias VAGRANT_NFSD = /sbin/nfsd restart
Cmnd_Alias VAGRANT_EXPORTS_REMOVE = /usr/bin/sed -E -e /*/ d -ibak /etc/exports
%admin ALL=(root) NOPASSWD: VAGRANT_EXPORTS_ADD, VAGRANT_NFSD, VAGRANT_EXPORTS_REMOVE
</code></pre>

After that, Vagrant will no longer ask for a password when editing the exports file, making you a hair quicker on local development.

Do be careful though, editing the sudoers file can have dire consequences if you make a mistake.

It would be great to get it working for the `vagrant-hostsupdater` plugin as well, but, from the issues I have seen it looks problematic.
