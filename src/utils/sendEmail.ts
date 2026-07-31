import nodemailer from "nodemailer";

export const sendEmail = async (
  email: string,
  subject: string,
  text: string,
  htmlMessage?: string,
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
    html: htmlMessage,
  });
};
