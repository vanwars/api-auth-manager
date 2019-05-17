const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
exports.send_email = (message, error) => {
    const msg = {
        to: 'vanwars@gmail.com',
        from: 'vanwars@northwestern.edu',
        subject: 'API Tutor Error: ' + message,
        html: `
            Error Message: ${error}<br>
            Error: ${error}
        `,
    };
    sgMail.send(msg);
}