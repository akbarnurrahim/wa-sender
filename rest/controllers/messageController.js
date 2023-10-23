require("dotenv").config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
const bcrypt = require('bcrypt');

app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as ID ' + db.threadId);
});

function getAllMessage(req, res) {
    db.query('SELECT * FROM message', (err, results) => {
        if (err) {
            console.error('Error executing query: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
}

function getMessageById(req, res) {
    const messageId = req.params.id;

    db.query('SELECT * FROM message WHERE id = ?', [messageId], (err, result) => {
        if (err) {
            console.error('Error executing query: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (result.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json(result[0]);
        }
    });
}

function deleteMessageById(req, res) {
    const messageId = req.params.id;

    db.query('DELETE FROM message WHERE id = ?', [messageId], (err, result) => {
        if (err) {
            console.error('Error executing query: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(204).json();
        }
    });
}

function createMessage(req, res) {
    const { content, send_at, send_to, user_id } = req.body;

    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    db.query('INSERT INTO message (content, user_id, send_to, send_at, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [content, user_id, send_to, send_at, currentTime, currentTime], (err, result) => {
            if (err) {
                console.error('Error executing query: ' + err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            res.status(201).json({ message: 'User created', id: result.insertId });
        });
}

module.exports = {
    getAllMessage, getMessageById, createMessage
};