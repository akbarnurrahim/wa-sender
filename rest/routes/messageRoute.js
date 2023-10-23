const express = require('express');
const { getAllUser, getUserById, registerUser, loginUser, updateUser, deleteUserById } = require('../controllers/userController');
const router = express.Router();

router.get("/", getAllUser);
router.get('/:id', getUserById);
router.get('/login', loginUser);
router.post('/register', registerUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUserById);

module.exports = router;
