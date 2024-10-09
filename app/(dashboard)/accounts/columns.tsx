"use client"

import { client } from "@/lib/hono"
import { ColumnDef } from "@tanstack/react-table"
import { InferResponseType } from "hono"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
// export type Payment = {
//   id: string
//   amount: number
//   status: "pending" | "processing" | "success" | "failed"
//   email: string
// }

export type ResponseType = InferResponseType<typeof client.api.tokens.$get, 200>["data"][0];

export const columns: ColumnDef<ResponseType>[] = [
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "symbol",
    header: "Symbol"
  },
  {
    accessorKey: "creator",
    header: "Creator"
  },
]
  