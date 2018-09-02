import Eos from 'eosjs'
// import val from 'validator'

const state = {
  eosconfig: {
    httpEndpoint: 'http://api-kylin.eoshenzhen.io:8890',
    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
    pp: 'ppppp',
    expireInSeconds: 60,
    broadcast: true,
    debug: false,
    sign: true
  },
  connectionTimeout: 5000,
  getInfo: null,
  endpoints: [
    {url: 'http://api-kylin.eoshenzhen.io:8890', ping: 0, lastConnection: 0}
  ],
  currentEndpoint: {url: 'http://api-kylin.eoshenzhen.io:8890', ping: 0, lastConnection: 0},
  endpointConnectionStatus: 10,
  endpointRefreshInterval: 5000,
  currentMatch: {opponent: null, matchid: null, host: null},
  matchRequests: [],
  matchRequested: []
}

const mutations = {
  UPDATE_MATCH_REQUESTS (state, requests) {
    state.matchRequests = requests
  },
  UPDATE_MATCH_REQUESTED (state, requests) {
    state.matchRequested = requests
  },
  SET_CURRENT_MATCH (state, matchObj) {
    state.currentMatch.opponent = matchObj.opponent
    state.currentMatch.matchid = matchObj.matchid
    state.currentMatch.host = matchObj.host
  },
  PING_ENDPOINT_SUCCESS (state, payload) {
    state.currentEndpoint.ping = payload.ping
    state.endpointConnectionStatus = 0
    state.currentEndpoint.lastConnection = Math.round(new Date().getTime() / 1000)
    state.getInfo = payload.getInfo
    let current = state.endpoints.find(current => {
      return current.url === state.currentEndpoint.url
    })
    current.ping = payload.ping
    current.lastConnection = Math.round(new Date().getTime() / 1000)
  },
  PING_ENDPOINT_FAIL (state) {
    state.endpointConnectionStatus = 1
  },
  DISCONNECT_ENDPOINT (state) {
    state.endpointConnectionStatus = 1
    state.currentEndpoint = null
    state.eosconfig.httpEndpoint = ''
  },
  USE_ENDPOINT (state, endpoint) {
    state.currentEndpoint = endpoint
    state.eosconfig.httpEndpoint = state.currentEndpoint.url
  },
  ADD_ENDPOINT (state, endpoint) {
    state.endpoints.push({url: endpoint, ping: 0, lastConnection: 0})
  },
  REMOVE_ENDPOINT (state, endpoint, active) {
    let removeEndpoint = state.endpoints.map(function (item) {
      return item.url
    }).indexOf(endpoint.url)
    state.endpoints.splice(removeEndpoint, 1)
    if (active) {
      state.currentEndpoint = null
      state.eosconfig.httpEndpoint = ''
    }
  }
}

