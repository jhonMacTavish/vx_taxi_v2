// pages/eligibility/eligibility.js
import drawQrcode from '../../utils/weapp.qrcode.esm';

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: null,
    carid: "川A12345",
    record: [],
    disable: true,
    timer: 0
  },

  report() {
    let record = this.data.record;
    record[0].button_show ? wx.navigateTo({
      url: "/pages/report/report"
    }) : null;
  },

  refresh() {
    let that = this;
    let carid = this.data.carid;
    wx.showLoading({
      title: '加载中',
    });
    wx.request({
      url: 'https://tsms1.sctfia.com/pd_judge_res',
      data: {
        carid
      },
      method: 'GET',
      success(res) {
        wx.hideLoading();
        if (res.statusCode === 200) {
          let data = res.data;
          console.log(res);
          that.setData({
            record: [data]
          });
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
      },
    });

    drawQrcode({
      width: 100, // 必须，二维码宽度，与canvas的width保持一致
      height: 100, // 必须，二维码高度，与canvas的height保持一致
      canvasId: 'myQrcode',
      background: '#ffffff', //	非必须，二维码背景颜色，默认值白色
      text: carid, // 必须，二维码内容
      image: {
        dx: 100,
        dy: 100,
        dWidth: 100,
        dHeight: 100
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
    let height = app.globalData.pgHeight
    let carid = wx.getStorageSync('userInfo').carid;
    this.setData({
      carid,
      height
    });

    drawQrcode({
      width: 100, // 必须，二维码宽度，与canvas的width保持一致
      height: 100, // 必须，二维码高度，与canvas的height保持一致
      canvasId: 'myQrcode',
      background: '#ffffff', //	非必须，二维码背景颜色，默认值白色
      text: carid, // 必须，二维码内容
      image: {
        dx: 100,
        dy: 100,
        dWidth: 100,
        dHeight: 100
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this;
    let carid = this.data.carid;
    wx.showLoading({
      title: '加载中',
    });
    wx.request({
      url: 'https://tsms1.sctfia.com/pd_judge_res',
      data: {
        carid
      },
      method: 'GET',
      success(res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          let data = res.data;
          console.log(res);
          that.setData({
            record: [data]
          });
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
      },
    });
    let timer = setInterval(function () {
      wx.request({
        url: 'https://tsms1.sctfia.com/pd_judge_res',
        data: {
          carid
        },
        method: 'GET',
        success(res) {
          wx.hideLoading();
          if (res.statusCode === 200) {
            let data = res.data;
            console.log(res);
            that.setData({
              record: [data]
            });
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
        },
      });
    }, 10000);

    this.setData({
      timer
    });

    drawQrcode({
      width: 100, // 必须，二维码宽度，与canvas的width保持一致
      height: 100, // 必须，二维码高度，与canvas的height保持一致
      canvasId: 'myQrcode',
      background: '#ffffff', //	非必须，二维码背景颜色，默认值白色
      text: carid, // 必须，二维码内容
      image: {
        dx: 100,
        dy: 100,
        dWidth: 100,
        dHeight: 100
      }
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    clearInterval(this.data.timer);
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})