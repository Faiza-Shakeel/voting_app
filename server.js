require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;
const db= require('./db');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
 
// Import the router files
const  userRoutes = require('./routes/userRoutes');
app.use('/user',userRoutes);
const   candidateRoutes = require('./routes/candidateRoutes');
app.use('/candidate', candidateRoutes);  

app.listen(port, () => console.log("Server running on http://localhost:3000"));