export type TokenStatus =
  | "waiting"
  | "notified"
  | "seated"
  | "completed"
  | "cancelled";

export type SessionName = "morning" | "afternoon" | "evening" | "night";

export type Branch = {
  id: string;
  name: string;
  area: string;
  address: string;
  capacity: number;
  hours: string;
  phone: string;
};

export type SeatRow = {
  id: string;
  branchId: string;
  seatCode: string;
  label: string;
  capacity: number;
  hall: string;
  reserved: boolean;
  occupancy: number;
  tokenNos: string[];
};

export type QueueToken = {
  id: string;
  tokenNo: string;
  guestLabel: string;
  phoneLast4: string;
  guests: number;
  notes: string;
  allowSplit: boolean;
  status: TokenStatus;
  notified: boolean;
  createdAt: string;
  seatedAt: string | null;
  estimatedWaitMin: number;
  position: number | null;
  tables: { seatCode: string; label: string; capacity: number }[];
};

export type Callout = {
  tokenNo: string;
  guestLabel: string;
  tableLabel: string;
  createdAt: string;
};

export type BoardPayload = {
  branch: Branch;
  date: string;
  session: SessionName;
  queue: QueueToken[];
  seated: QueueToken[];
  seats: SeatRow[];
  callout: Callout | null;
  qrDataUrl: string | null;
  joinUrl: string;
  stats: {
    waiting: number;
    seated: number;
    completed: number;
    occupancy: number;
    capacity: number;
  };
};

export type TokenLookup = {
  token: QueueToken;
  branch: Branch;
  ahead: number;
};
