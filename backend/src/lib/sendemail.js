import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,      // your email
        pass: process.env.EMAIL_PASS,      // app password (NOT normal password)
      },
    });

    const mailOptions = {
      from: `"GossApp" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent to:", to);

  } catch (error) {
    console.error("❌ Email error:", error);
    throw new Error("Email sending failed");
  }
};