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

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    status VARCHAR (50) DEFAULT 'pending',
    media_path VARCHAR(500),
    media_type VARCHAR(20),
    linkedin_post_id VARCHAR(255),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);