const { Client } = require('pg');
require('dotenv').config();

const connectionString = "postgresql://neondb_owner:npg_bMko8tUQCz2R@ep-wild-mouse-a1sid40z.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function testConnection() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        console.log("Attempting to connect with pg...");
        await client.connect();
        console.log("Connection successful!");

        const res = await client.query('SELECT NOW()');
        console.log("Server time:", res.rows[0].now);

        await client.end();
    } catch (err) {
        console.error("Connection failed:", err.message);
        console.error("Error stack:", err.stack);
    }
}

testConnection();
