import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todo API",
      version: "1.0.0",
      description: "RESTful API for managing TODO items",
    },
    components: {
      schemas: {
        Todo: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "The auto-generated ID of the todo",
            },
            title: {
              type: "string",
              description: "The title of the todo",
            },
            description: {
              type: "string",
              description: "The description of the todo",
            },
            done: {
              type: "boolean",
              description: "Whether the todo is completed",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "The creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "The last update timestamp",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
