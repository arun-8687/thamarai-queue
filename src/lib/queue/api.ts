import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { BRANCHES, DEFAULT_BRANCH, FLOORPLAN, WAIT_MIN_PER_PARTY, getBranch } from "./branches";
import { sessionIST, todayIST } from "./clock";
import type { BoardPayload, Branch, Callout, QueueToken, SeatRow, SessionName, TokenStatus } from "./types";

const QR_SECRET = new TextEncoder().encode("thamarai-queue-demo-hs256-key-32b!");

const branchIdZ = z.string().min(2).max(40);
const nameZ = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters")
  .regex(/^[A-Za-zÀ-ÿ .'-]+$/, "Name can only contain letters, spaces, dots, hyphens, and apostrophes");

function last4FromPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const ten = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (ten.length !== 10) throw new Error("Enter a valid 10-digit phone number (or 12 digits starting with 91)");
  return ten.slice(-4);
}

type Sql = Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>;

async function db() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

async function ensureSeats(sql: Sql, branchId: string) {
  const n = await sql<{ n: number }>`select count(*)::int as n from seats where branch_id = ${branchId}`;
  if ((n[0]?.n ?? 0) > 0) return;
  for (const s of FLOORPLAN) {
    const id = `${branchId}:${s.code}`;
    const label = `Table ${s.code.slice(1)}`;
    await sql`
      insert into seats (id, branch_id, seat_code, label, capacity, hall, reserved)
      values (${id}, ${branchId}, ${s.code}, ${label}, ${s.capacity}, ${s.hall}, ${false})
      on conflict (id) do nothing
    `;
  }
}

async function ensureSeed(sql: Sql, branchId?: string) {
  const flag = await sql<{ v: string }>`select v from seed_meta where k = ${"branches"}`;
  if (flag[0]?.v !== "ok") {
    for (const b of BRANCHES) {
      await sql`
        insert into branches (id, name, area, address, capacity, hours, phone)
        values (${b.id}, ${b.name}, ${b.area}, ${b.address}, ${b.capacity}, ${b.hours}, ${b.phone})
        on conflict (id) do nothing
      `;
    }
    await sql`insert into seed_meta (k, v) values (${"branches"}, ${"ok"}) on conflict (k) do update set v = ${"ok"}`;
  }
  await ensureSeats(sql, branchId ?? DEFAULT_BRANCH);
  const date = todayIST();
  const session = sessionIST();
  const demoFlag = await sql<{ v: string }>`select v from seed_meta where k = ${"demo"}`;
  if (demoFlag[0]?.v === "ok") return;
  await ensureSeats(sql, DEFAULT_BRANCH);
  const existing = await sql<{ n: number }>`
    select count(*)::int as n from tokens where branch_id = ${DEFAULT_BRANCH} and service_date = ${date}
  `;
  if ((existing[0]?.n ?? 0) === 0) {
    const demo: { no: string; label: string; last4: string; guests: number; notes: string; split: boolean; status: TokenStatus; seat?: string }[] = [
      { no: "412", label: "Meena Iyer", last4: "1101", guests: 4, notes: "", split: false, status: "seated", seat: "S51" },
      { no: "228", label: "Karthik R", last4: "8821", guests: 2, notes: "", split: false, status: "seated", seat: "S22" },
      { no: "901", label: "Venkat Raman", last4: "4402", guests: 6, notes: "Window if possible", split: false, status: "seated", seat: "S32" },
      { no: "173", label: "Sita Narayan", last4: "7730", guests: 8, notes: "Birthday", split: true, status: "seated", seat: "S71" },
      { no: "556", label: "Kumar", last4: "2199", guests: 2, notes: "", split: false, status: "seated", seat: "S13" },
      { no: "668", label: "Lakshmi P", last4: "3308", guests: 6, notes: "", split: false, status: "waiting" },
      { no: "486", label: "Arvind", last4: "5512", guests: 2, notes: "Senior citizen", split: false, status: "waiting" },
      { no: "470", label: "Nithya S", last4: "9091", guests: 9, notes: "Two children", split: true, status: "waiting" },
      { no: "813", label: "Prakash", last4: "1004", guests: 1, notes: "", split: false, status: "waiting" },
      { no: "840", label: "Divya S", last4: "6677", guests: 5, notes: "", split: false, status: "notified" },
      { no: "728", label: "Ramesh Babu", last4: "4242", guests: 6, notes: "", split: false, status: "waiting" },
      { no: "601", label: "Anjali", last4: "8181", guests: 3, notes: "", split: false, status: "waiting" },
    ];
    let i = 0;
    for (const d of demo) {
      const id = crypto.randomUUID();
      const created = new Date(Date.now() - (demo.length - i) * 90_000).toISOString();
      await sql`
        insert into tokens (id, branch_id, token_no, service_date, session, guest_label, phone_last4, guests, notes, allow_split, status, notified, created_at, seated_at)
        values (${id}, ${DEFAULT_BRANCH}, ${d.no}, ${date}, ${session}, ${d.label}, ${d.last4}, ${d.guests}, ${d.notes}, ${d.split}, ${d.status}, ${d.status === "notified"}, ${created}, ${d.status === "seated" ? created : null})
      `;
      if (d.seat) {
        const seatId = `${DEFAULT_BRANCH}:${d.seat}`;
        await sql`insert into seatings (token_id, seat_id, guests) values (${id}, ${seatId}, ${d.guests})`;
      }
      i += 1;
    }
  }
  await sql`insert into seed_meta (k, v) values (${"demo"}, ${"ok"}) on conflict (k) do update set v = ${"ok"}`;
}

function mapToken(row: { id: string; token_no: string; guest_label: string; phone_last4: string; guests: number; notes: string; allow_split: boolean; status: string; notified: boolean; created_at: string; seated_at: string | null }, extras: { position: number | null; estimatedWaitMin: number; tables: QueueToken["tables"] }): QueueToken {
  return {
    id: row.id, tokenNo: row.token_no, guestLabel: row.guest_label, phoneLast4: row.phone_last4,
    guests: Number(row.guests), notes: row.notes, allowSplit: Boolean(row.allow_split),
    status: row.status as TokenStatus, notified: Boolean(row.notified),
    createdAt: typeof row.created_at === "string" ? row.created_at : new Date(row.created_at).toISOString(),
    seatedAt: row.seated_at ? (typeof row.seated_at === "string" ? row.seated_at : new Date(row.seated_at).toISOString()) : null,
    estimatedWaitMin: extras.estimatedWaitMin, position: extras.position, tables: extras.tables,
  };
}

async function loadTables(sql: Sql, tokenId: string) {
  const rows = await sql<{ seat_code: string; label: string; capacity: number }>`
    select s.seat_code, s.label, s.capacity from seatings st join seats s on s.id = st.seat_id where st.token_id = ${tokenId} order by s.seat_code`;
  return rows.map((r) => ({ seatCode: r.seat_code, label: r.label, capacity: Number(r.capacity) }));
}

export const listBranches = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  await ensureSeed(sql);
  const date = todayIST();
  const counts = await sql<{ branch_id: string; n: number }>`
    select branch_id, count(*)::int as n from tokens where service_date = ${date} and status in ('waiting','notified') group by branch_id`;
  const map = new Map(counts.map((c) => [c.branch_id, Number(c.n)]));
  return BRANCHES.map((b) => ({ ...b, waiting: map.get(b.id) ?? 0 }));
});

