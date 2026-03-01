const ADMIN_TOKEN = 'cardin2026'

export function isAdmin(req: Request): boolean {
  const token = req.headers.get('x-admin-token')
  return token === ADMIN_TOKEN
}
