// pages/login/login.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: null,
    password: null
  },

  goToRegister() {
    wx.navigateTo({
      url: '../index/index'
    });
  },

  wxLogin() {
    const openid = wx.getStorageSync('openid') || null;
    console.log(openid);
    if (!openid) {
      wx.login({
        success: (res) => {
          let code = res.code;
          console.log(code);
          wx.request({
            url: 'https://tsms1.sctfia.com/openid',
            method: 'GET',
            data: {
              code
            },
            success: (res) => {
              let openid = res.data.openid;
              console.log(openid);
              //wx.setStorageSync('openid', openid);
              wx.request({
                url: 'https://tsms1.sctfia.com/login',
                method: 'GET',
                data: {
                  openid
                },
                success: (res) => {
                  console.log(res.data);
                  let userInfo = res.data[0];
                  wx.setStorageSync('userInfo', (typeof userInfo == 'string') ? null : userInfo);
                  userInfo = wx.getStorageSync('userInfo');
                  console.log(userInfo);
                  if (userInfo)
                    //wx.setStorageSync('openid', userInfo.openid);
                    // userInfo ? userInfo.manage = "出租车" : null;
                    if (!userInfo) {
                      wx.showModal({
                        content: "请先注册账号",
                        showCancel: false,
                        confirmText: "确定",
                        success: (res) => {
                          if (res.confirm) {
                            this.goToRegister();
                          }
                        }
                      });
                    }
                    else if (userInfo["manage"] == null || userInfo["manage"] == '') {
                      wx.showModal({
                        content: "请等待工作人员审核",
                        showCancel: false,
                        confirmText: "确定",
                        success: (res) => { }
                      });
                      return;
                    }
                    else if (userInfo["manage"] == '未通过') {
                      wx.showModal({
                        content: "审核未通过，请修改资料",
                        showCancel: false,
                        confirmText: "确定",
                        success: (res) => {
                          wx.navigateTo({
                            url: '../index/index?status=未通过'
                          });
                        }
                      });
                      return;
                    }
                    else {
                      wx.reLaunch({ url: "/pages/announce/announce" });
                    }
                },
                fail: (res) => { },
                complete: (res) => { }
              });
            },
            fail: (res) => {
            },
            complete: (res) => {
            }
          });
        }
      });
    } else {
      wx.request({
        url: 'https://tsms1.sctfia.com/login',
        method: 'GET',
        data: {
          openid
        },
        success: (res) => {
          console.log(res.data);
          let userInfo = res.data[0];
          wx.setStorageSync('userInfo', (typeof userInfo == 'string') ? null : userInfo);
          userInfo = wx.getStorageSync('userInfo');
          console.log(userInfo);
          if (userInfo)
            //wx.setStorageSync('openid', userInfo.openid);
            // userInfo ? userInfo.manage = "出租车" : null;
            if (!userInfo) {
              wx.showModal({
                content: "请先注册账号",
                showCancel: false,
                confirmText: "确定",
                success: (res) => {
                  if (res.confirm) {
                    this.goToRegister();
                  }
                }
              });
            }
            else if (userInfo["manage"] == null || userInfo["manage"] == '') {
              wx.showModal({
                content: "请等待工作人员审核",
                showCancel: false,
                confirmText: "确定",
                success: (res) => { }
              });
              return;
            }
            else if (userInfo["manage"] == '未通过') {
              wx.showModal({
                content: "审核未通过，请修改资料",
                showCancel: false,
                confirmText: "确定",
                success: (res) => {
                  wx.navigateTo({
                    url: '../index/index?status=未通过'
                  });
                }
              });
              return;
            }
            else {
              wx.reLaunch({ url: "/pages/announce/announce" });
            }
        },
        fail: (res) => { },
        complete: (res) => { }
      });
    }
  },

  onLoad(options) {
    // const openid = wx.getStorageSync('userInfo').openid || null;
    // console.log(openid);
    // if (!openid) {
    //   return
    // } else {
    //   this.wxLogin();
    // }
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
    wx.hideHomeButton();  //隐藏home/返回主页按钮
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