const actions = {
  pingEndpoint ({commit, state}) {
    // debugger
    // console.log('pingEndpoint', state.eosconfig)
    return new Promise((resolve, reject) => {
      if (state.currentEndpoint !== null) {
        let eos = Eos(state.eosconfig)
        let pingStart = new Date().getTime()
        let timeout = setTimeout(function () {
          reject(Error('timeout'))
        }, state.connectionTimeout)
        eos.getInfo({}).then((res) => {
          clearTimeout(timeout)
          let ping = new Date().getTime() - pingStart
          commit('PING_ENDPOINT_SUCCESS', {getInfo: res, ping: ping})
          resolve(res)
        }, (err) => {
          clearTimeout(timeout)
          if (err) {
            commit('PING_ENDPOINT_FAIL')
            reject(Error('failed'))
          }
        })
      } else {
        commit('PING_ENDPOINT_FAIL')
        reject(Error('noEnpoint'))
      }
    })
  },
  useEndpoint ({commit, state, dispatch}, endpoint) {
    return new Promise((resolve, reject) => {
      let find = state.endpoints.find(find => {
        return find.url === endpoint
      })
      if (find) {
        commit('DISCONNECT_ENDPOINT')
        commit('USE_ENDPOINT', find)
        dispatch('pingEndpoint').then((res) => {
          resolve()
        }, (err) => {
          if (err) {
            commit('DISCONNECT_ENDPOINT')
            reject(err)
          }
        })
      }
    })
  },
  findAccount ({commit, state}, account) {
    return new Promise((resolve, reject) => {
      let eos = Eos(state.eosconfig)
      eos.getAccount({account_name: account}).then((res) => {
        resolve(res)
      }, (err) => {
        if (err) {
          reject(Error('notFound'))
        }
      })
    })
  },
  disconnectEndpoint ({commit, state}) {
    return new Promise((resolve, reject) => {
      commit('DISCONNECT_ENDPOINT')
      resolve()
    })
  },
  addEndpoint ({commit, state}, endpoint) {
    commit('EXTEND_UNLOCK')
    return new Promise((resolve, reject) => {
      let find = state.endpoints.find(find => {
        return find.url === endpoint
      })
      if (find) {
        reject(Error())
      } else {
        commit('ADD_ENDPOINT', endpoint)
        resolve()
      }
    })
  },
  removeEndpoint ({commit, state}, endpoint) {
    return new Promise((resolve, reject) => {
      let find = state.endpoints.find(find => {
        return find.url === endpoint
      })
      if (find) {
        if (state.currentEndpoint && find.url === state.currentEndpoint.url) {
          commit('REMOVE_ENDPOINT', find, true)
        } else {
          commit('REMOVE_ENDPOINT', find, false)
        }
        resolve()
      }
    })
  },
  getCurrentMatchSet ({commit, state, rootState}) {
    return new Promise((resolve, reject) => {
      let tscope
      if (state.currentMatch.host) {
        tscope = rootState.wallet.wallet.name
      } else {
        tscope = state.currentMatch.opponent
      }
      let parameters = {
        json: true,
        scope: tscope,
        code: 'chess',
        table: 'matches',
        limit: 1,
        lower_bound: state.currentMatch.matchid
      }
      let conf = Object.assign({}, state.eosconfig)
      conf.scope = ['chess', tscope].sort()
      let eos = Eos(conf)
      eos.getTableRows(parameters).then((res) => {
        resolve(res.rows[0])
      }, (err) => {
        if (err) {
          reject(err)
        }
      })
    })
  },
  setCurrentMatch ({commit, state}, matchObj) {
    commit('EXTEND_UNLOCK')
    return new Promise((resolve, reject) => {
      commit('SET_CURRENT_MATCH', matchObj)
      resolve()
    })
  },
  requestMatch ({commit, state, rootState}, matchObj) {
    console.log('commit', commit)
    console.log('state', state)
    console.log('rootState', rootState)
    console.log('matchObj', matchObj)
    commit('EXTEND_UNLOCK')
    return new Promise((resolve, reject) => {
      console.log('state.eosconfig', state.eosconfig)
      let newpp = Object.assign({chainId: '8be32650b763690b95b7d7e32d7637757a0a7392ad04f1c393872e525a2ce82b'}, state.eosconfig)
      console.log('newpp', newpp)
      let conf = Object.assign({}, newpp)
      console.log('qian conf:', conf)
      conf.keyProvider = rootState.wallet.privateKey
      conf.authorization = rootState.wallet.wallet.name + '@active'
      conf.scope = [rootState.wallet.wallet.name, matchObj.opponent, 'chess'].sort()
      console.log([rootState.wallet.wallet.name, 'chess', matchObj.opponent])
      let eos = Eos(conf)
      console.log('conf: ', conf)
      eos.contract('chess').then(chess => {
        eos.transaction({
          scope: conf.scope,
          actions: [
            {
              account: 'chess',
              type: 'newmatch',
              authorization: [{
                actor: rootState.wallet.wallet.name,
                permission: 'active'
              }],
              data: {
                player: rootState.wallet.wallet.name,
                side: matchObj.side,
                opponent: matchObj.opponent,
                maxmoveinterval: Number(matchObj.maxmoveinterval)
              }
            }
          ]
        }).then((res) => {
          resolve(res)
        }, (err) => {
          if (JSON.parse(err).details.slice(0, 2) === '10') {
            let details = JSON.parse(err).details
            let errString1 = details.substring(details.lastIndexOf('{"s":"') + 1, details.lastIndexOf('","ptr"'))
            let errString = errString1.split('"')[3]
            reject(Error(errString))
          } else {
            reject(err)
          }
        })
      })
    })
  },
  updateMatchRequests ({commit, state, rootState}) {
    return new Promise((resolve, reject) => {
      let parameters = {json: true, scope: rootState.wallet.wallet.name, code: 'chess', table: 'requests'}
      let conf = Object.assign({}, state.eosconfig)
      conf.scope = ['chess', rootState.wallet.wallet.name].sort()
      let eos = Eos(conf)
      eos.getTableRows(parameters).then((res) => {
        if (res && res.rows.length > 0) {
          for (let i = 0; i < res.rows.length; i++) {
            res.rows[i].host = false
          }
          commit('UPDATE_MATCH_REQUESTS', res.rows)
        }
        resolve(res)
      }, (err) => {
        if (err) {
          reject(err)
        }
      })
    })
  },
  updateMatchRequested ({commit, state, rootState}) {
    return new Promise((resolve, reject) => {
      let parameters = {json: true, scope: rootState.wallet.wallet.name, code: 'chess', table: 'requested'}
      let conf = Object.assign({}, state.eosconfig)
      conf.scope = ['chess', rootState.wallet.wallet.name].sort()
      let eos = Eos(conf)
      eos.getTableRows(parameters).then((res) => {
        if (res && res.rows.length > 0) {
          for (let i = 0; i < res.rows.length; i++) {
            res.rows[i].host = true
          }
          commit('UPDATE_MATCH_REQUESTED', res.rows)
        }
        resolve(res)
      }, (err) => {
        if (err) {
          reject(err)
        }
      })
    })
  },
  acceptMatch ({commit, state, rootState}, opponent) {
    commit('EXTEND_UNLOCK')
    return new Promise((resolve, reject) => {
      let conf = Object.assign({}, state.eosconfig)
      conf.keyProvider = rootState.wallet.privateKey
      conf.authorization = rootState.wallet.wallet.name + '@active'
      conf.scope = [rootState.wallet.wallet.name, opponent, 'chess'].sort()
      let eos = Eos(conf)
      eos.contract('chess').then(chess => {
        eos.transaction({
          scope: conf.scope,
          actions: [
            {
              code: 'chess',
              type: 'acceptmatch',
              authorization: [{
                account: rootState.wallet.wallet.name,
                permission: 'active'
              }],
              data: {
                player: rootState.wallet.wallet.name,
                opponent: opponent
              }
            }
          ]
        }).then((res) => {
          resolve(res)
        }, (err) => {
          if (JSON.parse(err).details.slice(0, 2) === '10') {
            let details = JSON.parse(err).details
            let errString1 = details.substring(details.lastIndexOf('{"s":"') + 1, details.lastIndexOf('","ptr"'))
            let errString = errString1.split('"')[3]
            reject(Error(errString))
          } else {
            reject(err)
          }
        })
      })
    })
  },
  declineMatch ({commit, state, rootState}, opponent) {
    commit('EXTEND_UNLOCK')
    return new Promise((resolve, reject) => {
      let conf = Object.assign({}, state.eosconfig)
      conf.keyProvider = rootState.wallet.privateKey
      conf.authorization = rootState.wallet.wallet.name + '@active'
      conf.scope = [rootState.wallet.wallet.name, opponent, 'chess'].sort()
      let eos = Eos(conf)
      eos.contract('chess').then(chess => {
        eos.transaction({
          scope: conf.scope,
          actions: [
            {
              code: 'chess',
              type: 'declinematch',
              authorization: [{
                account: rootState.wallet.wallet.name,
                permission: 'active'
              }],
              data: {
                player: rootState.wallet.wallet.name,
                opponent: opponent
              }
            }
          ]
        }).then((res) => {
          resolve(res)
        }, (err) => {
          if (JSON.parse(err).details.slice(0, 2) === '10') {
            let details = JSON.parse(err).details
            let errString1 = details.substring(details.lastIndexOf('{"s":"') + 1, details.lastIndexOf('","ptr"'))
            let errString = errString1.split('"')[3]
            reject(Error(errString))
          } else {
            reject(err)
          }
        })
      })
    })
  },
  checkCost ({commit, state, rootState, dispatch}, tradeFormatted) {
    commit('EXTEND_UNLOCK')
    return new Promise((resolve, reject) => {
      let option = tradeFormatted[0]
      let amt = tradeFormatted[1]
      console.log('option', option)
      console.log('amt', amt)
      // resolve(tradeFormatted)
      // // .then((res) => {
      // // }, (err) => {

      let tscope = rootState.wallet.wallet.name
      let conf = Object.assign({}, state.eosconfig)
      conf.keyProvider = rootState.wallet.privateKey
      conf.authorization = rootState.wallet.wallet.name + '@active'
      conf.scope = ['chess', rootState.wallet.wallet.name, state.currentMatch.opponent].sort()
      let eos = Eos(conf)
      eos.contract('eoshenzhensg').then(chess => {
        eos.transaction({
          scope: conf.scope,
          actions: [
            {
              code: 'eoshenzhensg',
              type: 'eoshenzhensg',
              authorization: [{
                account: rootState.wallet.wallet.name,
                permission: 'active'
              }],
              data: {
                matchid: state.currentMatch.matchid,
                steps: tradeFormatted,
                player: rootState.wallet.wallet.name,
                host: tscope
              }
            }
          ]
        }).then((res) => {
          dispatch('updateMatch')
          resolve(res)
        }, (err) => {
          if (JSON.parse(err).details.slice(0, 2) === '10') {
            let details = JSON.parse(err).details
            let errString1 = details.substring(details.lastIndexOf('{"s":"') + 1, details.lastIndexOf('","ptr"'))
            let errString = errString1.split('"')[3]
            reject(Error(errString))
          } else {
            reject(err)
          }
        })
      })
    })
  },
  sendMove ({commit, state, rootState, dispatch}, steps) {
    commit('EXTEND_UNLOCK')
    return new Promise((resolve, reject) => {
      let tscope
      if (state.currentMatch.host) {
        tscope = rootState.wallet.wallet.name
      } else {
        tscope = state.currentMatch.opponent
      }
      let conf = Object.assign({}, state.eosconfig)
      conf.keyProvider = rootState.wallet.privateKey
      conf.authorization = rootState.wallet.wallet.name + '@active'
      conf.scope = ['chess', rootState.wallet.wallet.name, state.currentMatch.opponent].sort()
      let eos = Eos(conf)
      eos.contract('chess').then(chess => {
        eos.transaction({
          scope: conf.scope,
          actions: [
            {
              code: 'chess',
              type: 'movepiece',
              authorization: [{
                account: rootState.wallet.wallet.name,
                permission: 'active'
              }],
              data: {
                matchid: state.currentMatch.matchid,
                steps: steps,
                player: rootState.wallet.wallet.name,
                host: tscope
              }
            }
          ]
        }).then((res) => {
          dispatch('updateMatch')
          resolve(res)
        }, (err) => {
          if (JSON.parse(err).details.slice(0, 2) === '10') {
            let details = JSON.parse(err).details
            let errString1 = details.substring(details.lastIndexOf('{"s":"') + 1, details.lastIndexOf('","ptr"'))
            let errString = errString1.split('"')[3]
            reject(Error(errString))
          } else {
            reject(err)
          }
        })
      })
    })
  },
  sendCastleMove ({commit, state, rootState, dispatch}, long) {
    commit('EXTEND_UNLOCK')
    return new Promise((resolve, reject) => {
      let tscope
      if (state.currentMatch.host) {
        tscope = rootState.wallet.wallet.name
      } else {
        tscope = state.currentMatch.opponent
      }
      let conf = Object.assign({}, state.eosconfig)
      conf.keyProvider = rootState.wallet.privateKey
      conf.authorization = rootState.wallet.wallet.name + '@active'
      conf.scope = ['chess', rootState.wallet.wallet.name, state.currentMatch.opponent].sort()
      let eos = Eos(conf)
      eos.contract('chess').then(chess => {
        eos.transaction({
          scope: conf.scope,
          actions: [
            {
              code: 'chess',
              type: 'castling',
              authorization: [{
                account: rootState.wallet.wallet.name,
                permission: 'active'
              }],
              data: {
                matchid: state.currentMatch.matchid,
                type: long,
                player: rootState.wallet.wallet.name,
                host: tscope
              }
            }
          ]
        }).then((res) => {
          dispatch('updateMatch')
          resolve(res)
        }, (err) => {
          if (JSON.parse(err).details.slice(0, 2) === '10') {
            let details = JSON.parse(err).details
            let errString1 = details.substring(details.lastIndexOf('{"s":"') + 1, details.lastIndexOf('","ptr"'))
            let errString = errString1.split('"')[3]
            reject(Error(errString))
          } else {
            reject(err)
          }
        })
      })
    })
  }
}

const getters = {
  getEndpoints: state => {
    if (state.endpoints.length > 0) {
      return state.endpoints
    } else {
      return []
    }
  },
  getCurrentEndpoint: state => {
    return state.currentEndpoint
  },
  getEndpointConnectionStatus: state => {
    return state.endpointConnectionStatus
  },
  getEndpointRefreshInterval: state => {
    return state.endpointRefreshInterval
  },
  getMatchRequests: state => {
    return state.matchRequests
  },
  getMatchRequested: state => {
    return state.matchRequested
  },
  getAllMatchRequests: state => {
    let allRequests = state.matchRequested.concat(state.matchRequests)
    return allRequests
  },
  getCurrentMatch: state => {
    return state.currentMatch
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
