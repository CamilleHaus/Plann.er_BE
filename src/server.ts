import fastify from "fastify";
import cors from "@fastify/cors";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { createTrip } from "./routes/create-trip";
import { confirmTrip } from "./routes/confirm-trip";

const app = fastify()

app.register(cors, {
    origin: '*' //Para desenvolvimento, tudo bem deixar assim  para deixar que qualquer frontend acesse a nossa rota
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip)
app.register(confirmTrip)

app.listen({ port: 3333 }, () => {
    console.log("Server running!")
})