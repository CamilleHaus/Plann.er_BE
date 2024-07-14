import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer"


export async function confirmTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get("/trips/:tripId/confirm", {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            })
        }
    }, async (request, reply) => {

        const { tripId } = request.params

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            },
            include: {
                participants: {
                    where: {
                        is_owner: false
                    }
                }
            }
        })

        if (!trip) {
            throw new Error("Trip not found")
        }

        if (trip.is_confirmed) { //Aqui não faz sentido o usuário confirmar uma viagem que já foi confirmada anteriormente
            return reply.redirect(`http://localhost:3000/trips/${tripId}`) // Redirecionando o usuário para a página da viagem
        }

        await prisma.trip.update({
            where: { id: tripId },
            data: { is_confirmed: true }
        })

        const formattedStartDate = dayjs(trip.starts_at).format('LL')
        const formattedEndDate = dayjs(trip.ends_at).format('LL')


        const mail = getMailClient()


        await Promise.all(
            trip.participants.map(async (participant) => {

                const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm`


                const message = await (await mail).sendMail({
                    from: {
                        name: 'Equipe Plann.er',
                        address: 'oi@plann.er'
                    },
                    to: participant.email,
                    subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
                    html: `
                    <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6">
                    <p>Você foi convidado para participar de uma viagem para <strong>${trip.destination}, Brasil</strong> nas datas de <strong>${formattedStartDate} até ${formattedEndDate}</strong> </p>
                    <p></p>
                    <p>Para confirmar a sua presença viagem, clique no link abaixo: </p>
                    <p></p>
                    <a href="${confirmationLink}">Confirmar viagem</a>
                    <p></p>
                    <p>Caso você não saiba do que se trata esse email, por favor, apenas ignore.</p>
                    </div>
                    `.trim()
                })

                console.log(nodemailer.getTestMessageUrl(message))
            })
        ) //Esse metodo permite que tudo dentro da promise aconteça em paralelo porém o código só vai continuar quando tudo dentro dele for executado e enviado
        // Ele espera um array de promises como parametro

        return reply.redirect(`http://localhost:3000/trips/${tripId}`)
    })
}


