// app.js
import mqtt from './utils/mqtt.js';
const host = 'wxs://tsms2.sctfia.com/mqtt';
// const host = 'wxs://10.35.240.227/mqtt';
// const apiaddr = 'wxs://10.35.240.224';

App({
  data: {
    client: {
      connected: false
    },
    reconnectCounts: 0, //记录重连的次数
    options: { //MQTT连接的配置
      protocolVersion: 5, //MQTT连接协议版本
      clientId: "tfu_taxi_" + Math.random().toString(16).substring(2, 8),
      clean: false,
      password: 'user',
      username: 'user',
      keepalive: 15,
      reconnectPeriod: 1000, //1000毫秒，两次重新连接之间的间隔
      connectTimeout: 60 * 1000, //1000毫秒，两次重新连接之间的间隔
      resubscribe: true //如果连接断开并重新连接，则会再次自动订阅已订阅的主题（默认true）
    },
  },
  globalData: {
    rpx: 0,
    width: 0,
    height: 0,
    pgHeight: 0,
    btnBottom: 0,
    smsFlag: false,
    snsMsgWait: 60,
    parkData: [],
    channelData: [],
    T1PdList: null,
    T2PdList: null,
    convoyT1: [],
    convoyT2: [],
    showT1: [],
    showT2: [],
    onWayData: [],
    noticeList: [],
    client: {
      connected: false
    }
  },
  onLaunch() {
    // 展示本地存储能力
    let that = this;
    wx.getSystemInfo({
      success: (result) => {
        that.globalData.width = result.windowWidth;
        that.globalData.height = result.windowHeight;
        that.globalData.pgHeight = result.windowHeight - (result.screenHeight - result.safeArea.bottom) - (118 * (result.screenWidth / 750));
        that.globalData.rpx = result.windowWidth / 750;
        that.globalData.btnBottom = result.windowHeight - that.globalData.pgHeight;
      },
    });
    this.getNotice();
  },
  onHide() {
    console.log("hide");
    wx.removeStorageSync('userInfo');
  },
  connectMQ: function () {
    if (this.globalData.client.connected) {
      //console.log("connected");
      return
    }
    let that = this;
    //开始连接
    this.data.client = mqtt.connect(host, this.data.options);
    this.data.client.on('connect', function (connack) {
      that.subTopic();
      //console.log(that.data.client);
      that.globalData.client.connectFlag = true;
    })

    //服务器下发消息的回调
    this.data.client.on("message", function (topic, payload) {
      let fme_data = JSON.parse(payload + "");
      // console.log(fme_data.type, fme_data.mark, fme_data.data);
      !fme_data.type ? null : that.switchData(fme_data.type, fme_data.mark, fme_data.data);
    })

    //服务器连接异常的回调
    this.data.client.on("error", function (error) {
      //console.log(" 服务器 error 的回调" + error)

    })

    //服务器重连连接异常的回调
    this.data.client.on("reconnect", function (res) {
      //console.log(" 服务器 reconnect的回调" + res);
    })

    //服务器连接异常的回调
    this.data.client.on("offline", function (errr) {
      //console.log(" 服务器offline的回调" + errr);
    })
    this.globalData.client = this.data.client;
  },
  subTopic: function () {
    if (this.data.client && this.data.client.connected) {
      //仅订阅单个主题
      this.data.client.subscribe('topic/taxi', function (err, granted) {
        wx.hideLoading();
        if (!err) {
          wx.showToast({
            title: '连接成功'
          });
        } else {
          wx.showToast({
            title: '连接失败',
            icon: 'error',
            duration: 2000
          });
        }
      })
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      });
    }
  },
  getNotice: function () {
    wx.request({
      // url: 'https://tsms1.sctfia.com/s_note',
      url: 'https://tsms1.sctfia.com/s_note',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.globalData.noticeList = res.data;
        } else {
          wx.showToast({
            title: '服务异常',
            icon: 'error',
            duration: 2000
          });
        }
      },
      fail: (res) => {
        wx.showToast({
          title: '网络异常',
          icon: 'error',
          duration: 2000
        });
      }
    });
  },
  switchData: function (type, mark, data) {
    let that = this;
    // console.log(type, mark, data);
    switch (type) {
      case "web":
        switch (mark) {
          case "status_num":
            let parkData = [];
            let channelData = [];
            data.forEach((item, index) => {
              switch (item.id) {
                case "poolT1":
                  parkData[0] = {
                    channel: "T1蓄车场",
                    NUM: item.num
                  };
                  break;
                case "poolT2":
                  parkData[1] = {
                    channel: "T2蓄车场",
                    NUM: item.num
                  };
                  break;
                case "wayT1long":
                  break;
                case "wayT2long":
                  break;
                case "wayT2short":
                  break;
                case "terminalT1pd1":
                  channelData[0] = ({
                    id: 0,
                    poolid: "T1补偿",
                    NUM: item.num
                  });
                  break;
                case "terminalT1long1":
                  channelData[1] = ({
                    id: 1,
                    poolid: "T1排行道1",
                    NUM: item.num
                  });
                  break;
                case "terminalT1long2":
                  channelData[2] = ({
                    id: 2,
                    poolid: "T1排行道2",
                    NUM: item.num
                  });
                  break;
                case "terminalT2long1":
                  channelData[3] = ({
                    id: 3,
                    poolid: "T2排行道1",
                    NUM: item.num
                  });
                  break;
                case "terminalT2long2":
                  channelData[4] = ({
                    id: 4,
                    poolid: "T2排行道2",
                    NUM: item.num
                  });
                  break;
                case "terminalT2pd1":
                  channelData[5] = ({
                    id: 5,
                    poolid: "T2补偿",
                    NUM: item.num
                  });
                  break;
                default:
                  break;
              }
            });
            parkData.push({
              channel: "蓄车场总数",
              NUM: parkData[0].NUM + parkData[1].NUM
            });
            that.globalData.parkData = parkData;
            that.globalData.channelData = channelData;
            break;
          default:
            break;
        }
        break;
      case "process":
        switch (mark) {
          case "door":
            let T1PdList, T2PdList, convoyT1 = [],
              convoyT2 = [],
              showT1 = [],
              showT2 = [];
            data.pd_car_list.forEach(item => {
              if (item.terminal == "T1") {
                T1PdList = item;
              } else {
                T2PdList = item;
              }
            });
            data.pt_car_list.forEach(item => {
              if (item.terminal == "T1") {
                convoyT1.push(item);
                showT1.push(true);
              } else {
                convoyT2.push(item);
                showT2.push(true);
              }
            });
            that.globalData.T1PdList = T1PdList;
            that.globalData.T2PdList = T2PdList;
            that.globalData.convoyT1 = convoyT1;
            that.globalData.convoyT2 = convoyT2;
            // that.globalData.showT1 = showT1;
            // that.globalData.showT2 = showT2;
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  },
  watch: function (variate, method) {
    var obj = this.globalData;
    let val = obj[variate]; // 单独变量来存储原来的值
    Object.defineProperty(obj, variate, {
      configurable: false,
      enumerable: true,
      set: function (value) {
        val = value; // 重新赋值
        method(variate, value); // 执行回调方法
      },
      get: function () {
        // 在其他界面调用getApp().globalData.variate的时候，这里就会执行。
        return val; // 返回当前值
      }
    })
  },












})