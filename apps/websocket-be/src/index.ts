import 'dotenv/config';
import http from 'node:http';
import cors from 'cors';
import express, { type Request } from 'express';
import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';
import { prisma } from 'db';

type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

type JwtPayload = {
  id: string;
  instituteId: string;
  role: UserRole;
};

type ConnectedClient = {
  userId: string;
  instituteId: string;
  role: UserRole;
  roomIds: Set<string>;
};

type JoinRoomMessage = {
  type: 'join_room';
  roomId: string;
};

type LeaveRoomMessage = {
  type: 'leave_room';
  roomId: string;
};

type ClientMessage = JoinRoomMessage | LeaveRoomMessage;

type OutgoingChatMessageEvent = {
  type: 'chat_message';
  roomId: string;
  message: unknown;
};

type InternalChatEventRequest = {
  roomId: string;
  message: unknown;
};

const PORT = Number(process.env.PORT ?? 8090);
const JWT_SECRET = process.env.JWT_SECRET ?? '';
const INTERNAL_EVENT_SECRET = process.env.INTERNAL_EVENT_SECRET ?? '';

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
    credentials: true,
  }),
);
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const clients = new Map<WebSocket, ConnectedClient>();
const roomMembers = new Map<string, Set<WebSocket>>();

function parseTokenFromRequest(
  req: Request | http.IncomingMessage,
): string | null {
  if ('headers' in req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }
  }

  if ('url' in req && req.url) {
    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    const queryToken = url.searchParams.get('token');
    if (queryToken) return queryToken;
  }

  return null;
}

function verifyToken(token: string): JwtPayload | null {
  if (!JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || typeof decoded !== 'object') return null;

    const payload = decoded as Partial<JwtPayload>;
    if (!payload.id || !payload.instituteId || !payload.role) return null;

    return {
      id: payload.id,
      instituteId: payload.instituteId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

function extractSessionTokenFromCookie(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;

  for (const pair of cookieHeader.split(';')) {
    const [rawName, ...rawValueParts] = pair.trim().split('=');
    if (rawName !== 'session') continue;
    const rawValue = rawValueParts.join('=');
    if (!rawValue) return null;
    return decodeURIComponent(rawValue);
  }

  return null;
}

async function resolveUserFromSession(
  sessionToken: string,
): Promise<JwtPayload | null> {
  try {
    const session = await prisma.session.findFirst({
      where: { token: sessionToken },
      select: {
        user: {
          select: {
            id: true,
            instituteId: true,
            role: true,
          },
        },
      },
    });

    if (!session?.user) return null;

    return {
      id: session.user.id,
      instituteId: session.user.instituteId,
      role: session.user.role as UserRole,
    };
  } catch {
    return null;
  }
}

function leaveAllRooms(ws: WebSocket): void {
  const client = clients.get(ws);
  if (!client) return;

  for (const roomId of client.roomIds) {
    const members = roomMembers.get(roomId);
    if (!members) continue;
    members.delete(ws);
    if (members.size === 0) roomMembers.delete(roomId);
  }

  client.roomIds.clear();
}

function joinRoom(ws: WebSocket, roomId: string): void {
  const client = clients.get(ws);
  if (!client) return;

  if (!roomMembers.has(roomId)) {
    roomMembers.set(roomId, new Set<WebSocket>());
  }

  roomMembers.get(roomId)?.add(ws);
  client.roomIds.add(roomId);
}

function leaveRoom(ws: WebSocket, roomId: string): void {
  const client = clients.get(ws);
  if (!client) return;

  roomMembers.get(roomId)?.delete(ws);
  if (roomMembers.get(roomId)?.size === 0) {
    roomMembers.delete(roomId);
  }
  client.roomIds.delete(roomId);
}

function safeJsonParse(raw: string): ClientMessage | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ClientMessage>;
    if (!parsed?.type || typeof parsed.type !== 'string') return null;

    if (parsed.type === 'join_room' || parsed.type === 'leave_room') {
      if (typeof parsed.roomId !== 'string' || !parsed.roomId.trim())
        return null;
      return parsed as ClientMessage;
    }

    return null;
  } catch {
    return null;
  }
}

function broadcastToRoom(
  roomId: string,
  payload: OutgoingChatMessageEvent,
): void {
  const members = roomMembers.get(roomId);
  if (!members || members.size === 0) return;

  const serialized = JSON.stringify(payload);
  for (const ws of members) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(serialized);
    }
  }
}

wss.on('connection', (ws, req) => {
  void (async () => {
    const sessionToken = extractSessionTokenFromCookie(req.headers.cookie);
    let payload: JwtPayload | null = null;

    if (sessionToken) {
      payload = await resolveUserFromSession(sessionToken);
    }

    // Optional fallback for non-browser clients that pass bearer JWT.
    if (!payload) {
      const bearerToken = parseTokenFromRequest(req);
      if (bearerToken) {
        payload = verifyToken(bearerToken);
      }
    }

    if (!payload) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    clients.set(ws, {
      userId: payload.id,
      instituteId: payload.instituteId,
      role: payload.role,
      roomIds: new Set<string>(),
    });

    ws.send(
      JSON.stringify({
        type: 'connected',
        userId: payload.id,
        instituteId: payload.instituteId,
        role: payload.role,
      }),
    );

    ws.on('message', (data) => {
      const message = safeJsonParse(data.toString());
      if (!message) return;

      if (message.type === 'join_room') {
        joinRoom(ws, message.roomId);
        ws.send(
          JSON.stringify({ type: 'room_joined', roomId: message.roomId }),
        );
        return;
      }

      if (message.type === 'leave_room') {
        leaveRoom(ws, message.roomId);
        ws.send(JSON.stringify({ type: 'room_left', roomId: message.roomId }));
      }
    });

    ws.on('close', () => {
      leaveAllRooms(ws);
      clients.delete(ws);
    });
  })();
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'websocket-be' });
});

app.post('/internal/events/chat-message', (req, res) => {
  const providedSecret = req.header('x-internal-secret');
  if (!INTERNAL_EVENT_SECRET || providedSecret !== INTERNAL_EVENT_SECRET) {
    return res
      .status(401)
      .json({ error: 'Unauthorized internal event request' });
  }

  const body = req.body as Partial<InternalChatEventRequest>;
  if (!body?.roomId || typeof body.roomId !== 'string') {
    return res.status(400).json({ error: 'roomId is required' });
  }

  broadcastToRoom(body.roomId, {
    type: 'chat_message',
    roomId: body.roomId,
    message: body.message ?? null,
  });

  return res.json({
    ok: true,
    deliveredTo: roomMembers.get(body.roomId)?.size ?? 0,
  });
});

server.listen(PORT, () => {
  console.log(`websocket-be listening on port ${PORT}`);
});
