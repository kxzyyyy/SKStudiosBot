# SKStudiosBot

A production-ready Discord bot for ticket management, reviews, and embed building. Built with Node.js, TypeScript, and Discord.js v14.

## Features

### Ticket System
- Create support tickets with auto-incrementing numbering
- Private ticket channels with role-based permissions
- Claim tickets for staff members
- Close tickets with automatic transcript generation
- Reopen closed tickets
- View ticket information and statistics
- HTML transcript generation using discord-html-transcripts

### Review System
- Create review panels with custom buttons
- Modal-based review submission
- Rating system (1-5 stars)
- Review statistics and analytics
- Automatic review posting to designated channels

### Embed Builder
- Create custom Discord embeds via modals
- Preview embeds before sending
- Edit embeds before sending
- Send embeds to any channel via selection menu
- Support for title, description, color, footer, thumbnail, and image

### Configuration
- Easy setup via slash commands
- Configure ticket categories, channels, and roles
- No hardcoded IDs - everything stored in JSON
- Modular and scalable architecture

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript (strict mode)
- **Library**: Discord.js v14
- **Storage**: JSON files (no database required)
- **Validation**: Zod
- **Date/Time**: Day.js
- **Logging**: Winston
- **Transcripts**: discord-html-transcripts
- **Environment**: dotenv

## Project Structure

```
SKStudiosBot/
├── src/
│   ├── commands/          # Slash commands
│   │   ├── tickets/       # Ticket-related commands
│   │   ├── reviews/       # Review-related commands
│   │   ├── embeds/        # Embed builder command
│   │   └── admin/         # Setup commands
│   ├── events/            # Discord event handlers
│   ├── interactions/      # Button/modal/select menu handlers
│   │   ├── buttons/
│   │   ├── modals/
│   │   └── selectmenus/
│   ├── services/          # Business logic
│   │   ├── tickets/
│   │   ├── reviews/
│   │   ├── embeds/
│   │   └── config/
│   ├── storage/           # JSON storage layer
│   ├── utils/             # Utility functions
│   └── index.ts           # Bot entry point
├── data/                  # JSON data files
├── transcripts/           # Ticket transcripts
├── logs/                  # Winston logs
├── .env                   # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd SKStudiosBot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Discord bot credentials:
```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_application_client_id_here
GUILD_ID=your_server_guild_id_here
```

4. **Build the project**
```bash
npm run build
```

5. **Start the bot**
```bash
npm start
```

For development with hot reload:
```bash
npm run dev
```

## Initial Setup

After starting the bot, you need to configure it:

1. **Set up the staff role**
```
/setup-roles role:@StaffRole
```

2. **Set up the ticket category**
```
/setup ticket_category:TicketCategory
```

3. **Set up the transcript channel**
```
/setup-transcripts channel:#transcripts
```

4. **Set up the review channel**
```
/setup-reviews channel:#reviews
```

5. **Set up the ticket panel channel**
```
/setup ticket_panel_channel:#ticket-panel
```

6. **Create the ticket panel**
```
/setup-ticket-panel
```

## Commands

### Ticket Commands
- `/setup-ticket-panel` - Create a ticket panel with embed and button
- `/close` - Close the current ticket (staff only)
- `/claim` - Claim the current ticket (staff only)
- `/reopen` - Reopen a closed ticket (staff only)
- `/ticket-info` - View ticket information (staff only)

### Review Commands
- `/createreview` - Create a review panel
- `/reviewstats` - View review statistics (staff only)

### Embed Commands
- `/embed` - Create a custom embed

### Admin Commands
- `/setup` - Configure bot settings
- `/setup-transcripts` - Set transcript channel
- `/setup-reviews` - Set review channel
- `/setup-roles` - Set staff role

## Data Storage

All data is stored in JSON files in the `/data` directory:

- `config.json` - Bot configuration (channels, roles)
- `tickets.json` - Ticket data
- `reviews.json` - Review data
- `counters.json` - Ticket number counter
- `embeds.json` - Saved embed templates

## Logging

Logs are stored in the `/logs` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

Logs are also output to the console in development mode.

## Deployment

### Pterodactyl
1. Upload the project files
2. Set Node.js version to 18+
3. Configure environment variables in the panel
4. Set startup command to `npm start`
5. Install dependencies via panel or SSH

### PebbleHost
1. Upload the project files
2. Configure environment variables
3. Set startup command to `npm start`
4. Install dependencies

### SparkedHost
1. Upload the project files
2. Configure environment variables
3. Set startup command to `npm start`
4. Install dependencies

### Railway
1. Connect GitHub repository
2. Configure environment variables in Railway dashboard
3. Deploy automatically on push

## Security

- Permission checks on all staff commands
- Input validation using Zod schemas
- No hardcoded IDs
- Environment variable protection
- Ticket cooldown system (prevents spam)
- Private ticket channels with role-based access

## Development

### Adding New Commands
1. Create a new file in the appropriate `src/commands/` subdirectory
2. Export a default object with `data` (SlashCommandBuilder) and `execute` function
3. The command will be automatically registered on bot startup

### Adding New Interactions
1. Create a new file in the appropriate `src/interactions/` subdirectory
2. Export a default object with `customId` and `execute` function
3. The interaction will be automatically loaded

### Modifying Services
All business logic is in the `src/services/` directory. Services use the JSON storage layer for data persistence.

## License

ISC

## Support

For issues or questions, please contact the development team.
