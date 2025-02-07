// pages/agreement/agreement.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: null,
    btnBottom: 50,
    class: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let btnBottom = app.globalData.btnBottom / 2;
    options.height = app.globalData.pgHeight;
    options.btnBottom = btnBottom;
    this.setData(options);
    console.log(options);
  },
  back(){
    wx.navigateBack({
      delta: 1
    });
  }
})