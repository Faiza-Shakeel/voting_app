const express = require('express');
const router = express.Router();
const User = require('./../models/users');
 
const {jwtAuthMiddleware, generateToken} = require('./../jwt');
const Candidate = require('./../models/candidates');

const  checkRole =async (userID)=>{
    try{
const user=await User.findById(userID);
    if(user.role === 'admin'){
        return true; // User is an admin
    }   }
    catch(err){
        return false; // User is not an admin or an error occurred
    }
}

// POST route to add a person
router.post('/', jwtAuthMiddleware,async (req, res) =>{
    try{
        if (!(await checkRole(req.user.id))) {
            return res.status(403).json({error: 'Access denied. Only admins can add candidates.'});
        }
        const data = req.body // Assuming the request body contains the  candidate data

        // Create a new  candidate document using the Mongoose model
        const candidate = new Candidate(data);

        // Save the new person to the database
        const response = await   candidate.save();
        console.log('data saved');
        res.status(200).json({response: response });
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.put('/:candidateID',jwtAuthMiddleware, async (req, res)=>{
    try{
           if (! (await checkRole(req.user.id))) {
            return res.status(403).json({error: 'Access denied. Only admins can add candidates.'});
        }
        const candidateId = req.params.candidateID; // Extract the id from the URL parameter
          const updatedCandidateData  = req.body; // Updated data for the person
        // Find the person by id and update their data
        const updatedCandidate = await User.findByIdAndUpdate(candidateId, updatedCandidateData,
            {  new: true,
        runvalidators: true} // Return the updated document and validate the update
        );
   if(!updatedCandidate) {
            return res.status(404).json({error: 'Candidate not found'});
        }
       
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})
router.delete('/:candidateID',jwtAuthMiddleware, async (req, res) => {
  try{
           if (!(await checkRole(req.user.id))) {
            return res.status(403).json({error: 'Access denied. Only admins can add candidates.'});
        }
        const candidateId = req.params.candidateID; // Extract the id from the URL parameter
          const updatedCandidateData  = req.body; // Updated data for the person
        // Find the person by id and update their data
        const updatedCandidate = await Candidate.findByIdAndDelete(candidateId)
   if(!updatedCandidate) {
            return res.status(404).json({error: 'Candidate deletion failed'});
        }
       
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})
// vote counting
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        const candidateId = req.params.candidateID; // Extract the candidate ID from the URL parameter
        const userId = req.user.id; // Get the user ID from the JWT token
        // Check if the user has already voted
        const user = await User.findById(userId);
        if (user.isvoted) {
            return res.status(400).json({error: 'You have already voted.'});
        }
        // Find the candidate by ID
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({error: 'Candidate not found'});
        }
        // admin can't vote
        if (user.role === 'admin') {
            return res.status(403).json({error: 'Admins cannot vote.'});
        }
        candidate.votes.push({user:userId})
        // Increment the candidate's vote count
        candidate.votesCount++;
        await candidate.save();
        // Mark the user as having voted
        user.isvoted = true;
        await user.save();
res.status(200).json({message: 'Vote cast successfully' });

    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})
// GET route to get all candidates
router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({votesCount: 'desc'});
        // map the candiates
const voteRecord= candidates.map(candidate => ({
     name: candidate.name,
            party: candidate.party, 
            votesCount: candidate.votesCount
        }));
        res.status(200).json({voteRecord });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;