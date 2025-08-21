const express = require('express');
const router = express.Router();
const User = require('./../models/users');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

// POST route to add a person
router.post('/signup', async (req, res) =>{
    try{
        const data = req.body // Assuming the request body contains the  User data

        // Create a new Person document using the Mongoose model
        const newUser = new User(data);
if(newUser.role=== 'admin'){
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
        return res.status(400).json({error: 'An admin already exists.'});
    }
} 
const savedUser = await newUser.save();
    console.log('User saved');

    // Generate JWT token
    const payload = { id: savedUser.id };
    const token = generateToken(payload);

    //  Store token in DB
    savedUser.token = token;
    await savedUser.save();
       
        console.log("Token is : ", token);

        res.status(200).json({response: savedUser, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Login Route
router.post('/login', async(req, res) => {
    try{
        // Extract username and password from request body
        const {idCardnumber, password} = req.body;

        // Find the user by username
        const user = await Person.findOne({ idCardnumber: idCardnumber});

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid  CNIC or password'});
        }

        // generate Token 
        const payload = {
            id: user.id,
            
        }
        const token = generateToken(payload);

        // resturn token as response
        res.json({token})
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await  User.findById(userId);

        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.put('/profile/password', async (req, res)=>{
    try{
        const userId = req.user; // Extract the id from the URL parameter
        const  {currentpassword,newpassword} = req.body; // Updated data for the person
const user= await User.findById(userId.id);
        if(!(await user.comparePassword(currentpassword))){
            return res.status(401).json({error: 'Current password is incorrect'});
        }
        user.password = newpassword; // Update the password
        await user.save(); // Save the updated person document
   
        res.status(200).json({message: 'Password updated successfully'});
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

 

module.exports = router;