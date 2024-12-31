import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendInvitationEmail = async (
  email: string,
  token: string,
  groupName: string,
) => {
  const inviteUrl = `${process.env.FRONTEND_URL}/invite/${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Invitation à rejoindre le groupe ${groupName} sur Hubidays`,
    html: `
      <h1>Vous avez été invité à rejoindre ${groupName} sur Hubidays</h1>
      <p>Pour accepter l'invitation, cliquez sur le lien suivant (valable 48h) :</p>
      <a href="${inviteUrl}">${inviteUrl}</a>
    `,
  });
};