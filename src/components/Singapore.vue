<template>
  <v-app light>
    <!--{{singapore}}-->
    <!--&lt;!&ndash;{{happy}}&ndash;&gt;-->
    <!--{{hongkong}}-->
    <v-layout row wrap>

      <v-flex xs12 sm6 offset-sm3>
        <v-card>

          <v-list two-line>
            <v-toolbar color="cyan" dark>
              <v-toolbar-side-icon></v-toolbar-side-icon>
              <v-toolbar-title>KLP市场信息</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon>
              </v-btn>
            </v-toolbar>

            <template>
              <v-img
                class="white--text"
                height="200px"
                src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
              >
                <v-container fill-height fluid>
                  <v-layout fill-height>
                    <v-flex xs12 align-end flexbox>
                      <span class="headline">Top 10 Australian beaches</span>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-img>
              <!--<v-subheader>shi</v-subheader>-->
              <!--<v-divider></v-divider>-->
              <p class="text-sm-left headline">当前供应量 {{klpmarket_monitor}}</p><br>
              <v-list-tile>
                <v-list-tile-avatar>
                  <img :src="'https://tinyurl.com/y9r5xe8c'"/>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>EOS: {{base}}</v-list-tile-title>
                  <!--<v-list-tile-sub-title>fsda</v-list-tile-sub-title>-->
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-avatar>
                  <img :src="'https://upload-images.jianshu.io/upload_images/3866441-16d473b7a8d722a5.png'"/>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>KLP: {{quote}}</v-list-tile-title>
                  <!--<v-list-tile-sub-title>fsda</v-list-tile-sub-title>-->
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-avatar>
                  <img
                    :src="'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsYrLphyclS57UFhgMT7C7kdT8IBZB55nagZY0DORUA3Ezgh9U'"/>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>EOS/1000 KLP: {{point_price}}</v-list-tile-title>
                  <!--<v-list-tile-sub-title>fsda</v-list-tile-sub-title>-->
                </v-list-tile-content>
              </v-list-tile>
              <v-divider></v-divider>
            </template>
          </v-list>

        </v-card>
        <v-card class="addApi text-xs-center">
          <!--<v-img-->
          <!--src="https://cdn.vuetifyjs.com/images/cards/desert.jpg"-->
          <!--aspect-ratio="2.75"-->
          <!--&gt;</v-img>-->
          <div class="headline .display-2">KLP资产管理</div>
          <h1>我KLP</h1>
          <div class="field">
            <input id="id1" class="input" type="text" placeholder="KLP">
          </div>
          <h1>我会得到EOS</h1>
          <div class="field">
            <input id="id2" class="input" type="text" placeholder="EOS">
          </div>

          <v-card-title primary-title>

            <v-form offset-xs3 v-model="addEndpointForm" ref="form" lazy-validation>
              <v-select solo v-bind:items="xuan" item-value="value" v-model="xuanze" label="购买或出售" single-line dense
                        required></v-select>
              <br><br>
              <v-text-field solo label="KLP" v-model="inputKLP" :rules="inputKLPrules"
                            placeholder="输入整数且大于：" required></v-text-field>
              <v-btn color="primary"
                     @click="checkCost(xuanze, inputKLP)" :disabled="!addEndpointForm">
                Add
              </v-btn>

              <!--<v-btn v-else disabled>-->
              <!--<v-progress-circular indeterminate color="primary"></v-progress-circular>-->
              <!--</v-btn>-->

              <v-card-actions>
                <v-btn flat color="orange">Share</v-btn>
                <v-btn flat color="orange">Explore</v-btn>
              </v-card-actions>
            </v-form>

          </v-card-title>

        </v-card>
        <!--<v-card>-->


        <!--<v-card-title>-->

        <!--<v-card-text>-->

        <!--<p class="text-sm-left"> <v-icon>home</v-icon>KLP: {{base}}</p><br>-->


        <!--<p class="text-sm-left">EOS: {{quote}}</p><br>-->
        <!--<p class="text-sm-left">Current Prices: {{point_price}}</p><br>-->
        <!--</v-card-text>-->
        <!--</v-card-title>-->
        <!--<v-card-actions>-->
        <!--<v-btn flat color="orange">Share</v-btn>-->
        <!--<v-btn flat color="orange">Explore</v-btn>-->
        <!--</v-card-actions>-->
        <!--</v-card>-->
      </v-flex>
      <v-flex xs6 offset-xs3>


      </v-flex>
    </v-layout>

  </v-app>
