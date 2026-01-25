import dotenv from "dotenv";
dotenv.config();

import pool from "../src/config/db.js";

afterAll(async () => {
    await pool.end();
});
