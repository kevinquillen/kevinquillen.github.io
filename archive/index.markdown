---
layout: page
body-color: lightblue
title: "The Archives"
subtitle: "We have top men working on it.<br><br><em>Top... men.</em>"
---

{% if site.posts.size > 1 %}
  <div class="posts-list">
    {% for post in site.posts %}
      <div class="col-lg-12 post-container">
        <article>
          <div class="col-lg-2">
            <h5>{{ post.date | date: "%B %-d, %Y" }} <small>{{ post.category }}</small></h5>
          </div>
          <div class="col-lg-7 post">
            <h4><a href="{{ post.url }}" title="{{ post.title }}">{{ post.title }}</a> <small>{{ post.subtitle }}</small></h4>
          </div>
        </article>
      </div>
    {% endfor %}
  </div>
{% endif %}