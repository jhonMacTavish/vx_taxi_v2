// pages/manager/manager.js
import drawQrcode from '../../utils/weapp.qrcode.esm';
const dateUtils = require('../../utils/dateutils.js');
import dayjs from '../../utils/dayjs.min';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: null,
    appealed: false,
    judged: null,
    imgSrc: '',
    sourceType: ['camera', 'album'],
    base64ImgPath: "",
    carid: "",
    date: '2024-04-29',
    array: [],
    index: 0,
    list: [{
      time: "没有时间记录",
      con: "蓄车场驶入时间"
    }, {
      time: "没有时间记录",
      con: "蓄车场驶出时间"
    }, {
      time: "没有时间记录",
      con: "航站楼驶入时间"
    }, {
      time: "没有时间记录",
      con: "航站楼驶出时间"
    }],
    convoy: [{
      time: "没有时间记录",
      con: "行程开始时间"
    }, {
      time: "没有时间记录",
      con: "行程结束时间"
    }],
    itinerary: [{}, {}],
    timer: null,

    isShowPicker: false,
    data: {},
    date: new Date().getTime(),
    dateText: dayjs(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss")
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
    if (!app.globalData.client.connectFlag) {
      app.globalData.client.connectFlag = true;
    }

    let array = [];
    for (let i = 1; i <= 30; i++) {
      let str = i + ' km';
      array.push(str);
    }
    this.setData({
      array
    });
    let height = app.globalData.pgHeight;
    let carid = wx.getStorageSync('userInfo').carid;
    this.setData({
      height,
      carid
    });
    wx.request({
      url: 'https://tsms1.sctfia.com/car_process',
      data: {
        carid
      },
      method: 'GET',
      success(res) {
        console.log(res.data);
        if (res.data.length) {
          let data = res.data[0].process;
          let processid = data.id;
          // console.log(data);
          let arr = that.data.list;
          // console.log(res.data);
          for (let i = 0; i < 4; i++) {
            switch (i) {
              case 0:
                arr[i].time = data.poolInTime;
                break;
              case 1:
                arr[i].time = data.poolOutTime;
                break;
              case 2:
                arr[i].time = data.terminalInTime;
                break;
              case 3:
                arr[i].time = data.terminalOutTime;
                break;
              default:
                break;
            }
          }
          let eligibility = {};
          that.setData({
            list: arr,
            eligibility
          })
          eligibility.pdInTime = data.pdInTime;
          if (data.pdInTime) {
            wx.request({
              url: 'https://tsms1.sctfia.com/car_meter',
              data: {
                processid
              },
              method: 'GET',
              success(res) {
                console.log(res.data);
                if (res.data.length) {
                  let data = res.data[0].process_meter;
                  console.log(data);
                  let itinerary = that.data.itinerary;
                  console.log(itinerary);
                  itinerary[0].time = data.timeGetOn ? data.timeGetOn : "没有时间记录";
                  itinerary[1].time = data.timeGetOff ? data.timeGetOff : "没有时间记录";
                  that.setData({
                    itinerary,
                    eligibility
                  });
                } else {
                  that.setData({
                    eligibility
                  });
                }
              }
            });
          } else {
            // wx.request({
            //   url: 'https://tsms1.sctfia.com/batch_car_list',
            //   data: {
            //     carid
            //   },
            //   method: 'GET',
            //   success(res) {
            //     // console.log(res.data);
            //     if (res.data.length) {
            //       let carList = res.data[0].carList;
            //       console.log(carList);
            //       that.setData({
            //         convoy: carList
            //       });
            //     } else {
            //       that.setData({
            //         convoy: []
            //       });
            //     }

            //   }
            // });
          }
        } else {
          that.setData({
            convoy: []
          })
        }
      }
    });
    let timer = setInterval(function () {
      wx.request({
        url: 'https://tsms1.sctfia.com/car_process',
        data: {
          carid
        },
        method: 'GET',
        success(res) {
          console.log(res.data);
          if (res.data.length) {
            let data = res.data[0].process[0];
            let processid = data.id;
            console.log(data);
            let arr = that.data.list;
            for (let i = 0; i < 4; i++) {
              switch (i) {
                case 0:
                  arr[i].time = data.poolInTime;
                  break;
                case 1:
                  arr[i].time = data.poolOutTime;
                  break;
                case 2:
                  arr[i].time = data.terminalInTime;
                  break;
                case 3:
                  arr[i].time = data.terminalOutTime;
                  break;
                default:
                  break;
              }
            }
            that.setData({
              list: arr,
              eligibility
            })
            let eligibility = {};
            eligibility.pdInTime = data.pdInTime;
            if (data.pdInTime) {
              wx.request({
                url: 'https://tsms1.sctfia.com/car_meter',
                data: {
                  processid
                },
                method: 'GET',
                success(res) {
                  // console.log(res.data);
                  if (res.data.length) {
                    let data = res.data[0].process_meter;
                    let itinerary = that.data.itinerary;
                    itinerary[0].time = data.timeGetOn;
                    itinerary[1].time = data.timeGetOff;
                    that.setData({
                      itinerary,
                      eligibility
                    });
                  } else {
                    that.setData({
                      eligibility
                    });
                  }
                }
              });
            } else {
              // wx.request({
              //   url: 'https://tsms1.sctfia.com/batch_car_list',
              //   data: {
              //     carid
              //   },
              //   method: 'GET',
              //   success(res) {
              //     // console.log(res.data);
              //     if (res.data.length) {
              //       let carList = res.data[0].carList;
              //       that.setData({
              //         convoy: carList
              //       });
              //     } else {
              //       that.setData({
              //         convoy: []
              //       });
              //     }
              //   }
              // });
            }
          } else {
            that.setData({
              convoy: []
            })
          }
        }
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
      text: that.data.carid, // 必须，二维码内容
      image: {
        dx: 100,
        dy: 100,
        dWidth: 100,
        dHeight: 100
      }
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this;
    let carid = this.data.carid;
    // wx.request({
    //   url: 'https://tsms1.sctfia.com/pd_judge_res',
    //   data: {
    //     carid: this.data.carid
    //   },
    //   method: 'GET',
    //   success(res) {
    //     // console.log(res.data);
    //     if (res.data.length) {
    //       let appealed = true;
    //       let judged = res.data[0].judged;
    //       let dateText = res.data[0].time_get_on;
    //       let index = res.data[0].run_odometer;
    //       let imgSrc = res.data[0].pic;
    //       that.setData({
    //         appealed, judged, dateText, index, imgSrc
    //       });
    //     }
    //   }
    // });
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
  onHide() {
    clearInterval(this.data.timer);
  },
  onUnload() {},
  upload() {
    let that = this;
    let params = {
      openid: wx.getStorageSync('openid') || null,
      time_get_on: this.data.dateText,
      run_odometer: this.data.index + 1 + '',
      pic: wx.getStorageSync("base64Img")
    }
    wx.request({
      url: 'https://tsms1.sctfia.com/pd_judge_upload',
      data: params,
      method: "POST",
      success: (result) => {
        wx.request({
          url: 'https://tsms1.sctfia.com/pd_judge_res',
          data: {
            carid: this.data.carid
          },
          method: 'GET',
          success(res) {
            console.log(res.data);
            if (res.data.length) {
              let appealed = true;
              let judged = res.data[0].judged;
              let dateText = res.data[0].time_get_on;
              let index = res.data[0].run_odometer;
              let imgSrc = res.data[0].pic;
              that.setData({
                appealed,
                judged,
                dateText,
                index,
                imgSrc
              });
            }
          }
        });
      },
      fail: (err) => {},
      complete: (res) => {},
    });
  },
  user_delete() {
    let phone = wx.getStorageSync('userInfo').phone;
    wx.showModal({
      title: '注销账号会删除账号所有数据，确定要注销账号吗',
      showCancel: true,
      confirmText: "确定",
      success: (res) => {
        console.log(res.content == "注销账号");
        if (res.confirm) {
          wx.request({
            url: 'https://tsms1.sctfia.com/user_delete2',
            data: {
              "phone": phone
            },
            method: "POST",
            success: (result) => {
              wx.clearStorage();
              wx.redirectTo({
                url: "/pages/announce/announce"
              });
              wx.removeStorageSync('mediaSrc');
            },
            fail: (err) => {},
            complete: (res) => {},
          });
        } else {
          return
        }
      }
    });
  },
  onYMDhms: function (e) {
    this.setData({
      isShowPicker: true,
      mode: "YMDhms",
      data: {
        type: "YMDhms"
      }
    })
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  // bindTimeChange: function (e) {
  //   console.log('picker发送选择改变，携带值为', e.detail.value)
  //   this.setData({
  //     time: e.detail.value
  //   })
  // },
  datePickerCancellEvent: function (e) {
    this.setData({
      isShowPicker: false
    })
    console.log(e)
  },
  datePickerOkEvent: function (e) {
    this.setData({
      isShowPicker: false
    })
    let date = e.detail.date;
    console.log(date);
    this.setData({
      dateText: dateUtils.formatLongTime(date, "Y-M-D h:m:s")
    })
  },
  buttonclick: function () {
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
    })
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
            console.log('data:image/png;base64,' + res.data);
            wx.setStorageSync("base64Img", 'data:image/png;base64,' + res.data);
            that.getToLocal();
          },
          fail: res => {
            console.log("fail", res);
          },
          complete: res => {
            console.log("complete", res);
          }
        });
        that.setData({
          imgSrc: wx.getStorageSync("base64Img")
        })
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
})