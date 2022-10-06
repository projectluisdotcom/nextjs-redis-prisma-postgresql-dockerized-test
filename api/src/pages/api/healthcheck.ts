import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    res.status(405).send("Method Not Allowed")
    return
  }

  res.setHeader("Cache-Control", "no-cache")
  res.status(200).json({ status: "ok" })
}

export default handler
