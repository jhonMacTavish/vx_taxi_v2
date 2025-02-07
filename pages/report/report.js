// pages/announce/announce.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnBottom: 50,
    sourceType: ['camera', 'album'],
    record: {},
    imgSrc: '',
    btnDisabled: false
  },

  confirm() {
    if (!this.data.imgSrc) {
      wx.showModal({
        content: "请选择图片凭据",
        showCancel: false,
        confirmText: "确定",
        success: (res) => {}
      });
      return
    } else {
      wx.showLoading({
        title: '提交中',
      });
      this.setData({
        btnDisabled: true
      });
      let params = {
        openid: wx.getStorageSync('openid') || null,
        processid: this.data.record.processid,
        terminal_out_time: this.data.record.terminal_out_time,
        pic: this.data.imgSrc
      };
      console.log(params);
      wx.request({
        url: 'https://tsms1.sctfia.com/pd_judge_upload',
        data: params,
        method: "POST",
        success: (res) => {
          wx.hideLoading();
          console.log(res.data);
          if (res.data == "success") {
            wx.showToast({
              title: '申报成功'
            });
            setTimeout(() => {
              wx.switchTab({
                url: "/pages/eligibility/eligibility"
              });
            }, 1000);
          } else {
            wx.showToast({
              title: res.data || '行程异常',
              icon: 'error'
            });
          }
          this.setData({
            btnDisabled: false
          });
        },
        fail: (res) => {
          wx.hideLoading();
          wx.showToast({
            title: '网络异常',
            icon: 'error'
          });
          this.setData({
            btnDisabled: false
          });
        }
      });
    }
  },

  buttonclick: function () {
    if (this.data.btnDisabled) {
      return
    } else {
      const that = this
      wx.showActionSheet({
        itemList: ['拍照', '相册'],
        itemColor: '',
        //成功时回调
        success: function (res) {
          if (!res.cancel) {
            /*
             res.tapIndex返回用户点击的按钮序号，从上到下的顺序，从0开始
             比如用户点击本例中的拍照就返回0，相册就返回1
             我们res.tapIndex的值传给chooseImage()
            */
            that.chooseImage(res.tapIndex)
          }
        },
        //失败时回调
        fail: function (res) {
          console.log('调用失败')
        },
        complete: function (res) {},
      });
    }
  },
  chooseImage(tapIndex) {
    const checkeddata = true
    const that = this
    wx.chooseImage({
      //count表示一次可以选择多少照片
      count: 1,
      //sizeType所选的图片的尺寸，original原图，compressed压缩图
      sizeType: ['original', 'compressed'],
      //如果sourceType为camera则调用摄像头，为album时调用相册
      sourceType: [that.data.sourceType[tapIndex]],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        //将选择到的图片缓存到本地storage中
        console.log(tempFilePaths);
        wx.setStorageSync('tempFilePaths', tempFilePaths);
        wx.getFileSystemManager().readFile({
          filePath: tempFilePaths[0], //选择图片返回的相对路径
          encoding: 'base64', //编码格式
          success: res => { //成功的回调
            wx.setStorageSync("base64Img", 'data:image/png;base64,' + res.data);
            that.setData({
              imgSrc: wx.getStorageSync("base64Img")
            })
            that.getToLocal();
          },
          fail: res => {
            console.log("fail", res);
          },
          complete: res => {
            console.log("complete", res);
          }
        });
      }
    })
  },
  getToLocal() {
    let that = this;
    var base64data = ""; // base64
    base64data = wx.getStorageSync("base64Img");
    const fsm = wx.getFileSystemManager();
    const FILE_BASE_NAME = 'tmp_base64src'; //自定义文件名
    const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
    if (!format) {
      return (new Error('ERROR_BASE64SRC_PARSE'));
    }
    const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
    const buffer = wx.base64ToArrayBuffer(bodyData);
    fsm.writeFile({
      filePath,
      data: buffer,
      encoding: 'binary',
      success(r) {
        console.log(r, 'r')
        console.log(filePath, 'filePath');
        that.setData({
          base64ImgPath: filePath
        })
      },
      fail() {
        return (new Error('ERROR_BASE64SRC_WRITE'));
      },
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const pages = getCurrentPages();
    let prePage = pages[pages.length - 2];
    let btnBottom = app.globalData.btnBottom / 2;
    this.setData({
      btnBottom,
      record: prePage.data.record[0]
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