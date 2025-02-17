// custom-tab-bar/index.js
Component({
  data: {
    currentPage: '',
    color: "#B9B9B9",
    selectedColor: "#07C160",
    borderStyle: "black",
    backgroundColor: "#ffffff",
    allList: {
      user: [
        {
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
      manager: [
        {
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
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1]?.route || '';
    const userInfo = wx.getStorageSync('userInfo') || { manage: "" };

    this.setData({
      currentPage,
      list: userInfo.manage === "管理员" ? this.data.allList.manager : this.data.allList.user
    });
  },

  methods: {
    async switchTab(e) {
      const url = e.currentTarget.dataset.path;
      const restrictedPages = new Set([
        "/pages/airportInfo/airportInfo",
        "/pages/eligibtDetial/eligibtDetial"
      ]);

      if (!restrictedPages.has(url)) {
        const userInfo = wx.getStorageSync('userInfo');

        if (!userInfo) {
          wx.showLoading({ title: '验证用户信息' });
          return this.wxLogin(url);
        }

        if (!userInfo.manage) {
          return this.showModal("请等待工作人员审核");
        }
      }

      wx.switchTab({ url });
    },

    goToRegister() {
      wx.navigateTo({ url: '../index/index' });
    },

    async wxLogin(url) {
      const openid = wx.getStorageSync('openid');

      if (!openid) {
        try {
          const { code } = await wx.login();
          const res = await this.requestOpenId(code);

          if (res?.statusCode === 200) {
            const newOpenid = res.data.openid;
            wx.setStorageSync('openid', newOpenid);
            return this.login(newOpenid, url);
          } else {
            return this.showToast('服务异常');
          }
        } catch {
          return this.showToast('网络异常');
        }
      }

      this.login(openid, url);
    },

    requestOpenId(code) {
      return new Promise((resolve, reject) => {
        wx.request({
          url: 'https://tsms1.sctfia.com/openid',
          method: 'GET',
          data: { code },
          success: resolve,
          fail: reject
        });
      });
    },

    async login(openid, url) {
      try {
        const res = await this.requestLogin(openid);
        wx.hideLoading();

        let userInfo = res?.data?.[0] || null;
        wx.setStorageSync('userInfo', typeof userInfo === 'string' ? null : userInfo);
        userInfo = wx.getStorageSync('userInfo');

        if (!userInfo) {
          return this.showModal("请先注册账号", this.goToRegister);
        }

        switch (userInfo.manage) {
          case null:
          case '':
            return this.showModal("请等待工作人员审核", () => wx.removeStorageSync('userInfo'));
          case '未通过':
            return this.showModal("审核未通过，请重新注册", () => {
              wx.navigateTo({ url: '../index/index' });
              wx.removeStorageSync('userInfo');
            });
          case '管理员':
            this.setData({ list: this.data.allList.manager });
            url = url === "/pages/eligibility/eligibility" ? "/pages/record/record" :
                  url === "/pages/mine/mine" ? "/pages/manager/manager" : url;
        }

        wx.switchTab({ url });

      } catch {
        return this.showToast('网络异常');
      }
    },

    requestLogin(openid) {
      return new Promise((resolve, reject) => {
        wx.request({
          url: 'https://tsms1.sctfia.com/login',
          method: 'GET',
          data: { openid },
          success: resolve,
          fail: reject
        });
      });
    },

    showModal(content, callback) {
      wx.showModal({
        content,
        showCancel: false,
        confirmText: "确定",
        success: (res) => res.confirm && callback?.()
      });
    },

    showToast(title) {
      wx.showToast({
        title,
        icon: 'error',
        duration: 2000
      });
    }
  }
});
