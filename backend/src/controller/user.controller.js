const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { createJWT } = require('./jwt.controller');

// const { allKeysForEmail, allEmailTypes } = require('../constants');

const createUserToken = (id) => {
    let expiry = new Date();
    expiry.setHours(expiry.getHours() + 3);
    // expiry.setSeconds(expiry.getSeconds() + 30);
    const token = createJWT(id, expiry.getTime() / 1000);
    return token;
}

const hashAndSaltPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
}
// Register a new User
exports.register = async (req, res) => {
    try {
        // Extract data from request
        const { name, email, password} = req.body;

        // Validate request
        if (!name || !email || !password) {
            return res.status(400).json({ status: false, message: "All fields are required" });
        }

        // Verify password strength
        if (password.length < 6) {
            return res.status(400).json({ status: false, message: "Password must be at least 8 characters long" });
        }

        // Check email duplication
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ status: false, message: "Email already in use" });
        }

        // Hash password
        const hash = hashAndSaltPassword(password);

        // Create a User object
        const newUser = new User({
            name,
            email,
            password: hash,
        });

        // Save the user to the database
        const createdUser = await newUser.save();

        if (!createdUser) {
            return res.status(500).json({ status: false, message: "An error occurred while creating the user." });
        }

        // Generate token
        const token = createUserToken(createdUser._id);

        // Return result
        return res.status(201).json({
            status: true,
            token: token,
            user: createdUser,
            message: "Registered Successfully!"
        });
    } catch (e) {
        console.log('Error While Registering:::::', e);
        return res.status(500).json({ status: false, message: "An error occurred while creating the user." });
    }
};



exports.login = async (req, res) => {
    const { email, password} = req.body;
    try {
        // Get user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: false, message: "User Not Found!" });
        }
       
        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);
         console.log('Login:  4', passwordMatch);
        if (passwordMatch) {
            // Generate JWT token
            console.log('Login:  3', user);
            const token = createUserToken(user._id);

            return res.status(200).json({
                status: true,
                token: token,
                user: user,
                message: "Logged in Successfully"
            });
        } else {
            return res.status(400).json({ status: false, message: "Wrong password" });
        }
    } catch (e) {
        console.log('Error While Login:', e);
        return res.status(500).json({ message: "Some error occurred while logging in a user." });
    }
}

exports.getUserById = async (req, res) => {
    const { userId } = req.body; // assuming userId is sent in the request body
    try {
        const user = await User.findById(userId).select('-password'); // Exclude the password field
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }
        res.status(200).json({ status: true, user });
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ status: false, message: "Server error" });
    }
};