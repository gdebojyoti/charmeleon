class Client {
  constructor () {
    this._clients = []
  }

  update (username, clientId) {
    if (!clientId || !username) {
      return
    }

    const client = this._clients.find(client => client.username === username)
    if (!client) {
      this._clients.push({
        id: clientId,
        username
      })
    } else {
      client.id = clientId
    }
  }

  getClientIdByUsername (username) {
    return this._clients.find(client => client.username === username)
  }

  __fetchAllClients () {
    return this._clients
  }
}

export default Client
