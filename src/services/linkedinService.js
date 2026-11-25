const axios = require('axios');

const publishTextPost = async (accessToken, linkedinId, content) => {
    const payload = {
        author: `urn:li:person:${linkedinId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                    text: content
                },
                shareMediaCategory: 'NONE'
            }
        },
        visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
    };

    const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        payload,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
        }
    );

    // LinkedIn displays the post's URN in the 'x-restli-id' header or 'id' in the body...
    return response.headers['x-restli-id'] || response.data.id;
};

module.exports = {
    publishTextPost
};