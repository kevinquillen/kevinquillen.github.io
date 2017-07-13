---
layout: post
title: "Mass Updating Drupal Fields with MySql Stored Procedure Pt. 2"
date: 2017-07-13 12:00:00
category: drupal
tags:
 - mysql
image: /assets/images/code-4.jpg
---

Ever get to the end of a project and have a panic moment when you realize that all the content entered contains links in the WYSIWYG that contain the full domain, and not just the relative path to content (ex. http://dev.mysite.com)?

Who will update this? What do we do? Before we busted out the cots, beer, and pizza, I spent an hour thinking about how we could do this.

Honestly, sometimes you just have to step back and realize you cannot implement every solution the "Drupal" way. A lightbulb went off in my head - I had already fixed this problem _<a href="/drupal/2017/06/02/mass-updating-drupal-fields-with-mysql-stored-procedure/">last month</a>_!

So, I fired up the old code and adjusted the stored procedure statement to create a new one. The goal was that, again, given X number of tables, we needed to change a string. The perfect tool for this is the `replace` function in MySQL. After about an hour, I had a <a href="https://gist.github.com/kevinquillen/8ef864f95f1f521962e672b760a76bbe" target="_blank">new procedure</a> to correct this issue:

<pre class="language-sql"><code class="language-sql">
CREATE PROCEDURE replaceFieldTextTo (IN v_string_from VARCHAR(255), IN v_string_to VARCHAR(255))
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE table_name_value VARCHAR(64);
  DECLARE column_name_value VARCHAR(64);
  DECLARE cursor_fields CURSOR FOR SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME LIKE 'field_%_value';
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
  OPEN cursor_fields;

  ColumnList: LOOP
    FETCH cursor_fields INTO table_name_value, column_name_value;
    
    IF done THEN 
      Leave ColumnList;
    END IF;
    
    SET @sql = CONCAT('UPDATE ', table_name_value, ' SET ', column_name_value, ' = replace(', column_name_value, ', "', v_string_from, '", "', v_string_to ,'")');
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END LOOP;

  CLOSE cursor_fields;
END;
</code></pre> 

This time, the procedure takes 2 arguments. What we are looking for, and what we want to replace it to. We are targeting all tables matching the name `field_%_value` (% is a wildcard) - because every field in Drupal that is based on text format (WYSIWYG) starts with field_ and ends with _value in 99% of cases.

Using it is as simple as you think:

<pre class="language-bash"><code class="language-bash">
mysql> CALL replaceFieldTextTo("http://dev.mysite.com/", "/");
</code></pre>

This statement executed in about 2 seconds and affected numerous rows across 178 tables (lots of fields and lots of revision tables!). I have to execute this on 3 different sites, so the time savings here is immense.

All told, this was just an hour or two investment with some tests to ensure it worked correctly. No late nights, no broken content links on launch, roll onward.

