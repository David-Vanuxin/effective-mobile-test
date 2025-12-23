const { createHash } = await import("node:crypto")

export default function calcHash(str: string) {
  const hash = createHash("md5")
  hash.update(str)
  return hash.copy().digest("hex")
}
