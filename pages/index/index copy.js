// index.js
// 获取应用实例
const app = getApp();
import WxValidate from "../../utils/WxValidate";
Page({
  data: {
    content: '获取验证码',
    sendColor: '#363636',
    snsMsgWait: 60,
    smsFlag: false,
    binding: false,
    loading: false,
    checkbox: false,
    form: {
      name: null,
      phone: null,
      carid: '川A',
      captcha: null
    },
    flag: true,
    lock: false,
    lastVal: '',
    gongsi_select: 0,
    gongsi_list: ['加载中请稍等...'],
    companiesFilter: ['加载中请稍等...'],
    pic_xsz: null,
    pic_fwz: null,
    searchValue: '',
    selectIndex: 0,
    setValues: '',
    sourceType: ['camera', 'album']
  },
  onLoad(e) {
    var that = this;
    that.setData({
      // form: wx.getStorageSync('userInfo') || null,
      gongsi_select: wx.getStorageSync('gongsi_select') || 0,
    });
    that.initValidate(); //验证规则函数
    wx.request({
      url: 'https://tsms1.sctfia.com/b_gongsi',
      method: 'GET',
      success: (res) => {
        that.setData({
          gongsi_list: res.data,
          companiesFilter: res.data,
        });
      }
    });
  },

  showSelector() {
    const that = this;
    let companiesFilter = this.data.gongsi_list;
    if (companiesFilter[0].includes("加载中")) {
      console.log(!companiesFilter.length);
      wx.request({
        url: 'https://tsms1.sctfia.com/b_gongsi',
        method: 'GET',
        success: (res) => {
          that.setData({
            gongsi_list: res.data,
            companiesFilter: res.data
          });
        }
      });
    }
    let lastVal = this.data.lastVal;
    let lastIndex = this.data.gongsi_list.indexOf(lastVal);
    this.setData({
      flag: false,
      lock: false,
      searchValue: lastVal,
      selectIndex: lastIndex
    })
  },

  cancel() {
    let gongsi_list = this.data.gongsi_list;
    let lastVal = this.data.lastVal;
    this.setData({
      flag: true,
      searchValue: lastVal,
      companiesFilter: gongsi_list
    })
  },

  confirm() {
    let companiesFilter = this.data.companiesFilter;
    console.log(this.data.selectIndex, companiesFilter[this.data.selectIndex], companiesFilter.length);
    if (companiesFilter.length) {
      this.setData({
        searchValue: companiesFilter[this.data.selectIndex]
      })
    }
    companiesFilter = this.data.gongsi_list;
    let lastVal = this.data.searchValue;
    console.log(lastVal);
    this.setData({
      flag: true,
      lock: true,
      companiesFilter,
      lastVal
    });
  },

  bindChange(e) {
    let self = this;
    console.log(e.detail.value[0]);
    if (!this.data.lock && e.detail.value.length) {
      self.setData({
        // 用户选择的索引
        selectIndex: e.detail.value[0],
        searchValue: self.data.companiesFilter[e.detail.value[0]]
      });
    }
  },

  searchList(e) {
    let companiesFilter = this.data.gongsi_list.filter(item => {
      return item.includes(e.detail.value);
    });
    if (companiesFilter.length) {
      this.setData({
        companiesFilter
      });
    } else {
      this.setData({
        companiesFilter,
        searchValue: e.detail.value.replace(/\s+/g, '')
      })
    }

    // let self = this;
    // self.triggerEvent('searchList', e.detail);
  },

  onHide() {
    this.setData({
      binding: false
    });
  },
  getphone(e) {
    this.setData({
      ['form.phone']: e.detail.value
    });
  },
  getCaptcha(e) {
    this.setData({
      ['form.captcha']: e.detail.value
    });
  },
  gongsi_picker(e) {
    //console.log(e);
    wx.setStorageSync('gongsi_select', e.detail.value)
    this.setData({
      gongsi_select: e.detail.value,
    })
  },

  sendCaptcha: function () {
    let reg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
    console.log(this.data.form);
    let phone = this.data.form ? this.data.form.phone : null;
    if (!reg.test(phone)) {
      wx.showModal({
        content: "请输入正确手机号",
        showCancel: false,
        confirmText: "确定",
        success: (res) => {}
      });
      return
    }

    wx.request({
      url: 'https://tsms1.sctfia.com/captcha_send',
      method: 'GET',
      data: {
        phone
      },
      success: (res) => {
        // 60秒后重新获取验证码
        this.setData({
          smsFlag: true,
          sendColor: '#838383',
          content: this.data.snsMsgWait + 's后重发',
          snsMsgWait: this.data.snsMsgWait - 1
        });
        let inter = setInterval(function () {
          this.setData({
            smsFlag: true,
            sendColor: '#838383',
            content: this.data.snsMsgWait + 's后重发',
            snsMsgWait: this.data.snsMsgWait - 1
          });
          if (this.data.snsMsgWait < 0) {
            clearInterval(inter)
            this.setData({
              sendColor: '#363636',
              content: '获取验证码',
              snsMsgWait: 60,
              smsFlag: false
            });
          }
        }.bind(this), 1000);
      }
    })
  },
  showModal(error) {
    wx.showModal({
      content: error.msg,
      showCancel: false,
    })
  },
  initValidate() {
    const rules = {
      name: {
        required: true,
        name: true
      },
      carid: {
        required: true,
        carid: true
      },
      captcha: {
        required: true,
        captcha: true
      },
    }
    const messages = {
      name: {
        required: '请填写姓名',
        name: '请输入正确的姓名'
      },
      carid: {
        required: '请填写车牌号',
        carid: '请输入正确的车牌号'
      },
      captcha: {
        required: '请填写验证码',
        captcha: '请输入4位数验证码'
      }
    }
    this.WxValidate = new WxValidate(rules, messages);
    let that = this;
    this.WxValidate.addMethod('name', function (value, param) {
      return that.WxValidate.optional(value) || /^[\u4E00-\u9FA5]{2,10}(·[\u4E00-\u9FA5]{2,10}){0,2}$/
        .test(value);
    }, '请输入正确的姓名');

    this.WxValidate.addMethod('carid', function (value, param) {
      return that.WxValidate.optional(value) || /^([川A-Z]{1}[a-zA-Z](([DF]((?![IO])[a-zA-Z0-9](?![IO]))[0-9]{4})|([0-9]{5}[DF]))|[川A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1})$/.test(value);
    }, '请输入正确的车牌号');

    this.WxValidate.addMethod('captcha', function (value, param) {
      return that.WxValidate.optional(value) || /^\d{4}$/
        .test(value);
    }, '请输入4位数验证码');
  },
  formSubmit: function (e) {
    const params = e.detail.value;
    params.carid = params.carid.toUpperCase().replace(/\s+/g, '');
    params.name = params.name.replace(/\s+/g, '');
    var that = this;
    if (!this.data.pic_xsz) {
      wx.showModal({
        content: "请拍摄或上传行驶证",
        showCancel: true,
        confirmText: "确定",
        success: (res) => {}
      });
      return
    }
    if (!this.data.pic_fwz) {
      wx.showModal({
        content: "请拍摄或上传服务证",
        showCancel: true,
        confirmText: "确定",
        success: (res) => {}
      });
      return
    }
    if (!this.data.searchValue) {
      wx.showModal({
        content: "请选择或输入公司名称",
        showCancel: true,
        confirmText: "确定",
        success: (res) => {}
      });
      return
    }

    // 校验表单
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      this.showModal(error)
      return false
    }

    // let data = e.detail.value;
    if (!this.data.checkbox) {
      wx.showModal({
        content: "请阅读并同意《用户协议》及《隐私协议》",
        showCancel: true,
        confirmText: "确定",
        success: (res) => {}
      });
      return
    }
    params.xsz = that.data.pic_xsz;
    params.fwz = that.data.pic_fwz;

    console.log(params);
    this.register(params);
  },
  binding: function (e) {
    let params = e.detail.value
    // 校验表单
    if (!/^\d{4}$/.test(params.captcha)) {
      wx.showModal({
        content: "请输入4位数验证码",
        showCancel: false,
        confirmText: "确定",
        success: (res) => {
          if (res.confirm) {
            this.setData({
              ['form.captcha']: null
            })
          }
        }
      });
      return false
    }
    // let data = e.detail.value;
    this.submit(params.captcha);
  },
  register(params) {
    wx.showLoading({
      title: '请稍等...',
    });
    wx.showLoading({
      title: '注册中',
    });
    this.setData({
      loading: true
    });
    let that = this;
    const openid = wx.getStorageSync('openid') || null;
    wx.request({
      url: 'https://tsms1.sctfia.com/user_exist',
      method: 'GET',
      data: {
        phone: params.phone
      },
      success: (res) => {
        console.log(res);
        params.openid = openid;
        wx.request({
          url: 'https://tsms1.sctfia.com/register',
          method: 'POST',
          data: params,
          success: (res) => {
            console.log(params);
            console.log(res);
            let content = "";
            this.setData({
              loading: false
            });
            wx.hideLoading();
            console.log(res.data);
            if (res.data == "success") {
              content = "注册成功";
              wx.showModal({
                content: content,
                showCancel: false,
                confirmText: "确定",
                success: (res) => {
                  if (res.confirm) {
                    wx.navigateTo({
                      url: '../announce/announce'
                    });
                  }
                }
              });
            } else if (res.data == "captcha_error") {
              content = "验证码错误";
              wx.showModal({
                content: content,
                showCancel: false,
                confirmText: "确定",
                success: (res) => {
                  // that.setData({
                  //   ['form.captcha']: null
                  // });
                }
              });
            } else {
              content = "注册失败";
              wx.showModal({
                content: content,
                showCancel: false,
                confirmText: "确定",
                success: (res) => {
                  that.setData({
                    ['form.captcha']: null
                  });
                }
              });
            }
          }
        });
      }
    });
  },

  handleCarIdInput(e) {
    const value = e.detail.value;
    const uppercaseValue = value.toUpperCase();
    console.log(uppercaseValue);

    this.setData({
      'form.carid': uppercaseValue
    });
  },

  buttonclick: function (e) {
    let tag = e.currentTarget.dataset.tag;
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
          that.chooseImage(res.tapIndex, tag);
        }
      },
      //失败时回调
      fail: function (res) {
        console.log('调用失败')
      },
      complete: function (res) {},
    })
  },
  chooseImage(tapIndex, tag) {
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
        wx.setStorageSync('tempFilePaths', tempFilePaths);
        wx.getFileSystemManager().readFile({
          filePath: tempFilePaths[0], //选择图片返回的相对路径
          encoding: 'base64', //编码格式
          success: res => { //成功的回调
            wx.setStorageSync("base64Img", 'data:image/png;base64,' + res.data);
            that.setData({
              ['pic_' + tag]: wx.getStorageSync("base64Img")
            });
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
        });
      },
      fail() {
        return (new Error('ERROR_BASE64SRC_WRITE'));
      },
    });
  },
})