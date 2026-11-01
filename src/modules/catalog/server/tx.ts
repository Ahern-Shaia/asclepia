import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { Db } from "@/server/db";

export type Tx = Prisma.TransactionClient;
export type Client = Db | Tx;
