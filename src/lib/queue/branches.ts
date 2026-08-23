import type { Branch } from "./types";

export const BRANCHES: Branch[] = [
  { id: "ashoknagar", name: "Ashok Nagar", area: "West Chennai", address: "4th Avenue, Ashok Nagar, Chennai 600083", capacity: 120, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1101" },
  { id: "mountroad", name: "Mount Road", area: "Anna Salai", address: "Anna Salai, Thousand Lights, Chennai 600002", capacity: 80, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1102" },
  { id: "porur", name: "Porur", area: "West Chennai", address: "Mount Poonamallee Road, Porur, Chennai 600116", capacity: 120, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1103" },
  { id: "tnagar", name: "T. Nagar", area: "Central", address: "South Usman Road, T. Nagar, Chennai 600017", capacity: 120, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1104" },
  { id: "pallavaram", name: "Pallavaram", area: "South", address: "GST Road, Pallavaram, Chennai 600043", capacity: 220, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1105" },
  { id: "medavakkam", name: "Medavakkam", area: "South", address: "Velachery Main Road, Medavakkam, Chennai 600100", capacity: 220, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1106" },
  { id: "ecr", name: "ECR", area: "East Coast", address: "East Coast Road, Neelankarai, Chennai 600115", capacity: 120, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1107" },
  { id: "navalur", name: "Navalur", area: "OMR", address: "Rajiv Gandhi Salai, Navalur, Chennai 600130", capacity: 120, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1108" },
  { id: "omr", name: "OMR", area: "IT Corridor", address: "OMR, Thoraipakkam, Chennai 600097", capacity: 120, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1109" },
  { id: "purasaiwakkam", name: "Purasaiwakkam", area: "North", address: "Purasawalkam High Road, Chennai 600007", capacity: 120, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1110" },
  { id: "annanagar", name: "Anna Nagar", area: "West", address: "2nd Avenue, Anna Nagar, Chennai 600040", capacity: 120, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1111" },
  { id: "velachery", name: "Velachery", area: "South", address: "Velachery Tambaram Road, Chennai 600042", capacity: 120, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1112" },
  { id: "urapakkam", name: "Urapakkam", area: "GST Road", address: "GST Road, Urapakkam, Chengalpattu 603210", capacity: 120, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1113" },
  { id: "koyambedu", name: "Koyambedu", area: "West", address: "100 Feet Road, Koyambedu, Chennai 600107", capacity: 120, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1114" },
  { id: "injambakkam", name: "Injambakkam", area: "ECR", address: "East Coast Road, Injambakkam, Chennai 600115", capacity: 120, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1115" },
  { id: "radialroad", name: "Radial Road", area: "Pallavaram", address: "Radial Road, Kovilambakkam, Chennai 600129", capacity: 120, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1116" },
  { id: "thiruverkadu", name: "Thiruverkadu", area: "West", address: "Avadi Road, Thiruverkadu, Chennai 600077", capacity: 120, hours: "6:00 AM – 2:00 AM", phone: "044 4000 1117" },
];

export const DEFAULT_BRANCH = "ashoknagar";

export const FLOORPLAN: { code: string; capacity: number; hall: "Hall A" | "Hall B" }[] = [
  { code: "S11", capacity: 4, hall: "Hall A" }, { code: "S12", capacity: 4, hall: "Hall A" },
  { code: "S13", capacity: 2, hall: "Hall A" }, { code: "S14", capacity: 4, hall: "Hall A" },
  { code: "S15", capacity: 4, hall: "Hall A" }, { code: "S16", capacity: 2, hall: "Hall A" },
  { code: "S17", capacity: 4, hall: "Hall A" }, { code: "S18", capacity: 4, hall: "Hall A" },
  { code: "S19", capacity: 2, hall: "Hall A" }, { code: "S20", capacity: 4, hall: "Hall A" },
  { code: "S21", capacity: 6, hall: "Hall A" }, { code: "S22", capacity: 4, hall: "Hall A" },
  { code: "S23", capacity: 4, hall: "Hall A" }, { code: "S24", capacity: 6, hall: "Hall A" },
  { code: "S31", capacity: 4, hall: "Hall A" }, { code: "S32", capacity: 4, hall: "Hall A" },
  { code: "S33", capacity: 4, hall: "Hall A" }, { code: "S34", capacity: 2, hall: "Hall A" },
  { code: "S35", capacity: 2, hall: "Hall A" }, { code: "S41", capacity: 4, hall: "Hall A" },
  { code: "S42", capacity: 2, hall: "Hall A" }, { code: "S43", capacity: 4, hall: "Hall A" },
  { code: "S44", capacity: 4, hall: "Hall A" }, { code: "S45", capacity: 4, hall: "Hall A" },
  { code: "S46", capacity: 4, hall: "Hall A" }, { code: "S47", capacity: 2, hall: "Hall A" },
  { code: "S48", capacity: 4, hall: "Hall A" }, { code: "S51", capacity: 4, hall: "Hall A" },
  { code: "S52", capacity: 2, hall: "Hall A" }, { code: "S53", capacity: 4, hall: "Hall A" },
  { code: "S60", capacity: 4, hall: "Hall A" }, { code: "S61", capacity: 4, hall: "Hall A" },
  { code: "S62", capacity: 4, hall: "Hall A" }, { code: "S63", capacity: 4, hall: "Hall A" },
  { code: "S64", capacity: 4, hall: "Hall A" }, { code: "S65", capacity: 4, hall: "Hall A" },
  { code: "S66", capacity: 4, hall: "Hall A" }, { code: "S67", capacity: 4, hall: "Hall B" },
  { code: "S68", capacity: 4, hall: "Hall B" }, { code: "S69", capacity: 4, hall: "Hall B" },
  { code: "S70", capacity: 4, hall: "Hall B" }, { code: "S71", capacity: 4, hall: "Hall B" },
  { code: "S72", capacity: 4, hall: "Hall B" }, { code: "S73", capacity: 4, hall: "Hall B" },
  { code: "S74", capacity: 4, hall: "Hall B" }, { code: "S75", capacity: 4, hall: "Hall B" },
  { code: "S76", capacity: 4, hall: "Hall B" }, { code: "S77", capacity: 4, hall: "Hall B" },
  { code: "S78", capacity: 4, hall: "Hall B" },
];

export function getBranch(id: string): Branch | undefined {
  return BRANCHES.find((b) => b.id === id);
}

export const WAIT_MIN_PER_PARTY = 8;
