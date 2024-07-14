import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";

export async function updateTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().put("/trips/:tripId", {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            }),
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(), // Converte o valor vindo de uma string para um formato de data
                ends_at: z.coerce.date(),
            })
        }
    }, async (request) => {
        const { tripId } = request.params
        const { destination, starts_at, ends_at } = request.body

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }
        })

        if (!trip) {
            throw new ClientError("Trip not found")
        }

        if (dayjs(starts_at).isBefore(new Date())) {
            throw new ClientError("Invalid trip start date")
        }

        if (dayjs(ends_at).isBefore(starts_at)) {
            throw new ClientError("Invalid trip end date")
        }

        // await prisma.$transaction - Uma forma de comunicar ao prisma que estamos rodando varias queries e que se uma falhar, nós desfazemos as que foram bem sucedidas

        await prisma.trip.update({
            where: {
                id: tripId
            },
            data: {
                destination,
                starts_at, 
                ends_at
            }
        })

        return { tripId: trip.id }
    })
}