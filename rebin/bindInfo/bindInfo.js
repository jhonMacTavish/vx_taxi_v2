// pages/manager/manager.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: null,
    carid: null,
    filterid: null,
    carlist: null,
    filtecarlist: null,
    userlist: null,
    recordlist: null,
    list: [{
      time: "2021-02-02 10:30:30",
      con: "蓄车场驶入时间"
    }, {
      time: "2021-02-02 10:30:30",
      con: "蓄车场驶出时间"
    }, {
      time: "2021-02-02 10:30:30",
      con: "航站楼驶入时间"
    }, {
      time: "2021-02-02 10:30:30",
      con: "航站楼驶出时间"
    }],
    convoy: [{
      time: "2021-02-02 10:30:30",
      con: "行程开始时间"
    },{
      time: "2021-02-02 10:30:30",
      con: "行程结束时间"
    }]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setKeepScreenOn({
      keepScreenOn: true
    })

    let height = app.globalData.pgHeight
    this.setData({
      height
    });
    // wx.request({
    //   url: 'https://tsms1.sctfia.com/s_waycarid',
    //   method: 'GET',
    //   success: (res) => {
    //     this.setData({
    //       carlist: res.data[0].data
    //     })
    //   }
    // });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // if (typeof this.getTabBar === 'function' && this.getTabBar()) {
    //   this.getTabBar().setData({
    //     selected: 3
    //   })
    // }
  },
  watchBack: function (name, value) {
    let data = {};
    data[name] = value;
    //console.log(value);
    if (name == "onWayData")
      this.setData({
        carlist: value
      })
  },
  getCarNo(e) {
    let carid = e.detail.value;
    this.setData({
      carid
    });
  },
  search() {
    let that = this;
    let carid = this.data.carid;
    let reg = /^([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[a-zA-Z](([DF]((?![IO])[a-zA-Z0-9](?![IO]))[0-9]{4})|([0-9]{5}[DF]))|[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1})$/;
    if (!reg.test(carid)) {
      wx.showModal({
        content: "请输入正确车牌号",
        showCancel: false,
        confirmText: "确定",
      });
      return
    }
    wx.showLoading({
      title: '加载中',
    });
    wx.request({
      url: 'https://tsms1.sctfia.com/user_list',
      data: {
        carid
      },
      method: 'GET',
      success(res) {
        console.log(res);
        that.setData({
          userlist: res.data
        });
      },
      fail: (res) => {
        wx.showToast({
          title: '网络异常',
          icon: 'error',
          duration: 2000
        });
      },
    });
    wx.request({
      url: 'https://tsms1.sctfia.com/car_list',
      data: {
        carid
      },
      method: 'GET',
      success(res) {
        let data = res.data;
        for (let i = 0; i < data.length; i++) {
          data[i].time = data[i].time.replace("T", " ");
        }
        data = data.reverse();
        that.setData({
          recordlist: data
        });
        wx.hideLoading();
      }
    });
  },
  scanCode() {
    let that = this;
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        let carid = res.result;
        that.setData({
          carid: res.result
        });
        let reg = /^([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[a-zA-Z](([DF]((?![IO])[a-zA-Z0-9](?![IO]))[0-9]{4})|([0-9]{5}[DF]))|[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1})$/;
        if (!reg.test(carid)) {
          wx.showModal({
            content: "请输入正确车牌号",
            showCancel: false,
            confirmText: "确定",
          });
          return
        }
        wx.showLoading({
          title: '加载中',
        });
        wx.request({
          url: 'https://tsms1.sctfia.com/user_list',
          data: {
            carid
          },
          method: 'GET',
          success(res) {
            that.setData({
              userlist: res.data
            });
          }
        });
        wx.request({
          url: 'https://tsms1.sctfia.com/car_list',
          data: {
            carid
          },
          method: 'GET',
          success(res) {
            let data = res.data;
            for (let i = 0; i < data.length; i++) {
              data[i].time = data[i].time.replace("T", " ");
            }
            data = data.reverse();
            that.setData({
              recordlist: data
            });
            wx.hideLoading();
          }
        });
      }
    })
  },
  filtration(e) {
    let str = e.detail.value;
    let carlist = this.data.carlist;
    let array = [];
    //console.log(Boolean(array.length));
    carlist.filter(item => {
      console.log(item.carid, str, item.carid.includes(str));
      if (item.carid.includes(str))
        array.push(item);
    });
    //console.log(array);
    this.setData({
      filtecarlist: array
    });
  }
})