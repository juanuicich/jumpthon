# Chompymail email agent
Build for the Jump weekend hackathon

## License
Check LICENSE file.

## TODO

- [x] clear DB schema
- [x] auth with Google
- [x] get access to email account
- [x] workflow to add additional Gmail accounts
- [x] show list of categories
- [x] add category with name and description
- [x] sort incoming emails by the categories using LLM
- [x] summarise processed emails by LLM
- [ ] after email is processed, archive it
- [x] main UI should show list of all processed emails
- [x] filter by category
- [x] filter by inbox
- [ ] when clicking on an email, open it in Gmail in a separate tab
- [x] an email can be deleted -> should delete original email
- [x] user can choose to unsubscribe from an email
  - [x] use AI agent to follow unsubscribe link and make sure it unsubbed
- [x] actions can be triggered on multiple emails at once
- [ ] setup cron job to fetch incoming emails

## dev notes

Gmail URLs can be rebuilt with this schema:
`https://mail.google.com/mail?authuser={email_address}#all/{email_id}`