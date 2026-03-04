import { Router, Request, Response, NextFunction } from "express";
import type { IRouter } from "express";
import { Todo } from "../models/Todo";

const router: IRouter = Router();

/**
 * @openapi
 * /api/todos:
 *   get:
 *     summary: Retrieve all todos
 *     description: Returns all todo items sorted by creation date in descending order (newest first).
 *     tags:
 *       - Todos
 *     responses:
 *       200:
 *         description: A list of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *       500:
 *         description: Database query failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch todos
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

/**
 * @openapi
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     description: Creates a new todo item with the given title and optional description. The done field defaults to false.
 *     tags:
 *       - Todos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Buy groceries
 *               description:
 *                 type: string
 *                 example: Milk, eggs, bread
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Title is missing or empty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Title is required
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { title, description } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  try {
    const todo = await Todo.create({ title, description });
    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/todos/{id}:
 *   put:
 *     summary: Update a todo
 *     description: Updates the title and description of an existing todo item.
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Buy groceries (updated)
 *               description:
 *                 type: string
 *                 example: Milk, eggs, bread, butter
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Title is missing or empty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Title is required
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Todo not found
 */
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const { title, description } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true },
    );

    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.json(todo);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/todos/{id}/done:
 *   patch:
 *     summary: Toggle todo done status
 *     description: Toggles the done field of a todo item (true to false or false to true).
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The todo ID
 *     responses:
 *       200:
 *         description: Todo done status toggled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Todo not found
 */
router.patch(
  "/:id/done",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const todo = await Todo.findById(req.params.id);

      if (!todo) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }

      todo.done = !todo.done;
      await todo.save();

      res.json(todo);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     description: Deletes a todo item by its ID.
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The todo ID
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Todo deleted successfully
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Todo not found
 */
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const todo = await Todo.findByIdAndDelete(req.params.id);

      if (!todo) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }

      res.json({ message: "Todo deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
