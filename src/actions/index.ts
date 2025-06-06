import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import nodemailer from 'nodemailer'

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.coerce.string().min(2, 'Name is required'),
      email: z.coerce.string().email('Invalid email address'),
      message: z.coerce.string().min(5, 'Message is required'),
      hp: z.null(),
    }),
    handler: (input) => {
      const transporter = nodemailer.createTransport({
        sendmail: true,
      })

      transporter.sendMail(
        {
          from: 'no-reply@guillaumecatel.com',
          to: 'hello@guillaumecatel.com',
          subject: `New message from ${input.name} sent from guillaumecatel.com`,
          text: `
            Name: ${input.name}
            Email: ${input.email}
            Message:

            ${input.message}

            ---

            This message was sent from guillaumecatel.com.
            You can reply to this email to respond to the sender.
            This message was sent from the contact form on guillaumecatel.com.
          `,
        },
        (err) => {
          if (err) {
            console.error(err)
            return
          }
        },
      )

      return input
    },
  }),
}
