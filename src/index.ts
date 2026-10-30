
import Fastify from "fastify";
import { registerHealthRoutes } from "./routes/health.js";
import { registerRepositoryRoutes } from "./routes/repository.js";
import { registerSearchRoutes } from "./routes/search.js";
import { PORT } from "./config.js";
import { registerGitHubRoutes } from "./routes/github.js";


const app = Fastify();
registerHealthRoutes(app);
registerRepositoryRoutes(app);
registerGitHubRoutes(app);
registerSearchRoutes(app);

app.get("/", async () => {
  return { message: "RepoLens development server is running!" };
});



app.setNotFoundHandler((request, reply) => {
  return reply.code(404).send({
    statusCode: 404,
    error: "Not Found",
    message: `Route ${request.url} does not exist`
  });
});


async function start() {
  try {
    await app.listen({ port: PORT });
    console.log(`Server running at http://localhost:${PORT}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

start();
