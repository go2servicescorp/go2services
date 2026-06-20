import { transporter } from "@/lib/email";

export async function POST(req: Request) {
  try {
    console.log({ req });
    const { fullName, email, phone, introduction, availableDates, room } =
      await req.json();

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.CONTACT_EMAIL,
      subject: `Website - ${room}`,
      text: `
        Room: ${room}

        Name: ${fullName}

        E-mail: ${email}

        Phone: ${phone}

        Introduction: ${introduction}

        Available Dates: ${availableDates}
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);

    return Response.json({ success: false }, { status: 500 });
  }
}