</template>

<script>
  import axios from 'axios'
  export default {
    name: 'Singapore',
    data () {
      return {
        singapore: 'Xinjiapo',
        hongkong: 'Xianggang',
        klpmarket: [],
        supply: '',
        base: '',
        quote: '',
        point_price: '',
        xuan: [
          {text: '购买KLP', value: 'sellKLP'},
          {text: '卖出KLP', value: 'buyKLP'}
        ],
        inputKLP: '',
        inputKLPrules: [(v) => !!v || 'URL is required', (v) => /^\d+$/.test(v) || 'must be number'],
        xuanze: '',
        addEndpointForm: false,
        testItems: [
          {
            action: 'restaurant',
            title: 'Breakfast',
            path: '/breakfast',
            testItems: []
          }
        ],
        listitems: [
          {header: 'Today'},
          {
            avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
            title: 'Brunch this weekend?',
            subtitle: "<span class='text--primary'>Ali Connors</span> &mdash; I'll be in your neighborhood doing errands this weekend. Do you want to hang out?"
          },
          {divider: true, inset: true},
          {
            avatar: 'https://cdn.vuetifyjs.com/images/lists/2.jpg',
            title: 'Summer BBQ <span class="grey--text text--lighten-1">4</span>',
            subtitle: "<span class='text--primary'>to Alex, Scott, Jennifer</span> &mdash; Wish I could come, but I'm out of town this weekend."
          },
          {divider: true, inset: true},
          {
            avatar: 'https://cdn.vuetifyjs.com/images/lists/3.jpg',
            title: 'Oui oui',
            subtitle: "<span class='text--primary'>Sandra Adams</span> &mdash; Do you have Paris recommendations? Have you ever been?"
          }
        ]
      }
    },
    created () {
      this.singapore = '100'
    },
    methods: {
      checkCost: function (xuanze, inputKLP) {
        let tradeFormatted = []
        tradeFormatted.push(xuanze)
        tradeFormatted.push(inputKLP)
        this.$store.dispatch('checkCost', tradeFormatted).then((res) => {
          console.log('res: ', res)
        }, (err) => {
          alert('contract says: ' + err.message)
        })
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
      clear () {
        this.$refs.form.reset()
      }
    },
    computed: {
      happy: function () {
        axios
          .post('http://api-kylin.eosasia.one/v1/chain/get_info')
          .then(response => (this.singapore = response.data))
        return this.singapore
      },
      klpmarket_monitor: function () {
        axios
          .post('http://api-kylin.eosasia.one/v1/chain/get_table_rows', {
            'code': 'eoshenzhensg',
            'scope': 'eoshenzhensg',
            'table': 'klpmarket',
            'json': 'true'
          })
          .then(response => (this.hongkong = response.data))
        // console.log('this.hongkong.rows', this.hongkong.rows)
        // console.log('xuanze', this.xuanze)
        try {
          this.klpmarket = this.hongkong.rows[0]
          // const supply = this.klpmarket.supply
          const sbase = this.klpmarket.base.balance
          const squote = this.klpmarket.quote.balance
          this.base = sbase.substring(0, squote.length - 4)
          this.quote = squote.substring(0, squote.length - 4)

          // TODO: consult zhaozhao about retrieve frequency
          this.point_price = this.quote / this.base * 1000
          // console.log('klpmarket', this.klpmarket)
          // console.log('base', this.base)
          // console.log('quote', this.quote)
        } catch (err) {
          // console.log("err: ", err)
        }
        // return this.hongkong
        return this.supply
      }
    },
    beforeDestroy () {

    }
  }
</script>

<style scoped>
  #id1 {
    width: 400px;
    margin: auto;
  }

  #id2 {
    width: 400px;
    margin: auto;
  }

  col {
    /*margin-left: 100px;*/
    display: inline-block;
  }

  cu_status {
    text-align: justify;
  }
</style>
