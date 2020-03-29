class Client {
  constructor () {
    this._clients = []
  }

  update (username, socketId) {
    if (!socketId || !username) {
      return
    }

    const client = this._clients.find(client => client.username === username)
    if (!client) {
      this._clients.push({
        id: socketId,
        username
      })
    } else {
      client.id = socketId
    }
  }

  getClientByUsername (username) {
    return this._clients.find(client => client.username === username)
  }

  getClientBySocketId (socketId) {
    return this._clients.find(client => client.id === socketId)
  }

  __fetchAllClients () {
    return this._clients
  }
}

export default Client
