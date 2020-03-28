class Client {
  constructor () {
    this.clients = []
  }

  update (clientId, username) {
    if (!clientId || !username) {
      return
    }

    const client = this.clients.find(client => client.username === username)
    if (!client.length) {
      this.clients.push({
        id: clientId,
        username
      })
    } else {
      client.id = clientId
    }
  }

  getClientIdByUsername (username) {
    return this.clients.find(client => client.username === username)
  }
}

export default Client
