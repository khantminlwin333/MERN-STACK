const Queue = require('bull');
const sendEmail = require('../helpers/sendEmail');
const emailQueue = new Queue('emailQueue', {
    redis: {
        port: 6379,
        host: '127.0.0.1',
        maxRetriesPerRequest: 100 // Increase the max retries per request
    }
});

emailQueue.process(async (job) => {
    try {
        await sendEmail(job.data);
    } catch (error) {
        console.error('Error sending email for job:', job.id, error);
    }
});

module.exports = emailQueue;