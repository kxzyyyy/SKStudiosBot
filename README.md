#### Service Type:
Discord Bot

### Features:
### Ticket System
- Fully customizable ticket panel system.
- Multiple Panel Buttons
- Ticket Numbering
- Claim Tickets

### Review System
- Create review panels for customers to create a review.
- Select service type, developer worked with, short text review, and a 1-5 stars rating system.
- Statistics for ratings, average rating, rating amounts, etc.
- Automated review posting to designated channel.

### Embed Builder
- Create custom embeds via modals.
- Preview embeds before sending.
- Edit embeds before sending.
- Title, description, color, thumbnail, footer image support.

### Autorole
- Automatically assigns a configured role to new members when they join.

### Welcome and Leave Messages
- Fully customizable Welcome and Leave messages.
- Change embed message color
- Optional banner image
- Use placeholders to mention users, show member count etc.
### Placeholders
```
{username} - User's display name
{server_name} - Server name
{mention_user} - @mention the user
{member_count} - Current member count
{user_id} - User's ID
{user_tag} - User's username
{user_avatar} - User's avatar URL
```

### Commands:
### Setup
- `/setup-reviews`
- `/setup-roles`
- `/setup-ticket-panel` Create and customize a ticket panel
### /setup-ticket-panel Options
```
title - Title of the ticket panel
description - Short description of the ticket panel
service_1_name - Name of the 1st button
service_2_name - Name of the 2nd button (Optional)
service_3_name - Name of the 3rd button (Optional)
service_4_name - Name of the 4th button (Optional)
service_5_name - Name of the 5th button (Optional)
```
- `/setup-welcome` - Choose channel for welcome messages to go in
- `/setup-leave` - Choose channel for leave messages to go in
- `/setup-autorole` - Define the role automatically given on join
- `/setup-welcome-message` - Customize the welcome message
- `/setup-leave-message` - Customize the leave message
- `/setup` - Configure the bot, using the options below
### /setup Options
```
ticket_category - Choose category for tickets to go in
review_channel - Choose channel for reviews to go in
staff_role - Define staff role (Has permission to use staff commands)
ticket_panel_chanel - Choose the channel for the ticket panel to go in
closed_ticket_category - Choose the category for closed tickets to go in
welcome_channel - Choose channel for welcome messages to go in
leave_channel - Choose channel for leave messages to go in
```

### Tickets
- `/close` - Close the ticket your in
- `/claim` - Claim the ticket your in
- `/reopen` - Reopen the closed ticket your in
- `/ticket-info` - Get info for the ticket your in

### Reviews
- `/createreview` - Create review embed
- `/reviewstats` - See statistics for reviews of the server

### Embed Commands
- `/embed` - Create a embed message
