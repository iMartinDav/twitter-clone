# Twitter Clone System Design

## Quick Start

### Environment Setup
1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:

**.env.local**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://lmgzflagxmbvmzkinoyw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ3pmbGFneG1idm16a2lub3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MDA2NzEsImV4cCI6MjA1MTA3NjY3MX0.4ANYJjsA-osplYe5y0QcQprRiB2AGMAA6oeOAyLuChE
NEXT_PUBLIC_WORKER_URL=http://localhost:8787
SUPABASE_JWT_SECRET="OUwYUsQHhPLY8xBNTHm4kt9qC7dDEWSIzVc+RNwLbwkxaFwa72tg9Y/UTizBTBOEZEK4xRdpUi4TXZtzGmOgRg=="
```

**worker/.dev.vars**
```bash
SUPABASE_URL=https://lmgzflagxmbvmzkinoyw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ3pmbGFneG1idm16a2lub3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MDA2NzEsImV4cCI6MjA1MTA3NjY3MX0.4ANYJjsA-osplYe5y0QcQprRiB2AGMAA6oeOAyLuChE
JWT_SECRET=OUwYUsQHhPLY8xBNTHm4kt9qC7dDEWSIzVc+RNwLbwkxaFwa72tg9Y/UTizBTBOEZEK4xRdpUi4TXZtzGmOgRg==
```

### Starting the Application

1. Start the Next.js application:
```bash
pnpm dev
```

2. Start the Cloudflare Worker:
```bash
cd worker
pnpm dev
```

### Testing

1. Get a test JWT token:
```bash
pnpm tsx scripts/get-token.ts
```

2. Test tweet creation:
```bash
curl -X POST http://localhost:8787/tweet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"content":"Test tweet!"}'
```

## Architecture Overview

The system is built using Cloudflare Workers, Cloudflare Queues, and Supabase, following a distributed architecture pattern.

```mermaid
graph TD
    Client --> Worker[Cloudflare Worker /api]
    Worker --> Queue[Cloudflare Queue]
    Worker --> DB[(Supabase DB)]
    Queue --> Consumer[Queue Consumer]
    Consumer --> DB
```

## Components

### Cloudflare Worker
- Acts as the API gateway
- Handles authentication and request validation
- Writes tweets to Supabase
- Enqueues async processing tasks

### Cloudflare Queue
- Handles async processing of tweets
- Manages notifications and mentions
- Processes analytics data
- Ensures reliable task execution

### Supabase Database
- Stores user data, tweets, and relationships
- Handles real-time updates
- Manages authentication

## Data Flow

1. Tweet Creation:
   - Client sends POST request to Worker
   - Worker validates JWT and input
   - Worker writes to Supabase
   - Worker enqueues async processing
   - Queue consumer processes mentions and analytics

## Scalability & Optimization

### Worker Scaling
- Automatic scaling across Cloudflare's edge network
- Stateless design enables horizontal scaling
- Load balancing handled by Cloudflare

### Queue Optimization
- Batch processing for efficiency
- Retry mechanisms for reliability
- Dead letter queues for failed messages

### Database Optimization
- Indexed queries for tweet lookups
- Connection pooling
- Read replicas for heavy loads

## Security

### Authentication
- JWT-based auth using Supabase
- Token validation at Worker level
- Scoped database access

### Protection
- Rate limiting at Worker level
- Input sanitization
- Prepared statements for SQL

## Monitoring & Resilience

### Observability
- Worker analytics
- Queue monitoring
- Database performance metrics

### Error Handling
- Graceful degradation
- Circuit breakers
- Retry strategies

## Future Enhancements

1. Content Delivery Network integration
2. Real-time notifications using WebSocket
3. Media handling and storage
4. Advanced analytics processing

## Database Schema

### Tables

**tweets**
```sql
create table tweets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

**profiles**
```sql
create table profiles (
  id uuid references auth.users(id) primary key,
  full_name text,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Policies

**tweets**
```sql
-- Read access
create policy "Anyone can read tweets"
  on tweets for select
  using (true);

-- Insert access
create policy "Authenticated users can create tweets"
  on tweets for insert
  with check (auth.role() = 'authenticated');
```
