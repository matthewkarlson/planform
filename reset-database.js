// Reset and initialize database
const { Client } = require('pg');
require('dotenv').config();

async function resetDatabase() {
  const connectionString = process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('POSTGRES_URL environment variable is not set');
    process.exit(1);
  }
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Drop all existing tables
    console.log('Dropping all existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS invitations CASCADE;
      DROP TABLE IF EXISTS team_members CASCADE;
      DROP TABLE IF EXISTS teams CASCADE;
      DROP TABLE IF EXISTS activity_logs CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('All tables dropped');
    
    // Create new tables
    console.log('Creating new tables...');
    const createTablesQuery = `
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(100),
        "email" varchar(255) NOT NULL,
        "password_hash" text NOT NULL,
        "role" varchar(20) DEFAULT 'member' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "deleted_at" timestamp,
        "stripe_customer_id" text,
        "stripe_subscription_id" text,
        "stripe_product_id" text,
        "plan_name" varchar(50),
        "subscription_status" varchar(20),
        "remaining_runs" integer DEFAULT 0,
        CONSTRAINT "users_email_unique" UNIQUE("email"),
        CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
        CONSTRAINT "users_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
      );
      
      CREATE TABLE IF NOT EXISTS "activity_logs" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "action" text NOT NULL,
        "timestamp" timestamp DEFAULT now() NOT NULL,
        "ip_address" varchar(45),
        CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
      );
    `;
    
    await client.query(createTablesQuery);
    console.log('Tables created successfully');
    
    console.log('Database reset complete!');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

resetDatabase(); 