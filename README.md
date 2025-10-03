# Slack Bot API

This is a Node.js application using Express to interact with the Slack API for sending, scheduling, retrieving, editing, and deleting messages in Slack channels. The application uses the `axios` library to make API calls to Slack and requires a Slack Bot Token for authentication.

## Prerequisites

- **Node.js**: Version 14 or higher.
- **Slack Bot Token**: Obtain a bot token from your Slack app with the necessary permissions (`chat:write`, `conversations:read`, etc.).
- **Environment Configuration**: A `.env` file with your Slack Bot Token.

## Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Dependencies**
   ```bash
   npm install express axios dotenv
   ```

3. **Create a `.env` File**
   In the root directory, create a `.env` file and add your Slack Bot Token:
   ```env
   SLACK_BOT_TOKEN=your-slack-bot-token
   ```

4. **Start the Application**
   ```bash
   node index.js
   ```
   The server will run on `http://localhost:3000`.

## API Endpoints

### 1. Send a Message
- **Endpoint**: `POST /message/send`
- **Description**: Sends a message to a specified Slack channel.
- **Input Format**:
  ```json
  {
    "channel": "string", // Slack channel ID (e.g., "C12345678")
    "text": "string"    // Message content
  }
  ```
- **Parameters**:
  - `channel`: The ID of the Slack channel where the message will be sent.
  - `text`: The text content of the message.
- **Example**:
  ```bash
  curl -X POST http://localhost:3000/message/send \
  -H "Content-Type: application/json" \
  -d '{"channel": "C12345678", "text": "Hello, Slack!"}'
  ```

### 2. Schedule a Message
- **Endpoint**: `POST /message/schedule`
- **Description**: Schedules a message to be sent to a Slack channel at a specified date and time.
- **Input Format**:
  ```json
  {
    "channel": "string", // Slack channel ID (e.g., "C12345678")
    "text": "string",   // Message content
    "date": "string",   // Date in YYYY-MM-DD format
    "time": "string"    // Time in HH:MM format (24-hour)
  }
  ```
- **Parameters**:
  - `channel`: The ID of the Slack channel.
  - `text`: The text content of the message.
  - `date`: The date to schedule the message (e.g., "2025-10-04").
  - `time`: The time to schedule the message (e.g., "14:30").
- **Notes**:
  - The scheduled time must be in the future.
  - Date and time must be in valid formats, or a `400` error will be returned.
- **Example**:
  ```bash
  curl -X POST http://localhost:3000/message/schedule \
  -H "Content-Type: application/json" \
  -d '{"channel": "C12345678", "text": "Scheduled message", "date": "2025-10-04", "time": "14:30"}'
  ```

### 3. Retrieve Messages
- **Endpoint**: `GET /messages/:channel`
- **Description**: Retrieves the message history for a specified Slack channel.
- **Input Format**:
  - URL parameter: `channel` (Slack channel ID, e.g., "C12345678").
- **Parameters**:
  - `channel`: The ID of the Slack channel to retrieve messages from.
- **Response**:
  ```json
  {
    "success": true,
    "channel": "string",
    "message_count": number,
    "messages": array
  }
  ```
- **Notes**:
  - Messages are processed by the `prettifyConversationHistory` function (defined in `helper.js`) before being returned.
- **Example**:
  ```bash
  curl http://localhost:3000/messages/C12345678
  ```

### 4. Edit a Message
- **Endpoint**: `POST /message/edit`
- **Description**: Edits an existing message in a Slack channel.
- **Input Format**:
  ```json
  {
    "channel": "string", // Slack channel ID (e.g., "C12345678")
    "ts": "string",     // Timestamp of the message to edit
    "text": "string"    // Updated message content
  }
  ```
- **Parameters**:
  - `channel`: The ID of the Slack channel.
  - `ts`: The timestamp of the message to edit (obtained from message metadata).
  - `text`: The updated text content of the message.
- **Example**:
  ```bash
  curl -X POST http://localhost:3000/message/edit \
  -H "Content-Type: application/json" \
  -d '{"channel": "C12345678", "ts": "1631234567.123456", "text": "Updated message"}'
  ```

### 5. Delete a Message
- **Endpoint**: `POST /message/delete`
- **Description**: Deletes a message from a Slack channel.
- **Input Format**:
  ```json
  {
    "channel": "string", // Slack channel ID (e.g., "C12345678")
    "ts": "string"      // Timestamp of the message to delete
  }
  ```
- **Parameters**:
  - `channel`: The ID of the Slack channel.
  - `ts`: The timestamp of the message to delete.
- **Example**:
  ```bash
  curl -X POST http://localhost:3000/message/delete \
  -H "Content-Type: application/json" \
  -d '{"channel": "C12345678", "ts": "1631234567.123456"}'
  ```

## Testing the Application

1. **Ensure the Server is Running**
   ```bash
   node index.js
   ```
   Verify the console logs: `Backend running on http://localhost:3000`.

2. **Test with cURL or Postman**
   Use the example `curl` commands provided above to test each endpoint. Ensure you replace `C12345678` with a valid Slack channel ID and obtain a valid message `ts` (timestamp) for edit/delete operations from the `conversations.history` API response.

3. **Check Slack**
   - For `POST /message/send`, verify the message appears in the specified channel.
   - For `POST /message/schedule`, check Slack’s scheduled messages or wait for the message to post at the specified time.
   - For `GET /messages/:channel`, ensure the response contains the expected messages.
   - For `POST /message/edit`, confirm the message content updates in Slack.
   - For `POST /message/delete`, verify the message is removed from the channel.

## Notes

- Ensure the Slack Bot Token has the required scopes for each operation (`chat:write`, `chat:write.public`, `conversations:read`, etc.).
- The `prettifyConversationHistory` function (in `helper.js`) is assumed to format the message history for the `/messages/:channel` endpoint. Ensure this function exists and is correctly implemented.
- Error handling is implemented for invalid date/time formats and past schedule times in the `/message/schedule` endpoint.
- All API responses include Slack’s response data or an error message with an appropriate HTTP status code.

## Troubleshooting

- **401 Unauthorized**: Check if the Slack Bot Token is valid and has the required permissions.
- **400 Bad Request**: Verify the input format (e.g., correct channel ID, valid date/time for scheduling).
- **500 Internal Server Error**: Check the server logs for detailed error messages and ensure the Slack API is accessible.