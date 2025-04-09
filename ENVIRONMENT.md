# Environment Configuration

## Database Setup

The project uses PostgreSQL with different database names for each environment:
- Development: `tsunaimi_dev`
- Staging: `tsunaimi_staging`
- Production: `tsunaimi_prod`

## Environment Variables

Each environment has its own configuration file:
- Development: `.env.development`
- Staging: `.env.staging`
- Production: `.env.production` (not committed to repository)

Required variables:
- `DB_USER` - Database username
- `DB_HOST` - Database host
- `DB_NAME` - Database name
- `DB_PORT` - Database port (follows pattern: dev=5432, staging=5532, prod=5632)
- `DB_SSL` - Use SSL connection (true/false)

## Port Configuration

The project follows a standardized port mapping pattern:
- Development (base + 0):
  - Frontend: 3000:3000
  - PostgreSQL: 5432:5432
- Staging (base + 100):
  - Frontend: 3100:3000
  - PostgreSQL: 5532:5432
- Production (base + 200):
  - Frontend: 3200:3000
  - PostgreSQL: 5632:5432

## Setting Up a New Environment

1. Create appropriate `.env.[environment]` file
2. Run database setup script:
   ```bash
   cd scripts
   ./setup-db.sh [environment]
   ```

## Security Notes

- Never commit sensitive credentials to the repository
- Use environment-specific SSL settings
- Production credentials should be managed separately
- Use strong passwords and restricted database users

## Deployment Process

1. Choose target environment (development/staging/production)
2. Ensure environment variables are properly configured
3. Run database setup script if needed
4. Deploy application code
5. Verify database connectivity

## Troubleshooting

If database connection fails:
1. Verify environment variables
2. Check database existence
3. Confirm network connectivity
4. Verify SSL settings if applicable

## Environment Files

We use different environment files for different deployment stages:

- `.env.local` - Local development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment
- `.env.example` - Template file (committed to git)

## Setup Process

1. Copy `.env.example` to create your environment-specific file:
   ```bash
   # For local development
   cp .env.example .env.local
   ```

2. Update the values in your environment file according to your needs:
   - Database credentials
   - Email configuration
   - Other environment-specific settings

3. Never commit actual environment files (`.env.*`) to git. Only `.env.example` should be committed.

## Environment-Specific Settings

### Local Development (.env.local)
- Uses local database
- Console-based email service
- Development-specific features enabled

### Staging (.env.staging)
- Uses staging database
- Real email service with test accounts
- Staging-specific logging and monitoring

### Production (.env.production)
- Uses production database
- Real email service with production accounts
- Enhanced security settings
- Production-level logging and monitoring

## Email Configuration

### Email Configuration
- `EMAIL_SERVICE` - Email service to use (console/smtp/sendgrid)
- `EMAIL_USER` - Email service username
- `EMAIL_FROM` - From address for emails
- `EMAIL_TO` - Default recipient address

### Node Environment
- `NODE_ENV` - Environment name (development/staging/production)

For more information, refer to the project documentation or contact the development team. 