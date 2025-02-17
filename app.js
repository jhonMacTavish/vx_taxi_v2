// app.js
import WxAuthUtils from './utils/WxAuthUtils';

App({
  data: {
    client: null,  // MQTT 客户端对象初始化为 null
    reconnectCounts: 0, //记录重连的次数
    options: { // MQTT连接的配置
      protocolVersion: 5, // MQTT协议版本
      clientId: `tfu_taxi_${Math.random().toString(16).substring(2, 8)}`,
      clean: false,
      password: 'user',
      username: 'user',
      keepalive: 15,
      reconnectPeriod: 1000, // 重连间隔
      connectTimeout: 60 * 1000, // 连接超时
      resubscribe: true // 自动重新订阅
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
    client: { connected: false }
  },
  
  onLaunch() {
    // 获取设备信息
    wx.getSystemInfo({
      success: (result) => {
        this.globalData.width = result.windowWidth;
        this.globalData.height = result.windowHeight;
        this.globalData.pgHeight = result.windowHeight - (result.screenHeight - result.safeArea.bottom) - (118 * (result.screenWidth / 750));
        this.globalData.rpx = result.windowWidth / 750;
        this.globalData.btnBottom = result.windowHeight - this.globalData.pgHeight;
      },
    });
    const userInfo = wx.getStorageSync('userInfo') || { manage: "" };
    this.getNotice();
    WxAuthUtils.login();
  },

  onHide() {
    console.log("hide");
    wx.removeStorageSync('userInfo');
  },

  getNotice() {
    wx.request({
      url: 'https://tsms1.sctfia.com/s_note',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.globalData.noticeList = res.data;
        } else {
          wx.showToast({ title: '服务异常', icon: 'error', duration: 2000 });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络异常', icon: 'error', duration: 2000 });
      }
    });
  },

  switchData(type, mark, data) {
    const that = this;

    switch (type) {
      case "web":
        if (mark === "status_num") {
          let parkData = [], channelData = [];
          data.forEach((item) => {
            switch (item.id) {
              case "poolT1": parkData[0] = { channel: "T1蓄车场", NUM: item.num }; break;
              case "poolT2": parkData[1] = { channel: "T2蓄车场", NUM: item.num }; break;
              case "terminalT1pd1": channelData[0] = { id: 0, poolid: "T1补偿", NUM: item.num }; break;
              case "terminalT1long1": channelData[1] = { id: 1, poolid: "T1排行道1", NUM: item.num }; break;
              case "terminalT1long2": channelData[2] = { id: 2, poolid: "T1排行道2", NUM: item.num }; break;
              case "terminalT2long1": channelData[3] = { id: 3, poolid: "T2排行道1", NUM: item.num }; break;
              case "terminalT2long2": channelData[4] = { id: 4, poolid: "T2排行道2", NUM: item.num }; break;
              case "terminalT2pd1": channelData[5] = { id: 5, poolid: "T2补偿", NUM: item.num }; break;
            }
          });
          parkData.push({ channel: "蓄车场总数", NUM: parkData[0].NUM + parkData[1].NUM });
          that.globalData.parkData = parkData;
          that.globalData.channelData = channelData;
        }
        break;
      case "process":
        if (mark === "door") {
          let T1PdList = null, T2PdList = null, convoyT1 = [], convoyT2 = [], showT1 = [], showT2 = [];
          data.pd_car_list.forEach((item) => {
            item.terminal === "T1" ? T1PdList = item : T2PdList = item;
          });
          data.pt_car_list.forEach((item) => {
            if (item.terminal === "T1") {
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
        }
        break;
      default:
        break;
    }
  },

  watch(variate, method) {
    let val = this.globalData[variate]; 
    Object.defineProperty(this.globalData, variate, {
      configurable: false,
      enumerable: true,
      set(value) {
        val = value;
        method(variate, value);
      },
      get() {
        return val;
      }
    });
  },
});