export const issueRegistration = createServerFn({ method: "POST" }).validator(z.object({ branchId: branchIdZ })).handler(async ({ data }) => {
  if (!getBranch(data.branchId)) throw new Error("Unknown branch");
  const sql = await db();
  await ensureSeed(sql, data.branchId);
  const { jwt, joinUrl } = await makeJoinQr(data.branchId, todayIST(), sessionIST());
  return { rt: jwt, joinUrl, branchId: data.branchId };
});

export const verifyRegistration = createServerFn({ method: "POST" }).validator(z.object({ rt: z.string().min(20), branchId: branchIdZ.optional() })).handler(async ({ data }) => {
  const parsed = await parseRegistration(data.rt);
  if (data.branchId && data.branchId !== parsed.branchId) throw new Error("This code belongs to a different branch");
  return { ok: true as const, branch: getBranch(parsed.branchId)!, session: parsed.time };
});

export const getBoard = createServerFn({ method: "GET" }).validator(z.object({ branchId: branchIdZ })).handler(async ({ data }) => {
  const sql = await db();
  await ensureSeed(sql, data.branchId);
  return loadBoard(sql, data.branchId);
});

async function makeJoinQr(branchId: string, date: string, session: SessionName) {
  const { SignJWT } = await import("jose");
  const qr = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const jwt = await new SignJWT({ type: "registration", qr, date, time: session, branchId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("3h").sign(QR_SECRET);
  let origin = "";
  try { const { getRequestUrl } = await import("@tanstack/react-start/server"); origin = getRequestUrl().origin; } catch { origin = ""; }
  const joinUrl = `${origin}/request?rt=${encodeURIComponent(jwt)}&branchId=${encodeURIComponent(branchId)}`;
  let qrDataUrl: string | null = null;
  try { const QR = await import("qrcode"); qrDataUrl = await QR.toDataURL(joinUrl, { margin: 1, width: 360, color: { dark: "#1c1410", light: "#fffaf3" } }); } catch { qrDataUrl = null; }
  return { qrDataUrl, joinUrl, jwt };
}

async function parseRegistration(rt: string) {
  const { jwtVerify } = await import("jose");
  const { payload } = await jwtVerify(rt, QR_SECRET);
  const branchId = String(payload.branchId ?? "");
  const date = String(payload.date ?? "");
  const time = String(payload.time ?? "");
  if (payload.type !== "registration" || !getBranch(branchId)) throw new Error("Invalid entrance code");
  if (date !== todayIST()) throw new Error("This entrance code is for a different day. Please scan today's QR.");
  return { branchId, date, time };
}

async function loadBoard(sql: Sql, branchId: string): Promise<BoardPayload> {
  const branch = getBranch(branchId);
  if (!branch) throw new Error("Unknown branch");
  const date = todayIST();
  const session = sessionIST();
  const tokenRows = await sql<{ id: string; token_no: string; guest_label: string; phone_last4: string; guests: number; notes: string; allow_split: boolean; status: string; notified: boolean; created_at: string; seated_at: string | null }>`
    select id, token_no, guest_label, phone_last4, guests, notes, allow_split, status, notified, created_at, seated_at
    from tokens where branch_id = ${branchId} and service_date = ${date} and status in ('waiting','notified','seated') order by created_at asc`;
  const waiting = tokenRows.filter((t) => t.status === "waiting" || t.status === "notified");
  const seatedRows = tokenRows.filter((t) => t.status === "seated");
  const queue: QueueToken[] = waiting.map((row, i) => mapToken(row, { position: i + 1, estimatedWaitMin: i * WAIT_MIN_PER_PARTY, tables: [] }));
  const seated: QueueToken[] = [];
  for (const row of seatedRows) seated.push(mapToken(row, { position: null, estimatedWaitMin: 0, tables: await loadTables(sql, row.id) }));
  const seatRows = await sql<{ id: string; seat_code: string; label: string; capacity: number; hall: string; reserved: boolean; occupancy: number | null }>`
    select s.id, s.seat_code, s.label, s.capacity, s.hall, s.reserved, coalesce(sum(st.guests), 0)::int as occupancy
    from seats s left join seatings st on st.seat_id = s.id where s.branch_id = ${branchId}
    group by s.id, s.seat_code, s.label, s.capacity, s.hall, s.reserved order by s.hall, s.seat_code`;
  const occupants = await sql<{ seat_id: string; token_no: string }>`
    select st.seat_id, t.token_no from seatings st join tokens t on t.id = st.token_id join seats s on s.id = st.seat_id where s.branch_id = ${branchId}`;
  const bySeat = new Map<string, string[]>();
  for (const o of occupants) { const list = bySeat.get(o.seat_id) ?? []; list.push(o.token_no); bySeat.set(o.seat_id, list); }
  const seats: SeatRow[] = seatRows.map((s) => ({ id: s.id, branchId, seatCode: s.seat_code, label: s.label, capacity: Number(s.capacity), hall: s.hall, reserved: Boolean(s.reserved), occupancy: Number(s.occupancy ?? 0), tokenNos: bySeat.get(s.id) ?? [] }));
  const counts = await sql<{ status: string; n: number }>`select status, count(*)::int as n from tokens where branch_id = ${branchId} and service_date = ${date} group by status`;
  const byStatus: Record<string, number> = {};
  for (const c of counts) byStatus[c.status] = Number(c.n);
  const occ = seats.reduce((n, s) => n + s.occupancy, 0);
  const cap = seats.reduce((n, s) => n + s.capacity, 0);
  const callRows = await sql<{ token_no: string; guest_label: string; table_label: string; created_at: string }>`select token_no, guest_label, table_label, created_at from callouts where branch_id = ${branchId} order by created_at desc limit 1`;
  let callout: Callout | null = null;
  if (callRows[0]) {
    const created = typeof callRows[0].created_at === "string" ? callRows[0].created_at : new Date(callRows[0].created_at).toISOString();
    if (Date.now() - new Date(created).getTime() < 25_000) callout = { tokenNo: callRows[0].token_no, guestLabel: callRows[0].guest_label, tableLabel: callRows[0].table_label, createdAt: created };
  }
  const { qrDataUrl, joinUrl } = await makeJoinQr(branchId, date, session);
  return { branch, date, session, queue, seated, seats, callout, qrDataUrl, joinUrl, stats: { waiting: (byStatus.waiting ?? 0) + (byStatus.notified ?? 0), seated: byStatus.seated ?? 0, completed: byStatus.completed ?? 0, occupancy: occ, capacity: cap } };
}

export const registerToken = createServerFn({ method: "POST" }).validator(z.object({ rt: z.string().min(20), name: nameZ, phone: z.string().min(8).max(16), guests: z.number().int().min(1).max(20), notes: z.string().max(80).optional().default(""), allowSplit: z.boolean().optional().default(false) })).handler(async ({ data }) => {
  const parsed = await parseRegistration(data.rt);
  const last4 = last4FromPhone(data.phone);
  const sql = await db();
  await ensureSeed(sql, parsed.branchId);
  const date = todayIST();
  const session = sessionIST();
  let tokenNo = "";
  for (let attempt = 0; attempt < 12; attempt++) {
    tokenNo = String(100 + Math.floor(Math.random() * 900));
    const clash = await sql<{ n: number }>`select count(*)::int as n from tokens where branch_id = ${parsed.branchId} and service_date = ${date} and token_no = ${tokenNo}`;
    if ((clash[0]?.n ?? 0) === 0) break;
    tokenNo = "";
  }
  if (!tokenNo) throw new Error("Could not allocate a token. Try again.");
  const id = crypto.randomUUID();
  await sql`insert into tokens (id, branch_id, token_no, service_date, session, guest_label, phone_last4, guests, notes, allow_split, status, notified) values (${id}, ${parsed.branchId}, ${tokenNo}, ${date}, ${session}, ${data.name.trim()}, ${last4}, ${data.guests}, ${data.notes ?? ""}, ${data.allowSplit ?? false}, ${"waiting"}, ${false})`;
  const ahead = await sql<{ n: number }>`select count(*)::int as n from tokens where branch_id = ${parsed.branchId} and service_date = ${date} and status in ('waiting','notified')`;
  const position = Number(ahead[0]?.n ?? 1);
  return { tokenNo, branchId: parsed.branchId, last4, guestLabel: data.name.trim(), guests: data.guests, position, estimatedWaitMin: Math.max(0, position - 1) * WAIT_MIN_PER_PARTY };
});

export const lookupToken = createServerFn({ method: "POST" }).validator(z.object({ branchId: branchIdZ, tokenNo: z.string().min(1).max(6), last4: z.string().regex(/^\d{4}$/, "Enter the last 4 digits") })).handler(async ({ data }) => {
  const sql = await db();
  await ensureSeed(sql, data.branchId);
  const branch = getBranch(data.branchId);
  if (!branch) throw new Error("Unknown branch");
  const date = todayIST();
  const rows = await sql<{ id: string; token_no: string; guest_label: string; phone_last4: string; guests: number; notes: string; allow_split: boolean; status: string; notified: boolean; created_at: string; seated_at: string | null }>`
    select id, token_no, guest_label, phone_last4, guests, notes, allow_split, status, notified, created_at, seated_at from tokens where branch_id = ${data.branchId} and service_date = ${date} and token_no = ${data.tokenNo.trim()} limit 1`;
  const row = rows[0];
  if (!row || row.phone_last4 !== data.last4) throw new Error("Token not found. Check the number and last 4 digits.");
  const waiting = await sql<{ id: string }>`select id from tokens where branch_id = ${data.branchId} and service_date = ${date} and status in ('waiting','notified') order by created_at asc`;
  const idx = waiting.findIndex((w) => w.id === row.id);
  const position = idx >= 0 ? idx + 1 : null;
  const tables = await loadTables(sql, row.id);
  return { token: mapToken(row, { position, estimatedWaitMin: position ? (position - 1) * WAIT_MIN_PER_PARTY : 0, tables }), branch, ahead: position ? position - 1 : 0 };
});

export const notifyToken = createServerFn({ method: "POST" }).validator(z.object({ tokenId: z.string().min(8) })).handler(async ({ data }) => {
  const sql = await db();
  const rows = await sql<{ id: string; branch_id: string; token_no: string; guest_label: string; status: string }>`select id, branch_id, token_no, guest_label, status from tokens where id = ${data.tokenId}`;
  const t = rows[0];
  if (!t) throw new Error("Token not found");
  if (t.status !== "waiting" && t.status !== "notified") throw new Error("Token is not waiting");
  await sql`update tokens set status = ${"notified"}, notified = ${true} where id = ${t.id}`;
  await sql`insert into callouts (branch_id, token_no, guest_label, table_label) values (${t.branch_id}, ${t.token_no}, ${t.guest_label}, ${"Please come to the desk"})`;
  return { ok: true as const };
});

export const cancelToken = createServerFn({ method: "POST" }).validator(z.object({ tokenId: z.string().min(8) })).handler(async ({ data }) => {
  const sql = await db();
  const rows = await sql<{ status: string }>`select status from tokens where id = ${data.tokenId}`;
  if (!rows[0]) throw new Error("Token not found");
  if (rows[0].status === "seated") throw new Error("Free the table before removing this token");
  await sql`update tokens set status = ${"cancelled"} where id = ${data.tokenId} and status in ('waiting','notified')`;
  return { ok: true as const };
});

export const seatToken = createServerFn({ method: "POST" }).validator(z.object({ tokenId: z.string().min(8), seatIds: z.array(z.string()).min(1).max(6), squeeze: z.boolean().optional().default(false) })).handler(async ({ data }) => {
  const sql = await db();
  const tokens = await sql<{ id: string; branch_id: string; token_no: string; guest_label: string; guests: number; allow_split: boolean; status: string }>`select id, branch_id, token_no, guest_label, guests, allow_split, status from tokens where id = ${data.tokenId}`;
  const token = tokens[0];
  if (!token) throw new Error("Token not found");
  if (token.status === "completed" || token.status === "cancelled") throw new Error("Token is no longer active");
  const seats: { id: string; label: string; capacity: number; occupancy: number; reserved: boolean }[] = [];
  for (const seatId of data.seatIds) {
    const found = await sql<{ id: string; label: string; capacity: number; occupancy: number; reserved: boolean }>`
      select s.id, s.label, s.capacity, s.reserved, coalesce(sum(st.guests),0)::int as occupancy from seats s left join seatings st on st.seat_id = s.id where s.id = ${seatId} group by s.id, s.label, s.capacity, s.reserved`;
    if (found[0]) seats.push(found[0]);
  }
  if (seats.length !== data.seatIds.length) throw new Error("One or more tables were not found");
  for (const s of seats) { if (s.reserved) throw new Error(`${s.label} is reserved`); }
  const totalCap = seats.reduce((n, s) => n + Math.max(0, Number(s.capacity) - Number(s.occupancy)), 0);
  const guests = Number(token.guests);
  if (!data.squeeze && totalCap < guests) throw new Error("Those tables do not have enough free seats. Enable squeeze or pick another table.");
  if (seats.length > 1 && !token.allow_split && !data.squeeze) throw new Error("This party did not allow splitting across tables");
  await sql`delete from seatings where token_id = ${token.id}`;
  let remaining = guests;
  for (const s of seats) {
    const take = Math.min(remaining, Math.max(1, guests));
    await sql`insert into seatings (token_id, seat_id, guests) values (${token.id}, ${s.id}, ${take})`;
    remaining -= take;
  }
  await sql`update tokens set status = ${"seated"}, seated_at = now(), notified = ${true} where id = ${token.id}`;
  const labels = seats.map((s) => s.label).join(", ");
  await sql`insert into callouts (branch_id, token_no, guest_label, table_label) values (${token.branch_id}, ${token.token_no}, ${token.guest_label}, ${labels})`;
  return { ok: true as const, tableLabel: labels };
});

export const completeToken = createServerFn({ method: "POST" }).validator(z.object({ tokenId: z.string().min(8) })).handler(async ({ data }) => {
  const sql = await db();
  await sql`delete from seatings where token_id = ${data.tokenId}`;
  await sql`update tokens set status = ${"completed"}, completed_at = now() where id = ${data.tokenId} and status = ${"seated"}`;
  return { ok: true as const };
});

export const reserveSeat = createServerFn({ method: "POST" }).validator(z.object({ seatId: z.string(), reserved: z.boolean() })).handler(async ({ data }) => {
  const sql = await db();
  await sql`update seats set reserved = ${data.reserved} where id = ${data.seatId}`;
  return { ok: true as const };
});

export const getReports = createServerFn({ method: "GET" }).validator(z.object({ branchId: branchIdZ })).handler(async ({ data }) => {
  const sql = await db();
  await ensureSeed(sql, data.branchId);
  const date = todayIST();
  const rows = await sql<{ token_no: string; guest_label: string; guests: number; status: string; created_at: string; seated_at: string | null; completed_at: string | null }>`
    select token_no, guest_label, guests, status, created_at, seated_at, completed_at from tokens where branch_id = ${data.branchId} and service_date = ${date} order by created_at asc`;
  const hourly: Record<string, number> = {};
  let waitAcc = 0, waitN = 0, tableAcc = 0, tableN = 0, guestAcc = 0;
  for (const r of rows) {
    const created = new Date(r.created_at);
    const hour = created.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false });
    const bucket = `${hour.slice(0, 2)}:00`;
    hourly[bucket] = (hourly[bucket] ?? 0) + 1;
    guestAcc += Number(r.guests);
    if (r.seated_at) { waitAcc += (new Date(r.seated_at).getTime() - created.getTime()) / 60000; waitN += 1; }
    if (r.seated_at && r.completed_at) { tableAcc += (new Date(r.completed_at).getTime() - new Date(r.seated_at).getTime()) / 60000; tableN += 1; }
  }
  return {
    date, total: rows.length,
    waiting: rows.filter((r) => r.status === "waiting" || r.status === "notified").length,
    seated: rows.filter((r) => r.status === "seated").length,
    completed: rows.filter((r) => r.status === "completed").length,
    avgParty: rows.length ? Math.round((guestAcc / rows.length) * 10) / 10 : 0,
    avgWaitMin: waitN ? Math.round(waitAcc / waitN) : 0,
    avgTableMin: tableN ? Math.round(tableAcc / tableN) : 0,
    hours: Object.keys(hourly).sort().map((h) => ({ hour: h, tokens: hourly[h] })),
    recent: rows.slice(-12).reverse().map((r) => ({ tokenNo: r.token_no, guestLabel: r.guest_label, guests: Number(r.guests), status: r.status, createdAt: typeof r.created_at === "string" ? r.created_at : new Date(r.created_at).toISOString() })),
  };
});

export type BranchListItem = Branch & { waiting: number };
