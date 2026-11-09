// LinkedIn OAuth 2.0 configuration variables from environment
const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;


const redirectToLinkedIn = (req, res) => {
    // Standard OAuth 2.0 scopes for OpenID Connect profile & email access...
    const scope = encodeURIComponent('openid profile email');
    const state = 'random_state_string'; // Security state to prevent CSRF attacks...

    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=${scope}`;

    res.redirect(linkedinAuthUrl);
};

module.exports = {
    redirectToLinkedIn,
};