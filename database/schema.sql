CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    linkedin_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    linkedin_access_token TEXT,
    linkedin_token_expires_at TIMESTAMP
);