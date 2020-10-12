# mail-reader

## Node.js webservice

This is a webservice that reads, parses and processes emails with error logs.
The goal is to automate the process of reviewing and spotting potential integration issues between two systems and present them in a user-friendly way.

- Connect to mailbox using ImapFlow library
- Read all emails
- Parse the emails and attachments
- Read connector configuration from external file
- For each connector check for errors
- Create a summary email
- If anything bad happens (inbox errors, config, parse, attachment errors etc.) log an issue and notify user via email and logfile
