export const users = new Map<string, { username: string; password: string }>()

export function register(username: string, password: string) {
    if (users.has(username)) return false
    users.set(username, { username, password })
    return true
}

export function login(username: string, password: string) {
    const user = users.get(username)
    if (!user) return false
    return user.password === password
}
