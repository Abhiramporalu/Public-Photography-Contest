// controllers/contestNotifier.js
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Notify users when a new contest is created
const notifyUsersOnNewContest = async (contest) => {
  try {
    const users = await User.find({}, 'email');
    const emails = users.map(user => user.email);

    const subject = `New Contest: ${contest.title}`;
    const html = `
      <h3>A new photo contest has been created!</h3>
      <p><strong>Contest:</strong> ${contest.title}</p>
      <p><strong>Start Date:</strong> ${contest.start_date}</p>
      <p><strong>End Date:</strong> ${contest.end_date}</p>
      <p>Visit the platform to participate now!</p>
    `;

    await sendEmail({ to: emails, subject, html });
    console.log('📧 Notification email sent to all users.');
  } catch (error) {
    console.error('❌ Error sending contest creation email:', error);
  }
};

// Notify users when a contest ends
const notifyUsersOnContestEnd = async (contest, winnerName) => {
  try {
    const users = await User.find({}, 'email');
    const emails = users.map(user => user.email);

    const subject = `Results Out: ${contest.title}`;
    const html = `
      <h3>The contest "${contest.title}" has ended!</h3>
      <p><strong>Winners:</strong> ${winnerName.join(',')}</p>
      <p>Thank you for participating. Stay tuned for more contests!</p>
    `;

    await sendEmail({ to: emails, subject, html });
    console.log('📧 Result email sent to all users.');
  } catch (error) {
    console.error('❌ Error sending contest result email:', error);
  }
};

module.exports = {
  notifyUsersOnNewContest,
  notifyUsersOnContestEnd,
};
