const db = require('../config/db.js');
const { publishTextPost } = require('../services/linkedinService.js');

let isProcessing = false;

const processPendingPosts = async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
        // It searches for pending publications whose scheduled time has already arrived, cross-referencing this with user data...
        const queryText = `
            SELECT 
                p.id AS post_id,
                p.content,
                u.linkedin_id,
                u.linkedin_access_token,
                u.linkedin_token_expires_at
            FROM posts p
            INNER JOIN users u ON p.user_id = u.id
            WHERE p.status = 'pending'
              AND p.scheduled_at <= NOW()
            ORDER BY p.scheduled_at ASC
        `;

        const { rows: pendingPosts } = await db.query(queryText);

        for (const post of pendingPosts) {
            try {
                if (!post.linkedin_access_token) {
                    throw new Error('Token OAuth do LinkedIn ausente para este utilizador.');
                }

                if (post.linkedin_token_expires_at && new Date(post.linkedin_token_expires_at) <= new Date()) {
                    throw new Error('Token OAuth do LinkedIn expirado. É necessário autenticar novamente.');
                }

                // Posting at lnkedin...
                const linkedinPostId = await publishTextPost(
                    post.linkedin_access_token,
                    post.linkedin_id,
                    post.content
                );

                // Mark as published at databse...
                await db.query(
                    `UPDATE posts 
                     SET status = 'published', 
                         linkedin_post_id = $1, 
                         updated_at = NOW() 
                     WHERE id = $2`,
                    [linkedinPostId, post.post_id]
                );

                console.log(`[Scheduler] Post #${post.post_id} publicado com sucesso (LinkedIn ID: ${linkedinPostId}).`);

            } catch (postErr) {
                const errorMessage = postErr.response?.data?.message || postErr.message;
                console.error(`[Scheduler] Falha ao publicar post #${post.post_id}:`, errorMessage);

                await db.query(
                    `UPDATE posts 
                     SET status = 'failed', 
                         error_message = $1, 
                         updated_at = NOW() 
                     WHERE id = $2`,
                    [errorMessage, post.post_id]
                );
            }
        }
    } catch (err) {
        console.error('[Scheduler] Erro ao consultar publicações pendentes:', err);
    } finally {
        isProcessing = false;
    }
};

const startScheduler = () => {
    console.log('[Scheduler] Motor de agendamento iniciado (verificação a cada 30s).');
    // Executa imediatamente ao arrancar e depois a cada 30 segundos
    processPendingPosts();
    setInterval(processPendingPosts, 30 * 1000);
};

module.exports = {
    startScheduler
};