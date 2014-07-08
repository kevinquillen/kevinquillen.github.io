---
layout: post
title:  Media Migration Tip in Drupal
subtitle: Ditch files that don't exist with cURL
date:   2014-07-08 18:00:00
category: drupal
body-color: darkgreen
tags:
 - drupal planet
 - migrating media
 - drupal 7
---

If you're doing a migration of media files, you most likely will be working with a list of URLs. Other times, you will have a local file system from which to pull in media. When working with just a list of 
URLs though, you're somewhat working with a 'blind' import.

Imported content may reference images or files as anchor or image tags, but you really don't know if they exist or not. If you are migrating a large site, there is a very good chance there are some forgotten pages 
in the system that makes use of file URLs that have been long deleted.

Fortunately, we can do a quick check before processing the record to make sure that the file does in fact exist before we attempt to download and save it in the media system. By using a custom method and implementing 
<code>prepareRow()</code>, we can skip 'bad' rows entirely:

<pre class="language-php line-numbers"><code class="language-php">
/**
 * Implements method prepareRow().
 * @param $row
 * @return bool
 */
public function prepareRow($row) {
  if (!$this->fileExists($row->url)) {
    return FALSE;
  }
}
  
/**
 * Check to see if the physical file even exists before we attempt to migrate it in.
 * @param $url
 * @return bool
 */
private function fileExists($url) {
  $curl = curl_init($url);
  curl_setopt($curl, CURLOPT_NOBODY, true);
  $result = curl_exec($curl);
  curl_getinfo($curl, CURLINFO_HTTP_CODE);
  curl_close($curl);
  return ($result && $status == 200) ? TRUE : FALSE;
}
</code></pre>

<code>cURL</code> can quickly tap the supplied URL and return the status code to us. Setting the option of <code>CURLOPT_NOBODY</code> instructs <code>cURL</code> to not return the body with the output so 
we don't task the remote server just checking to see the file exists.

If the <code>cURL</code> status returns anything but 200 OK, we then return FALSE in the <code>prepareRow()</code> method. Migrate allows you to skip rows in the source in this manner, allowing us to more 
smartly import media URLs.

After migrating, you can use a tool like [LinkChecker](https://www.drupal.org/project/linkchecker) to comb your content and report back broken file links to create a report out of and address at that point in time. This way, you don't 
wind up with a migration pointing to non-existent files and dirty database records in the destination.