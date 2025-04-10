// pages/carOrder/carOrder.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pool: {
      T1: [],
      T2: []
    },
    background: 1,
    height: null,
    timer: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    wx.request({
      url: 'https://tsms1.sctfia.com/api/pool_in_order_top',
      method: 'GET',
      data: {
        topnum: 100
      },
      success(res) {
        console.log(that.data.pool.T1);
        const arrT1 = [],
          arrT2 = [];
        for (let i = 0; i < 100; i += 25) {
          arrT1.push(res.data.T1.slice(i, i + 25));
          arrT2.push(res.data.T2.slice(i, i + 25));
        }
        that.setData({
          ['pool.T1']: arrT1,
          ['pool.T2']: arrT2,
        });
        console.log(that.data.pool);
      }
    })
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
    const that = this;
    let height = app.globalData.pgHeight
    const timer = setInterval(() => {}, 5000);
    this.setData({
      height,
      timer
    });
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