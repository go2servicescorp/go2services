import { transporter } from "@/lib/email";

export async function POST(req: Request) {
  try {
    console.log({ req });
    const { fullName, email, subject, message } = await req.json();

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.CONTACT_EMAIL,
      subject: `Website = ${subject}`,
      text: `
        Name: ${fullName}

        E-mail: ${email}

        Message: ${message}
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);

    return Response.json({ success: false }, { status: 500 });
  }
}
