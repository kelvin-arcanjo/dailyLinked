const axios = require('axios');
const db = require('../config/db.js');
const jwt = require('jsonwebtoken');

// LinkedIn OAuth 2.0 configuration variables from environment...
const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;


const redirectToLinkedIn = (req, res) => {
    // Standard OAuth 2.0 scopes for OpenID Connect profile & email access...
    const scope = encodeURIComponent('openid profile email');
    const state = 'random_state_string'; // Security state to prevent CSRF attacks...

    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=${scope}`;

    res.redirect(linkedinAuthUrl);
};

// Handles the callback from LinkedIn after user authorization...

const handleLinkedInCallback = async (req, res) => {
    const { code, error } = req.query;
    
    if (error) {
        return res.status(400).json({ error: 'Authorization failed or denied by user' });
    }
    
    if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
    }
    
    try {
       // URL-encoded payload for the access token request...
       const tokenParams = new URLSearchParams({
            grant_type: 'authorization_code', code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI
        });

        // Server-to-Server to exchange autorization code for access token...
        const tokenResponse = await axios.post(
            'https://www.linkedin.com/oauth/v2/accessToken',
            tokenParams.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const acessToken = tokenResponse.data.access_token;
        const expiresIn = tokenResponse.data.expires_in;
        const tokenExpiresAt = expiresIn
            ? new Date(Date.now() + expiresIn * 1000)
            : null; 

        // Fetch user profile data from Linkedin OpenID endopoint using Bearer Token...
        const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo' , {
            headers: {
                Authorization: `Bearer ${acessToken}`
            }
        })

        const { sub: linkedinId, name, email, picture } = profileResponse.data

        // Upsert user data into PostgreSQL database...
        const queryText = `
            INSERT INTO users (
                linkedin_id, 
                name, 
                email, 
                avatar_url, 
                linkedin_access_token,
                linkedin_token_expires_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (linkedin_id)
            DO UPDATE SET
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                avatar_url = EXCLUDED.avatar_url,
                linkedin_access_token = EXCLUDED.linkedin_access_token,
                linkedin_token_expires_at = EXCLUDED.linkedin_token_expires_at,
                updated_at = NOW()
            RETURNING *
        `;

        const queryValues = [linkedinId, name, email, picture, accessToken, tokenExpiresAt]
        const dbResult = await db.query(queryText, queryValues)
        const user = dbResult.rows[0]

        // Create a JWT for internal session management;
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                linkedinId: user.linkedin_id
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d'}
        )

        // Return acess token temporarily to test endpoint execution...
        return res.status(200).json({
            message: 'Authentication and database synchronization successful!',
            token: token,
            user: {
                name: user.name,
                email: user.email,
                avatar_url: user.avatar_url 
            }
        })

    } catch (err) {
        console.error('Error during LinkedIn authentication:', err);
        return res.status(500).json({ error: 'Internal server error during authentication' });
    }
};

async function getProfile(req , res) {
    try {
        const userId = req.user.userId

        const result = await db.query(
            'SELECT id, linkedin_id, name, email, avatar_url, created_at FROM users WHERE id = $1',
            [userId]
        )

        if (result.rows.length === 0){
            return res.status(404).json({ message: 'User not found' }) 
        }

        return res.status(200).json({
            user: result.rows[0]
        })

    } catch (err) {
        console.log('Error user profile:', err)
        return res.status(500).json({
            error: 'Internal server error'
        })
    }
}

module.exports = {
    redirectToLinkedIn,
    handleLinkedInCallback,
    getProfile
}; 