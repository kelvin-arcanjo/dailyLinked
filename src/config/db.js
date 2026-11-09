const { Pool } = require('pg'); // Pool from Package pg imported...

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
})

module.exports = {
    // Export query helper method to execute database commands via pool connection...
    query: (text, params) => pool.query(text, params),
}