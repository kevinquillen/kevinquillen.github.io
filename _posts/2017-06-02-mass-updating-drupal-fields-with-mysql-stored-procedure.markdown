---
layout: post
title: Mass Updating Drupal Fields with MySQL Stored Procedure
date: 2017-06-02 12:00:00
category: drupal
tags:
 - mysql
image: /assets/images/code-3.jpg
---

I was doing an onsite with a client earlier this week, assisting in a demo of the Drupal 8 solution we were building for their team.

During the meeting, it was expressed that they wanted all instances of a text editor to have the same buttons and capabilities.

The way I had (and always do) set up the site was to have three text formats. One with almost no CKEditor buttons, one with a few more, and one with almost all of them (Full HTML).

The change is easy to make, and decided to demonstrate how easy that change was in the meeting.

However, I forgot that by changing the field settings to default to a different format that this would cause all existing field values to revert to a plain text box. This is because I (as usual) use the Better Formats module to default formatted text fields to a specific format and hide the text format selection button.

The database had hundreds of rows spread across a couple dozen tables that needed updating in its format column to change the value to 'full_html'. I would also have to make this change on other environments. So, looking through the database and running updates or changing values manually would be inefficient and tedious.

For this I figured I could employ a SQL query. First, I looked for a way to find all column names that matched a particular pattern. The pattern I was looking for was `field_%_format`. All fields from the Drupal Field API that store text format values have a field in their table matching this pattern.

Once I had that query, I thought hmm, how can I loop the results, and run an `UPDATE` statement to update everything in the database? Before I knew it, I found out I had to make a cursor and eventually a stored procedure, two things I had never done or had to do before. Turns out, it wasn't that difficult.
  
Using resources and some reading, I put together a stored procedure that took a single argument (text format machine name), grabbed all fields matching that pattern, and set their value to the argument value.

<pre class="language-sql"><code class="language-sql">
CREATE PROCEDURE changeFieldFormatValueTo (IN format_name VARCHAR(32))
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE table_name_value VARCHAR(64);
  DECLARE column_name_value VARCHAR(64);
  DECLARE cursor_fields CURSOR FOR SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME LIKE 'field_%_format';
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
	
  OPEN cursor_fields;

  ColumnList: LOOP
    FETCH cursor_fields INTO table_name_value, column_name_value;
    
    IF done THEN 
      Leave ColumnList;
    END IF;
    
    SET @sql = CONCAT('UPDATE ', table_name_value, ' SET ', column_name_value, ' = "', format_name, '"');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END LOOP;

  CLOSE cursor_fields;
END;
</code></pre>

After you define the stored procedure, you can just call it anytime from the MySQL prompt or MySQL client:

<pre class="language-bash"><code class="language-bash">
mysql > CALL changeFieldFormatValueTo("full_html");
</code></pre>

This opens up new possibilities later for other "fixes" to make in Drupal quickly. I could even create another stored procedure that takes more arguments, say, if I needed a way to change one format value to another for fields that have a certain value (so I don't affect _all_ fields, only a select set). That would be a matter of adding more arguments, and changing the `UPDATE` query in the prepared statement to have a `WHERE` condition.

I may have been able to achieve this with a custom module, some Batch API ops etc etc. But that probably would have taken longer to make and I felt like doing something that was more bare metal and faster.

One thing to note, this was not doable from a client like SequelPro (macOS). I had to ssh into my local vagrant box and remote servers to create the stored procedure. SequelPro currently has no way to define or edit stored procedures from its interface. I hear that you can with MySQL Workbench, but I did not want to sit and install that beast when I could just do it from the mysql prompt. Plus it's more time in the command line, which is where I like to be anymore.
