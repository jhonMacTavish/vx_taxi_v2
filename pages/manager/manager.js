// pages/manager/manager.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: null,
    T1PdList: null,
    T2PdList: null,
    convoyT1: [],
    convoyT2: [],
    showT1: [],
    showT2: [],
    timer: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
    app.watch('T1PdList', this.watchBack);
    app.watch('T2PdList', this.watchBack);
    app.watch('convoyT1', this.watchBack);
    app.watch('convoyT2', this.watchBack);
    app.watch('showT1', this.watchBack);
    app.watch('showT2', this.watchBack);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const that = this;
    if (!app.globalData.client.connectFlag) {
      //console.log(app.globalData.client.connectFlag);
      app.globalData.client.connectFlag = true;
    }
    let height = app.globalData.pgHeight
    this.getData();
    const timer = setInterval(() => {
      // that.getData();
    }, 5000);
    this.setData({
      height, timer
    });
  },

  onHide() {
    clearInterval(this.data.timer);
  },

  getData(){
    wx.request({
      url: 'https://tsms1.sctfia.com/all_car_list',
      method: 'GET',
      success: (res) => {
        console.log(res);
        let data = res.data;
        app.switchData("process", "door", data.data);
      }
    });
  },
  getCarNo(e) {
    let carid = e.detail.value;
    this.setData({
      carid
    });
  },
  selectTap(e) {
    let index = e.currentTarget.dataset.index;
    let terminal = e.currentTarget.dataset.terminal;
    let showT1 = this.data.showT1;
    let showT2 = this.data.showT2;
    console.log(e.currentTarget.dataset);
    if (terminal == "T1") {
      showT1[index] = !showT1[index];
      console.log(showT1);
      this.setData({
        showT1
      });
    } else {
      showT2[index] = !showT2[index];
      this.setData({
        showT2
      });
    }
  },
  watchBack: function (name, value) {
    // console.log(name, value);
    if (name == "T1PdList") {
      this.setData({
        T1PdList: value
      });
    } else if (name == "T2PdList") {
      this.setData({
        T2PdList: value
      });
    } else if (name == "convoyT1") {
      this.setData({
        convoyT1: value
      });
    } else if (name == "convoyT2") {
      this.setData({
        convoyT2: value
      });
    } else if (name == "showT1") {
      this.setData({
        showT1: value
      });
    } else if (name == "showT2") {
      this.setData({
        showT2: value
      });
    } else {
      return
    }
  }
})