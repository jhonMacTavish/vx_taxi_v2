// pages/announce/announce.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: null,
    btnBottom: 50,
    noticeList: [],
    currentPage: 0,
    contentHeight: 0,
    tips: ['近程补偿使用手册', '公告'],
    imageUrl: ['https://tsms1.sctfia.com/img/mannue_01.jpg', 'https://tsms1.sctfia.com/img/mannue_02.jpg', 'https://tsms1.sctfia.com/img/mannue_03.jpg', 'https://tsms1.sctfia.com/img/mannue_04.jpg', 'https://tsms1.sctfia.com/img/mannue_05.jpg'],
    countdown: 5,
    clickable: false,
    mediaSrc: 'null'
  },

  goToRegister() {
    wx.navigateTo({
      url: '../index/index'
    });
  },

  confirm() {
    const currentPage = this.data.currentPage;
    let timer = null;
    if (currentPage == 0) {
      this.setData({
        currentPage: 1,
        countdown: 5,
        clickable: false
      });
      this.calculateContentHeight();
      let countdown = this.data.countdown;
      timer = setInterval(() => {
        this.setData({
          countdown: --countdown
        });
        if (countdown <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    } else {
      wx.switchTab({
        url: '/pages/airportInfo/airportInfo',
      });
    }
  },

  goToDetail() {
    wx.navigateTo({
      url: '../eligibtDetial/eligibtDetial'
    });;
  },

  calculateContentHeight() {
    const query = wx.createSelectorQuery();
    query.select('.content2').boundingClientRect(rect => {
      this.setData({
        contentHeight: rect.height
      });
      this.checkContentHeight(rect.height);
    }).exec();
  },

  checkContentHeight(currentHeight) {
    const query = wx.createSelectorQuery();
    query.select('.scroll-view-class').boundingClientRect(scrollRect => {
      if (scrollRect.height >= currentHeight) {
        // 直接在这里处理逻辑
        this.handleContentFullyDisplayed();
      }
    }).exec();
  },

  handleContentFullyDisplayed() {
    this.setData({
      clickable: true
    });
  },

  onScrollToLower() {
    this.setData({
      clickable: true
    });
  },

  downloadVideo() {
    const that = this;
    wx.downloadFile({
      url: 'https://tsms1.sctfia.com/video/video.mp4', // 视频地址
      success(res) {
        if (res.statusCode === 200) {
          const tempFilePath = res.tempFilePath; // 下载的临时文件路径
          wx.saveFile({
            tempFilePath: tempFilePath,
            success(saveRes) {
              const savedFilePath = saveRes.savedFilePath;
              console.log('文件保存成功：', savedFilePath);
              // 这里可以用 savedFilePath 播放视频
              wx.setStorageSync('mediaSrc', savedFilePath)
            },
            fail(err) {
              console.log('文件保存失败：', err);
            }
          });
          that.setData({
            mediaSrc: tempFilePath
          });
        }
      },
      fail: function (err) {
        console.log('下载失败', err.errMsg);
        wx.showToast({
          icon: 'none',
          title: err.errMsg
        });
        setTimeout(() => {
          that.downloadVideo();
        }, 3000);
      }
    });

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    setTimeout(() => {
      const mediaSrc = wx.getStorageSync('mediaSrc');
      if (mediaSrc) {
        that.setData({
          mediaSrc
        });
      } else {
        that.downloadVideo();
      }
    }, 1500);

    let timer = null;
    let btnBottom = app.globalData.btnBottom / 2;
    this.setData({
      height: app.globalData.pgHeight,
      btnBottom
    });

    let noticeList = app.globalData.noticeList;
    let countdown = this.data.countdown;
    timer = setInterval(() => {
      this.setData({
        countdown: --countdown
      });
      if (countdown <= 0)
        clearInterval(timer);
    }, 1000);
    if (!noticeList.length) {
      wx.request({
        url: 'https://tsms1.sctfia.com/s_note',
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200) {
            noticeList = res.data;
            this.setData({
              noticeList
            });
            app.globalData.noticeList = noticeList;
            // timer = setInterval(() => {
            //   this.setData({
            //     countdown: --countdown
            //   });
            //   if (countdown <= 0)
            //     clearInterval(timer);
            // }, 1000);
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
    } else {
      this.setData({
        noticeList
      });
      // timer = setInterval(() => {
      //   this.setData({
      //     countdown: --countdown
      //   });
      //   if (countdown <= 0)
      //     clearInterval(timer);
      // }, 1000);
    }
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