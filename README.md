# Jumpthon email agent

## License
Check LICENSE file.

## TODO

- [x] clear DB schema
- [x] auth with Google
- [x] get access to email account
- [ ] workflow to add additional Gmail accounts
- [ ] show list of categories
- [x] add category with name and description
- [x] sort incoming emails by the categories using LLM
- [x] summarise processed emails by LLM
- [ ] after email is processed, archive it
- [x] main UI should show list of all processed emails
- [ ] filter by category
- [ ] filter by inbox
- [ ] when clicking on an email, open it in Gmail in a separate tab
- [ ] an email can be deleted -> should delete original email
- [ ] user can choose to unsubscribe from an email
  - [ ] should try to use Gmail's native unsubscribe
  - [ ] if not, use AI agent to follow unsubscribe link and make sure it unsubbed
- [ ] actions can be triggered on multiple emails at once

bonus:
- [ ] process emails currently in the inbox
- [ ] compose emails
- [ ] keyboard navigation
- [ ] read threads in-app
- [ ] star threads

## dev notes

Gmail URLs can be rebuilt with this schema:
`https://mail.google.com/mail?authuser={email_address}#all/{email_id}`