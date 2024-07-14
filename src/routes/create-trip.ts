import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer"
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export async function createTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("/trips", {
        schema: {
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(), // Converte o valor vindo de uma string para um formato de data
                ends_at: z.coerce.date(),
                owner_name: z.string(),
                owner_email: z.string().email(),
                emails_to_invite: z.array(z.string().email())
            })
        }
    }, async (request) => {
        const { destination, starts_at, ends_at, owner_name, owner_email, emails_to_invite } = request.body

        if (dayjs(starts_at).isBefore(new Date())) {
            throw new ClientError("Invalid trip start date")
        }

        if (dayjs(ends_at).isBefore(starts_at)) {
            throw new ClientError("Invalid trip end date")
        }

        // await prisma.$transaction - Uma forma de comunicar ao prisma que estamos rodando varias queries e que se uma falhar, nós desfazemos as que foram bem sucedidas

        const trip = await prisma.trip.create({
            data: {
                destination,
                starts_at,
                ends_at,
                participants: {
                    createMany: {
                        data: [
                            {
                                name: owner_name,
                                email: owner_email,
                                is_owner: true,
                                is_confirmed: true
                            },
                            ...emails_to_invite.map((email) => {
                                return { email } //Espalhando o array criando no map dentro do array de data para cada email ser considerado na hora da criação
                            })
                        ]
                    }
                }
            }
        })

        const formattedStartDate = dayjs(starts_at).format('LL')
        const formattedEndDate = dayjs(ends_at).format('LL')


        const confirmationLink = `${env.API_BASE_URL}/trips/${trip.id}/confirm`

        const mail = getMailClient()

        const message = await (await mail).sendMail({
            from: {
                name: 'Equipe Plann.er',
                address: 'oi@plann.er'
            },
            to: {
                name: owner_name,
                address: owner_email
            },
            subject: `Confirme sua viagem para ${destination}`,
            html: `
            <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6">
            <p>Você solicitou a criação de uma viagem para <strong>${destination}, Brasil</strong> nas datas de <strong>${formattedStartDate} até ${formattedEndDate}</strong> </p>
            <p></p>
            <p>Para confirmar a sua viagem, clique no link abaixo: </p>
            <p></p>
            <a href="${confirmationLink}">Confirmar viagem</a>
            <p></p>
            <p>Caso você não saiba do que se trata esse email, por favor, apenas ignore.</p>
            </div>
            `.trim()
        })

        console.log(nodemailer.getTestMessageUrl(message))

        return { tripId: trip.id }
    })
}