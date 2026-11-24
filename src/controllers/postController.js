const db = require('../config/db.js');

// Schedule a new post for the authenticated user;

const createPost = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { content, scheduled_at } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'O conteúdo da publicação é obrigatório.' });
        }

        if (!scheduled_at) {
            return res.status(400).json({ error: 'A data e hora de agendamento são obrigatórias.' });
        }

        const scheduledDate = new Date(scheduled_at);
        if (isNaN(scheduledDate.getTime())) {
            return res.status(400).json({ error: 'Formato de data inválido.' });
        }

        if (scheduledDate <= new Date()) {
            return res.status(400).json({ error: 'A data de agendamento deve ser no futuro.' });
        }

        const queryText = `
            INSERT INTO posts (user_id, content, scheduled_at, status)
            VALUES ($1, $2, $3, 'pending')
            RETURNING *
        `;

        const result = await db.query(queryText, [userId, content.trim(), scheduledDate]);

        return res.status(201).json({
            message: 'Publicação agendada com sucesso!',
            post: result.rows[0]
        });

    } catch (err) {
        console.error('Erro ao agendar publicação:', err);
        return res.status(500).json({ error: 'Erro interno do servidor ao agendar publicação.' });
    }
};