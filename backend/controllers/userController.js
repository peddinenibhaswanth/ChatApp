import User from "../models/User.js";
import bcrypt from "bcryptjs";
import {generateToken} from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

//Sign up

export const signUp = async(req, res) => {
    const { email, password, fullName, bio } = req.body;

    try {
        if(!fullName || !email || !password || !bio) {
            return res.json({success: false, message: "Missing details"});
        }
        const user = await User.findOne({email});
        if(user){
            return res.json({success: false, message: "User already exists"});
        }

        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            fullName,
            bio
        });

        const token = generateToken(newUser._id);

        res.json({success: true, userData: newUser, token, message: "User registered successfully"});
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}


//login

export const login = async(req, res) => {
    const { email, password } = req.body;
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.json({success: false, message: "Missing details"});
        }
        const userData = await User.findOne({email});

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if(!isPasswordCorrect) {
            return res.json({success: false, message: "Invalid credentials"});
        }

        const token = generateToken(userData._id);

        res.json({success: true, userData, token, message: "Login successful"});
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//controller to check if user is authenticated 
export const checkAuth = async(req, res) => {
    res.json({success: true, user: req.user});
}

//controller to update profile

export const updateProfile = async(req, res) => {
    try {
        const { fullName, bio, profilePic } = req.body;
        const userId = req.user._id;
        let updatedUser;

        if(!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, {
                fullName,
                bio,
            }, {new: true});
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, {
                profilePic: upload.secure_url,
                fullName,
                bio,
            }, {new: true
            })
        }

        res.json({success: true, user: updatedUser, message: "Profile updated successfully"});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}