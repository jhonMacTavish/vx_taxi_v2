// custom-tab-bar/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    currentPage: '',
    color: "#B9B9B9",
    selectedColor: "#07C160",
    borderStyle: "black",
    backgroundColor: "#ffffff",
    allList: {
      user: [{
          "pagePath": "/pages/airportInfo/airportInfo",
          "iconPath": "/imgs/airportInfo_logout.png",
          "selectedIconPath": "/imgs/airportInfo_active.png",
          "text": "车场",
        },
        {
          "pagePath": "/pages/eligibility/eligibility",
          "iconPath": "/imgs/eligibility_logout.png",
          "selectedIconPath": "/imgs/eligibility_active.png",
          "text": "资格",
        },
        {
          "pagePath": "/pages/eligibtDetial/eligibtDetial",
          "iconPath": "/imgs/list_logout.png",
          "selectedIconPath": "/imgs/list_active.png",
          "text": "近程公示",
        },
        {
          "pagePath": "/pages/mine/mine",
          "iconPath": "/imgs/mine_logout.png",
          "selectedIconPath": "/imgs/mine_active.png",
          "text": "我的",
        }
      ],
      manager: [{
          "pagePath": "/pages/airportInfo/airportInfo",
          "iconPath": "/imgs/airportInfo_logout.png",
          "selectedIconPath": "/imgs/airportInfo_active.png",
          "text": "车场",
        },
        {
          "pagePath": "/pages/record/record",
          "iconPath": "/imgs/record_logout.png",
          "selectedIconPath": "/imgs/record_active.png",
          "text": "详情",
        },
        {
          "pagePath": "/pages/carOrder/carOrder",
          "iconPath": "/imgs/list_logout.png",
          "selectedIconPath": "/imgs/list_active.png",
          "text": "车池排序",
        },
        {
          "pagePath": "/pages/manager/manager",
          "iconPath": "/imgs/manage_logout.png",
          "selectedIconPath": "/imgs/manage_active.png",
          "text": "车队",
        }
      ]
    },
    list: []
  },
  attached() {
    const data = {
      currentPage: getCurrentPages()[0].route || ''
    }
    const userInfo = wx.getStorageSync('userInfo') || {
      manage: "出租车"
    };
    if (userInfo.manage == "管理员") {
      this.setData({
        ...data,
        list: this.data.allList.manager
      });
    } else {
      this.setData({
        ...data,
        list: this.data.allList.user
      });
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      let url = data.path;
      console.log(url != "/pages/airportInfo/airportInfo" && url != "/pages/eligibtDetial/eligibtDetial")
      if (url != "/pages/airportInfo/airportInfo" && url != "/pages/eligibtDetial/eligibtDetial") {
        let userInfo = wx.getStorageSync('userInfo') || null;
        if (!userInfo) {
          wx.showLoading({
            title: '验证用户信息',
          });
          this.wxLogin(url);
        } else if (!userInfo.manage) {
          wx.showModal({
            content: "请等待工作人员审核",
            showCancel: false,
            confirmText: "确定",
            success: (res) => {
              console.log("remove");
              // wx.removeStorageSync('userInfo');
            }
          });
        } else {
          wx.switchTab({
            url
          });
        }
      } else {
        wx.switchTab({
          url
        });
      }
    },

    goToRegister() {
      wx.navigateTo({
        url: '../index/index'
      });
    },

    wxLogin(url) {
      let that = this;
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
                if (res.statusCode === 200) {
                  console.log(res);
                  let openid = res.data.openid;
                  console.log(openid);
                  wx.setStorageSync('openid', openid);
                  that.login(openid, url);
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
              complete: (res) => {}
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
      } else {
        that.login(openid, url);
      }
    },

    login(openid, url) {
      wx.request({
        url: 'https://tsms1.sctfia.com/login',
        method: 'GET',
        data: {
          openid
        },
        success: (res) => {
          wx.hideLoading();
          let userInfo = res.data[0];
          console.log(res.data);
          wx.setStorageSync('userInfo', (typeof userInfo == 'string') ? null : userInfo);
          userInfo = wx.getStorageSync('userInfo');
          console.log(userInfo);
          if (userInfo) {
            //wx.setStorageSync('openid', userInfo.openid);
            // userInfo ? userInfo.manage = "出租车" : null;
          } else {
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
            return
          }

          if (userInfo["manage"] == null || userInfo["manage"] == '') {
            wx.showModal({
              content: "请等待工作人员审核",
              showCancel: false,
              confirmText: "确定",
              success: (res) => {
                console.log("remove");
                wx.removeStorageSync('userInfo');
              }
            });
            console.log("showModal");
            return;
          } else if (userInfo["manage"] == '未通过') {
            wx.showModal({
              content: "审核未通过，请重新注册",
              showCancel: false,
              confirmText: "确定",
              success: (res) => {
                wx.navigateTo({
                  url: '../index/index'
                });
                wx.removeStorageSync('userInfo');
              }
            });
            return;
          } else if (userInfo.manage == "管理员") {
            this.setData({
              list: this.data.allList.manager
            });
            console.log(url);
            if (url == "/pages/eligibility/eligibility") {
              url = "/pages/record/record";
            } else if (url == "/pages/mine/mine") {
              url = "/pages/manager/manager";
            }
            wx.switchTab({
              url
            });
          } else {
            wx.switchTab({
              url
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
        complete: (res) => {}
      });
    }
  }
})