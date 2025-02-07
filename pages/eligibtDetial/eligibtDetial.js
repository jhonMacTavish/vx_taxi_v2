// pages/announce/announce.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnBottom: 50,
    listData: []
  },

  confirm() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let btnBottom = app.globalData.btnBottom / 2;
    wx.showLoading({
      title: '加载中',
    });
    wx.request({
      url: 'https://tsms1.sctfia.com/yesterday_pd',
      method: "get",
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          let listData = res.data;
          console.log(res);
          this.setData({
            btnBottom,
            listData
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
    wx.hideHomeButton();
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },
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