const sgMail = require('@sendgrid/mail');
// const sendgridAPIKey = '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';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// sgMail.send({
//     to: 'orenrs101@gmail.com',
//     from: 'orenrs101@gmail.com',
//     subject: 'Sending email from Task App Test',
//     text: 'I hope this one actually get to you'
// });

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'orenrs101@gmail.com',
        subject: 'Thanks for joining my App !',
        text: `Weolcome to the App, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'orenrs101@gmail.com',
        subject: 'Goodbye! We cancelled your account',
        text: `Goodbye ${name}. Please let us know why you cancelled you account so we can improve our app.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}