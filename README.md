# Twitter Clone with Next.js, Supabase, and Cloudflare Workers

This project is a Twitter clone built with Next.js 15, Supabase, and Cloudflare Workers. It demonstrates a modern full-stack application with serverless architecture.

## Features

- User authentication with Supabase
- Tweet creation and listing
- Asynchronous processing with Cloudflare Workers and Queues

## Architecture Overview

The application consists of three main parts:

1. **Frontend**: Next.js 15 application with App Router
2. **Backend API**: Cloudflare Workers
3. **Database & Auth**: Supabase

The frontend communicates with the Cloudflare Workers API, which then interacts with Supabase for data storage and authentication.

## Prerequisites

- Node.js 18+
- Supabase account
- Cloudflare account
- Wrangler CLI

## Setup Instructions

1. Clone the repository:
