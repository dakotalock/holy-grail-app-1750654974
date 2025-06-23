// netlify/functions/chat.js

/**
 * @file Netlify Function for the EchoBot: Simple Chat Demo backend.
 * @description This file implements the serverless backend for the Incredibly Simple Chat Bot.
 * It uses Node.js with Express, wrapped by `serverless-http`, to provide a single API endpoint
 * for processing user messages and returning a bot response.
 *
 * @improvementFocus This backend exemplifies a minimalist, robust full stack integration,
 * designed for clear deployment on Netlify to minimize debug cycles.
 */

// 1. Use Node.js with Express and other necessary modules
const express = require('express');
const serverless = require('serverless-http'); // Required to run Express within a serverless function
const cors = require('cors'); // For Cross-Origin Resource Sharing support

// 2. Initialize an Express application
const app = express();

// 7. Include CORS support
// This middleware enables CORS for all origins, allowing your frontend to
// make requests to this Netlify Function. In a production environment,
// consider restricting this to specific allowed origins for enhanced security.
app.use(cors());

// Middleware to parse JSON request bodies.
// This is essential for receiving the 'message' parameter from the frontend.
app.use(express.json());

// 3. Include all specified API endpoints
// Endpoint Name: /api/chat
// Method: POST
// Path: /.netlify/functions/chat (This is the external path Netlify exposes.
//       Within the Express app, it's treated as the root '/')

app.post('/', (req, res) => {
    /**
     * @api {post} / Send Chat Message
     * @apiName PostChatMessage
     * @apiGroup Chat
     *
     * @apiDescription Receives a user message and returns a simple, predefined bot response
     *                 or simply echoes the input.
     *
     * @apiParam {String} message (Required) The user's message to the bot.
     * @apiParamExample {json} Request-Example:
     *     {
     *       "message": "Hello there!"
     *     }
     *
     * @apiSuccess {String} botResponse The bot's simple, predefined reply.
     * @apiSuccessExample {json} Success-Response-Echo:
     *     HTTP/1.1 200 OK
     *     {
     *       "botResponse": "You said: 'Hello there!'"
     *     }
     * @apiSuccessExample {json} Success-Response-Static:
     *     HTTP/1.1 200 OK
     *     {
     *       "botResponse": "Hello! I am a simple bot."
     *     }
     *
     * @apiError (400 Bad Request) InvalidInput The `message` parameter is missing, empty, or not a string.
     * @apiErrorExample {json} Error-400-InvalidInput:
     *     HTTP/1.1 400 Bad Request
     *     {
     *       "error": "Message parameter is required and must be a non-empty string."
     *     }
     *
     * @apiError (500 Internal Server Error) ServerError An unexpected error occurred on the server side.
     * @apiErrorExample {json} Error-500-InternalError:
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *       "error": "An unexpected error occurred while processing your request."
     *     }
     */
    try {
        // 8. Add request validation
        const { message } = req.body;

        // Check if message is provided, is a string, and is not empty after trimming whitespace.
        if (!message || typeof message !== 'string' || message.trim() === '') {
            // 4. Add proper error handling: 400 Bad Request
            console.error('Validation Error: Message parameter is missing or invalid.');
            return res.status(400).json({ 
                error: 'Message parameter is required and must be a non-empty string.' 
            });
        }

        // Core Purpose: Generate the bot's response.
        // As per the technical plan, for ultimate simplicity, it will echo the input.
        const botResponse = `You said: '${message}'`;

        // Log the interaction for debugging/monitoring purposes (visible in Netlify function logs)
        console.log(`Received user message: "${message}"`);
        console.log(`Sending bot response: "${botResponse}"`);

        // Send a 200 OK response with the bot's reply in JSON format.
        res.status(200).json({ botResponse });

    } catch (error) {
        // 4. Add proper error handling: 500 Internal Server Error
        // Catch any unexpected errors during the function execution.
        console.error('Internal Server Error during chat processing:', error);
        res.status(500).json({ 
            error: 'An unexpected error occurred while processing your request.' 
        });
    }
});

// 6. Export handler properly for Netlify
// This is the crucial step that makes your Express app compatible with Netlify Functions.
// `serverless(app)` wraps your Express application, allowing Netlify to invoke it
// as a standard serverless function.
exports.handler = serverless(app);

/*
Detailed Code Comments & Explanation:

1.  **`netlify/functions/chat.js`**: This file adheres to the specified Netlify Functions structure (`netlify/functions/chat.js`).
    *   The technical plan indicated `netlify/functions/chat.js` for the function file, while the final requirements listed `netlify/functions/api.js`. I've prioritized the detailed plan's `chat.js` for consistency with the `/api/chat` endpoint naming and the specific "chat bot" context.

2.  **Node.js with Express**:
    *   `const express = require('express');`: Imports the Express framework.
    *   `const serverless = require('serverless-http');`: This library is essential. Netlify Functions provide a standard serverless runtime environment (receiving an `event` object and returning a `response` object), not a traditional Express server. `serverless-http` acts as an adapter, allowing you to write your backend logic using familiar Express routes and middleware, and then seamlessly deploy it as a serverless function.
    *   `const app = express();`: Initializes your Express application.

3.  **API Endpoint (`POST /`)**:
    *   `app.post('/', ...)`: Defines a POST route handler at the root path (`/`). When deployed to Netlify, this function will be accessible at `/.netlify/functions/chat`. The `serverless-http` package handles the routing of requests from Netlify's endpoint to this root path within your Express app.
    *   **Parameters (Request Body - JSON)**: The function expects a JSON body with a `message` field, as specified. `app.use(express.json());` ensures this body is correctly parsed.
    *   **Response (JSON)**: It returns a JSON object with a `botResponse` field, either a static reply or an echo of the user's input, matching the plan's examples.
    *   **Status Codes**:
        *   `200 OK`: For successful processing.
        *   `400 Bad Request`: If the `message` parameter is missing or invalid.
        *   `500 Internal Server Error`: For any unexpected server-side issues.

4.  **Error Handling**:
    *   A `try...catch` block wraps the main logic to gracefully handle unexpected errors and return a `500 Internal Server Error` response.
    *   Specific validation checks are in place for the `message` parameter. If it's missing, not a string, or empty, a `400 Bad Request` response is sent, providing clear feedback to the client. `console.error` statements are used for server-side logging, which Netlify collects.

5.  **Code Comments**: Extensive comments are provided throughout the code to explain each section's purpose, adherence to requirements, and technical details. API documentation comments (JSDoc-style) are included for clarity on the endpoint's usage.

6.  **Proper Handler Export for Netlify**:
    *   `exports.handler = serverless(app);`: This is the standard way to export a Netlify Function. `serverless(app)` transforms your Express app into a handler function that Netlify can execute.

7.  **CORS Support**:
    *   `const cors = require('cors');` and `app.use(cors());`: The `cors` middleware is included and enabled for all origins. This is crucial for local development and often for production, as your frontend (served by Netlify's static site hosting) might be considered a different origin from your Netlify Function, even if on the same Netlify domain.

8.  **Request Validation**:
    *   `if (!message || typeof message !== 'string' || message.trim() === '')`: This line performs the validation, ensuring the `message` is present, is a string, and contains actual content (not just whitespace).

**To deploy this backend:**

1.  **Dependencies**: Ensure you have a `package.json` file in your repository root (or within the `netlify/functions` directory if you prefer per-function dependencies) with `express`, `serverless-http`, and `cors` listed under `dependencies`.