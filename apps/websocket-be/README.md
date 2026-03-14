# websocket-be

Express + WebSocket server for realtime messaging.

## Run

```bash
pnpm --filter websocket-be dev
```

## WS Endpoint

- URL: `ws://localhost:8090/ws?token=<JWT>`

### Client Messages

- Join room:

```json
{ "type": "join_room", "roomId": "room_123" }
```

- Leave room:

```json
{ "type": "leave_room", "roomId": "room_123" }
```

## Internal Broadcast Endpoint

Used by `primary-be` after persisting a message.

- `POST /internal/events/chat-message`
- Header: `x-internal-secret: <INTERNAL_EVENT_SECRET>`
- Body:

```json
{
  "roomId": "room_123",
  "message": {
    "id": "msg_123",
    "content": "Hello",
    "messageType": "TEXT",
    "fileUrl": null,
    "isAnnouncement": false,
    "isPinned": false,
    "createdAt": "2026-03-14T10:00:00.000Z",
    "sender": {
      "id": "user_1",
      "name": "Alice",
      "role": "STUDENT"
    }
  }
}
```
