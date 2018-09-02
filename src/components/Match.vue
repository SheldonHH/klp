<style scoped>

  table {
    margin: 0 auto;
    border-collapse: collapse;
    background: grey;
    width: 10%;
    height: 10%;
  }

  td {
    margin: 0;
    padding: 0;
  }

  tr:nth-child(odd) td:nth-child(even), tr:nth-child(even) td:nth-child(odd) {
    background: white;
  }

  .highlighted {
    outline: 2px solid blue;
    outline-offset: -2px;
  }

  .highlightedred {
    outline: 2px solid red;
    outline-offset: -2px;
  }
</style>

<template>

  <v-layout row wrap>
    <v-layout v-if="getEndpointConnectionStatus === 0 && getAccountActive && !getAccountLocked && currentMatch" row
              wrap>
      <v-flex xs12>
        <v-card>
          <p>The contract evaluates your moves not the UI.</p>
          <p v-if="currentMatch.white === getAccount.name && currentMatch.lastmoveside === 1">
            It's your turn
          </p>
          <p v-if="currentMatch.black === getAccount.name && currentMatch.lastmoveside === 0">
            It's your turn
          </p>
          <v-btn v-if="loading" disabled color="trasnaperent">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </v-btn>
          <v-btn v-if="!loading && currentMove.length > 1" color="green" @click="sendMove()">Send move message to
            contract with {{currentMove.length -1}} steps
          </v-btn>
          <v-btn v-if="!loading && currentMove.length > 0" color="red" @click="cancelMove()">Cancel current move</v-btn>
          <v-btn v-else disabled>Send move message to contract</v-btn>
        </v-card>
      </v-flex>
      <v-flex xs8 v-if="currentMatch.white === getAccount.name">
        <table id="board1" ref="board" v-bind:style="{ height: boardWidth + 'px !important' }">
          <tr>
            <td v-for="(item, index) in getRowFromBoard(0,0,true)" v-html="item" @click="highlight($event)"
                :class="['0-' + index]"></td>
          </tr>
          <tr>
            <td v-for="(item, index) in getRowFromBoard(1,8,true)" v-html="item" @click="highlight($event)"
                :class="['1-' + index]"></td>
          </tr>
          <tr>
            <td v-for="(item, index) in getRowFromBoard(2,16,true)" v-html="item" @click="highlight($event)"
                :class="['2-' + index]"></td>
          </tr>
          <tr>
            <td v-for="(item, index) in getRowFromBoard(3,24,true)" v-html="item" @click="highlight($event)"
                :class="['3-' + index]"></td>
          </tr>
          <tr>
            <td v-for="(item, index) in getRowFromBoard(4,32,true)" v-html="item" @click="highlight($event)"
                :class="['4-' + index]"></td>
          </tr>
          <tr>
            <td v-for="(item, index) in getRowFromBoard(5,40,true)" v-html="item" @click="highlight($event)"
                :class="['5-' + index]"></td>
          </tr>
          <tr>
            <td v-for="(item, index) in getRowFromBoard(6,48,true)" v-html="item" @click="highlight($event)"
                :class="['6-' + index]"></td>
          </tr>
          <tr>
            <td v-for="(item, index) in getRowFromBoard(7,56,true)" v-html="item" @click="highlight($event)"
                :class="['7-' + index]"></td>
          </tr>
        </table>
        <v-btn v-if="!loading" @click="castleMove(0)">Send long castle move</v-btn>
        <v-btn v-if="!loading" @click="castleMove(1)">Send short castle move</v-btn>
      </v-flex>
      <v-flex xs8 v-else>
        <table id="board2" ref="board" v-bind:style="{ height: boardWidth + 'px !important' }">
          <tr>
            <td v-for="(item, index) in getRowFromBoard(7,63)" v-html="item" @click="highlight($event)"
                :class="['7-' + (index*-1 + 7)]"></td>
          </tr>
          <tr>
            <td v-for="(item, index) in getRowFromBoard(6,55)" v-html="item" @click="highlight($event)"
                :class="['6-' + (index*-1 + 7)]"></td>
          </tr>
          <tr>
            <td v-for="(item, index) in getRowFromBoard(5,47)" v-html="item" @click="highlight($event)"
                :class="['5-' + (index*-1 + 7)]"></td>
          </tr>
          <tr>
            <td v-for="(item, index) in getRowFromBoard(4,39)" v-html="item" @click="highlight($event)"
                :class="['4-' + (index*-1 + 7)]"></td>
          </tr>
          <tr>
            <td v-for="(item, index) in getRowFromBoard(3,31)" v-html="item" @click="highlight($event)"
                :class="['3-' + (index*-1 + 7)]"></td>
          </tr>
          <tr>
            <td v-for="(item, index) in getRowFromBoard(2,23)" v-html="item" @click="highlight($event)"
                :class="['2-' + (index*-1 + 7)]"></td>
          </tr>
          <tr>
            <td v-for="(item, index) in getRowFromBoard(1,15)" v-html="item" @click="highlight($event)"
                :class="['1-' + (index*-1 + 7)]"></td>
          </tr>
          <tr>
            <td v-for="(item, index) in getRowFromBoard(0,7)" v-html="item" @click="highlight($event)"
                :class="['0-' + (index*-1 + 7)]"></td>
          </tr>
        </table>
        <v-btn v-if="!loading" @click="castleMove(1)">Send short castle move</v-btn>
        <v-btn v-if="!loading" @click="castleMove(0)">Send long castle move</v-btn>
      </v-flex>
      <v-flex xs4>
        <v-card>
          <v-list two-line dense>
            Game Info
            <v-divider></v-divider>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>Last move</v-list-tile-title>
                <v-list-tile-sub-title>{{currentMatch.lastmovetime | timeago}} by
                  {{moveSide(currentMatch.lastmoveside)}}
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>Time left for next move</v-list-tile-title>
                <v-list-tile-sub-title v-if="currentMatch.lastmovetime > 0">{{currentMatch.lastmovetime +
                  currentMatch.maxmoveinterval | formatRemaining}}
                </v-list-tile-sub-title>
                <v-list-tile-sub-title v-else></v-list-tile-sub-title>

              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>White</v-list-tile-title>
                <v-list-tile-sub-title>{{currentMatch.white}} || {{currentMatch.moveswhite}} move(s)
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>Black</v-list-tile-title>
                <v-list-tile-sub-title>{{currentMatch.black}} || {{currentMatch.movesblack}} move(s)
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>

    </v-layout>

    <v-flex xs6 v-if="getEndpointConnectionStatus !== 0">
      <p>No connection! <br> Connection needed for Match.</p>

      <router-link to="settings">
        <v-btn color="primary">Settings</v-btn>
      </router-link>
    </v-flex>
    <v-flex xs6 v-if="!getAccountActive">
      <p>Account needed for Match.</p>

      <router-link to="account">
        <v-btn color="primary">Account</v-btn>
      </router-link>
    </v-flex>
    <v-flex xs6 v-else-if="getAccountLocked">
      <p>Unlocked account needed for Matches.</p>
      <p>Please unlock your account first.</p>

    </v-flex>
  </v-layout>

