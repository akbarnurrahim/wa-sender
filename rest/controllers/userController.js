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

function getAllUser(req, res) {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) {
            console.error('Error executing query: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
}


function getUserById(req, res) {
    const userId = req.params.id;

    db.query('SELECT * FROM user WHERE id = ?', [userId], (err, result) => {
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

function loginUser(req, res) {
    const userId = req.params.id;

    db.query('SELECT * FROM user WHERE id = ?', [userId], (err, result) => {
        if (err) {
            console.error('Error executing query: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (result.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            const user = result[0];
            const providedPassword = req.body.password;

            bcrypt.compare(providedPassword, user.password, (compareErr, isMatch) => {
                if (compareErr) {
                    console.error('Error comparing passwords: ' + compareErr);
                    res.status(500).json({ error: 'Internal server error' });
                } else if (isMatch) {
                    res.json(user);
                } else {
                    res.status(401).json({ message: 'Unauthorized' });
                }
            });
        }
    });
}

function registerUser(req, res) {
    const { username, email, password, role } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        db.query('INSERT INTO user (username, email, password, role, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, role, currentTime, currentTime], (err, result) => {
                if (err) {
                    console.error('Error executing query: ' + err);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                res.status(201).json({ message: 'User created', id: result.insertId });
            });
    });
}

function updateUser(req, res) {
    const userId = req.params.id;
    const { username, email, oldPassword, newPassword, role } = req.body;

    db.query('SELECT * FROM user WHERE id = ?', [userId], (err, result) => {
        if (err) {
            console.error('Error executing query: ' + err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (result.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            const user = result[0];

            bcrypt.compare(oldPassword, user.password, (compareErr, isMatch) => {
                if (compareErr) {
                    console.error('Error comparing passwords: ' + compareErr);
                    res.status(500).json({ error: 'Internal server error' });
                } else if (isMatch) {
                    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Waktu saat ini

                    if (newPassword) {
                        bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
                            if (hashErr) {
                                console.error('Error hashing password: ' + hashErr);
                                res.status(500).json({ error: 'Internal server error' });
                                return;
                            }

                            db.query('UPDATE user SET username = ?, email = ?, password = ?, role = ?, updated_at = ? WHERE id = ?',
                                [username, email, hashedPassword, role, currentTime, userId], (updateErr, updateResult) => {
                                    if (updateErr) {
                                        console.error('Error executing update query: ' + updateErr);
                                        res.status(500).json({ error: 'Internal server error' });
                                        return;
                                    }

                                    res.json({ message: 'User updated' });
                                });
                        });
                    } else {
                        db.query('UPDATE user SET username = ?, email = ?, role = ?, updated_at = ? WHERE id = ?',
                            [username, email, role, currentTime, userId], (updateErr, updateResult) => {
                                if (updateErr) {
                                    console.error('Error executing update query: ' + updateErr);
                                    res.status(500).json({ error: 'Internal server error' });
                                    return;
                                }

                                res.json({ message: 'User updated' });
                            });
                    }
                } else {
                    res.status(401).json({ message: 'Unauthorized' });
                }
            });
        }
    });
}

function deleteUserById(req, res) {
    const userId = req.params.id;

    db.query('DELETE FROM user WHERE id = ?', [userId], (err, result) => {
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

module.exports = {
    getAllUser,
    getUserById,
    registerUser,
    loginUser,
    updateUser,
    deleteUserById
};