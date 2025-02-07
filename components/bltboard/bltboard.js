// components/bltboard/bltboard.js
const app = getApp();
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
    text: "公告：",
    animation: null,
    timer: null,
    duration: 0,
    textWidth: 0,
    wrapWidth: 0,
    client: {
      connected: false
    }
  },

  lifetimes: {
    attached() {
      let noticeList = app.globalData.noticeList;
      let content = "";
      for (let i = 0; i < noticeList.length; i++) {
        content = content + (i + 1) + '.' + noticeList[i].note + ' ';
      }
      content = this.data.text + content;
      this.setData({
        text: content
      })
      this.initAnimation(this.data.text);
    },
    moved() {
      this.destroyTimer();
      this.setData({
        timer: null
      });
    },
    detached() {
      this.destroyTimer();
      this.setData({
        timer: null
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    logout() {
      wx.showModal({
        content: '确认要注销登录吗',
        complete: (res) => {
          if (res.confirm) {
            wx.removeStorageSync('userInfo');
            wx.removeStorageSync('openid');
            // wx.redirectTo({
            //   url: '../announce/announce'
            // });
            wx.navigateTo({
              url: '../announce/announce'
            });
          }
        }
      });
    },
    destroyTimer() {
      if (this.data.timer) {
        clearTimeout(this.data.timer);
      }
    },
    initAnimation(text) {
      let that = this
      this.data.duration = 15000
      this.data.animation = wx.createAnimation({
        duration: this.data.duration,
        timingFunction: 'linear'
      })
      let query = wx.createSelectorQuery().in(this)
      query.select('.announce_box').boundingClientRect()
      query.select('.announce_text').boundingClientRect()
      query.exec((rect) => {
        that.setData({
          wrapWidth: rect[0].width,
          textWidth: rect[1].width
        }, () => {
          this.startAnimation()
        })
      })
    },
    startAnimation() {
      //reset
      // this.data.animation.option.transition.duration = 0
      const resetAnimation = this.data.animation.translateX(this.data.wrapWidth).step({
        duration: 0
      })
      this.setData({
        animationData: resetAnimation.export()
      })
      // this.data.animation.option.transition.duration = this.data.duration
      const animationData = this.data.animation.translateX(-this.data.textWidth - 60).step({
        duration: this.data.duration
      })
      setTimeout(() => {
        this.setData({
          animationData: animationData.export()
        })
      }, 100)
      const timer = setTimeout(() => {
        this.startAnimation()
      }, this.data.duration)
      this.setData({
        timer
      })
    },
  }
})