import nodemailer from "nodemailer";

export async function getMailClient() {
    const account = await nodemailer.createTestAccount() // Para testes direito dentro do Nodemailer

    const transport = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: account.user,
            pass: account.pass
        }
    })

    return transport
}