</template>

<script>
  import {
    mapGetters
  }
    from 'vuex'

  export default {
    computed: {
      ...mapGetters([
        'getEndpointConnectionStatus',
        'getAccountActive',
        'getAccountLocked',
        'getAccount',
        'getMatches',
        'getCurrentMatch'
      ])
    },
    data () {
      return {
        currentMove: [],
        currentMatch: null,
        boardWidth: 0,
        loading: null,
        active: null,
        snackbar: false,
        snackbarTime: 5000,
        snackbarText: null,
        snackbarTextColor: 'white'
      }
    },
    methods: {
      highlight (event) {
        event.currentTarget.classList.add('highlighted')
        let piece = event.currentTarget.className.split(' ')[0]
        let exists = this.currentMove.indexOf(piece)
        if (exists === -1) {
          this.currentMove.push(piece)
        }
      },
      cancelMove () {
        var els = document.getElementsByClassName('highlighted')
        while (els[0]) {
          els[0].classList.remove('highlighted')
        }
        this.currentMove = []
      },
      sendMove () {
        this.loading = true
        let formatted = []
        for (let i = 0; i < this.currentMove.length; i++) {
          formatted.push(Number(this.currentMove[i].split('-')[0]))
          formatted.push(Number(this.currentMove[i].split('-')[1]))
        }
        formatted.push(10)
        let rem = 17 - formatted.length
        for (let j = 0; j < rem; j++) {
          formatted.push(0)
        }
        this.$store.dispatch('sendMove', formatted).then((res) => {
          this.loading = false
          this.currentMove = []
          this.cancelMove()
          alert('contract says: good')
        }, (err) => {
          this.loading = false
          this.currentMove = []
          this.cancelMove()
          alert('contract says: ' + err.message)
        })
      },
      castleMove (long) {
        this.loading = true
        this.$store.dispatch('sendCastleMove', long).then((res) => {
          this.loading = false
          alert('contract says: good')
        }, (err) => {
          this.loading = false
          alert('contract says: ' + err.message)
        })
      },
      getRowFromBoard (row, from, white) {
        let nArr = []
        if (white) {
          for (let i = from; i < from + 8; i++) {
            let str = '<img @click="highlight" src="static/pieces/p' + this.currentMatch.board[i] + '.svg">'
            nArr.push(str)
          }
        } else {
          for (let i = from; i > from - 8; i--) {
            let str = '<img @click="highlight" src="static/pieces/p' + this.currentMatch.board[i] + '.svg">'
            nArr.push(str)
          }
        }
        return nArr
      },
      moveSide (s) {
        if (s === 0) {
          return 'white'
        } else if (s === 1) {
          return 'black'
        } else {
          return 'nobody'
        }
      },
      calculateHeight () {
        this.boardWidth = this.$refs.board.clientWidth
      },
      launchSnackbar (duration, snackbarText, snackbarTextColor) {
        this.snackbar = false
        this.snackbarTime = duration || 0
        this.snackbarText = snackbarText
        this.snackbar = true
      },
      unixToDatestring (unix) {
        return new Date(unix * 1000)
      },
      next () {
        this.active = this.tabs[(this.tabs.indexOf(this.active) + 1) % this.tabs.length]
      },
      ping () {
        if (this.getAccountActive && !this.getAccountLocked && this.getCurrentMatch) {
          this.$store.dispatch('getCurrentMatchSet').then((res) => {
            this.currentMatch = res
          })
        }
      }
    },
    beforeMount () {
      setInterval(this.ping, 1000)
      window.addEventListener('resize', this.calculateHeight)
    }
  }
</script>
