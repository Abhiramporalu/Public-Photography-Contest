const { validationResult } = require('express-validator');
const Contest = require('../models/Contest');
const { notifyUsersOnNewContest,notifyUsersOnContestEnd } = require('./contestNotifier');


// Create a new contest
const createContest = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    console.log('Request body:', req.body); // Debugging log

    const contest = new Contest({
        title: req.body.title,
        description: req.body.description,
        start_date: req.body.start_date,
        end_date: req.body.end_date
    });

    try {
        const savedContest = await contest.save();
        console.log('Contest created:', savedContest);
        await notifyUsersOnNewContest(savedContest);
        res.status(201).send(savedContest);
    } catch (error) {
        console.error('Error creating contest:', error);
        res.status(500).send(error);
    }
};

// Get all contests
const getAllContests = async (req, res) => {
    try {
        const contests = await Contest.find();
        console.log('Data sent');
        res.status(200).json(contests);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a contest by title or ID
const updateContestByTitle = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    console.log('Request body:', req.body); // Debugging log

    const { id, title, description, start_date, end_date } = req.body;

    try {
        let contest;
        if (id) {
            contest = await Contest.findById(id);
        } else {
            contest = await Contest.findOne({ title });
        }

        if (!contest) {
            console.log('Contest not found');
            return res.status(404).json({ update: 'Record Not Found' });
        }

        const oldTitle = contest.title;

        // If title is changing, verify there isn't another contest with the new title
        if (title && title !== oldTitle) {
            const duplicate = await Contest.findOne({ title });
            if (duplicate) {
                return res.status(400).json({ message: `Contest with title "${title}" already exists.` });
            }
            contest.title = title;
        }

        if (description !== undefined) contest.description = description;
        if (start_date !== undefined) contest.start_date = start_date;
        if (end_date !== undefined) contest.end_date = end_date;

        const savedContest = await contest.save();
        console.log('Contest Updated:', savedContest);

        // If title changed, cascade update to Photos and Votes collections
        if (title && title !== oldTitle) {
            const Photo = require('../models/Photo');
            const Vote = require('../models/Vote');

            await Photo.updateMany({ contest_title: oldTitle }, { contest_title: title });
            await Vote.updateMany({ contest_title: oldTitle }, { contest_title: title });
            console.log(`Cascaded title update from "${oldTitle}" to "${title}" in Photos and Votes`);
        }

        res.status(200).json({ update: 'success', updatedContest: savedContest });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).send(error);
    }
};

// Delete a contest by title
const deleteContestByTitle = async (req, res) => {
    const contestTitle = req.body.title;

    try {
        const deletedContest = await Contest.deleteOne({ title: contestTitle });
        if (deletedContest.deletedCount > 0) {
            console.log('Contest Deleted');
            res.status(200).json({ delete: 'success' });
        } else {
            console.log('Contest Not deleted');
            res.status(404).json({ delete: 'Record Not Found' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).send(error);
    }
};
// End a contest and notify users
const endContestAndNotify = async (req, res) => {
    const { title, winnerPhotoUrl,winnerName } = req.body;
  
    try {
      const endedContest = await Contest.findOne({ title });
  
      if (!endedContest) {
        return res.status(404).json({ message: 'Contest not found' });
      }
  
      endedContest.winnerName = winnerName || "";
      endedContest.winnerPhotoUrl = winnerPhotoUrl || "";
      endedContest.status = 'ended';
      await endedContest.save();
  
      const winnerNames = [winnerName]; // Replace with actual names if needed
      await notifyUsersOnContestEnd(endedContest, winnerNames);
  
      res.status(200).json({ message: 'Contest ended and users notified', endedContest });
    } catch (error) {
      console.error('Error ending contest:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

module.exports = {
    createContest,
    getAllContests,
    updateContestByTitle,
    deleteContestByTitle,
    endContestAndNotify
};
