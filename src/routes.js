class Routes {
  constructor (socket) {
    this.socket = socket
  }

  getDefault (req, res) {
    res.send({
      sts: 0,
      isHome: 0
    })
  }

  getActiveMatches (req, res) {
    res.send(this.socket.getMatches())
  }

  getMatchIdByCode (req, res) {
    const { code } = req.params
    const matches = this.socket.getMatches()
    const match = matches.find(match => match.code === code)
    res.send({
      code: match ? match.id : ''
    })
  }
}

export default Routes
