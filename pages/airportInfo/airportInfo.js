// pages/aiportInfo/airportInfo.js
import MQConnector from '../../utils/MQConnector';

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  // js
  data: {
    loading: false,
    height: null,
    scrollHeight: 0,
    parkData: [{
        channel: "T1蓄车场",
        NUM: 0
      },
      {
        channel: "T2蓄车场",
        NUM: 0
      },
      {
        channel: "蓄车场总数",
        NUM: 0
      },
    ],
    channelData: [{
        id: 0,
        poolid: "T1补偿",
        NUM: 0
      },
      {
        id: 1,
        poolid: "T1排行道1",
        NUM: 0
      },
      {
        id: 2,
        poolid: "T1排行道2",
        NUM: 0
      },
      {
        id: 3,
        poolid: "T2排行道1",
        NUM: 0
      },
      {
        id: 4,
        poolid: "T2排行道2",
        NUM: 0
      },
      {
        id: 5,
        poolid: "T2补偿",
        NUM: 0
      }
    ],
    circle1: null,
    circle2: null
  },
  onLoad() {
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
    if (!app.globalData.client.connected) {
      wx.showLoading({
        title: '连接中',
      });
      MQConnector.connectMQ(app);
    }
    app.watch('parkData', this.watchBack);
    app.watch('channelData', this.watchBack);
    let scrollHeight = app.globalData.pgHeight - 60;
    this.setData({
      height: app.globalData.pgHeight,
      scrollHeight
    });
  },
  onShow() {
    let that = this;
    wx.request({
      url: 'https://tsms1.sctfia.com/status_num',
      method: 'GET',
      success(res) {
        // console.log(res);
        if (res.statusCode === 200) {
          let data = res.data[0];
          app.switchData(data.type, data.mark, data.data);
          that.drawCircle(that.data.parkData, that);
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
      complete() {}
    });
  },
  onUnload() {},
  drawCircle(parkData, that) {
    //定义画图大小	
    let width = app.globalData.width * 0.4;
    let height = app.globalData.width * 0.4;
    //获取中心坐标
    let centerPoint = {
      x: width / 2,
      y: height / 2
    }

    let ctx = wx.createCanvasContext('circle');
    ctx.save();
    ctx.translate(width / 2, height / 2); //画布移动到中心


    let each = 1; //每个线之间的间距度数
    let len = 270 / each; //总共画270度 每次5度 需要画多少条线
    let bili1 = 50 / 45; //比例 每一度代表多少值，用于画值 这里是 45度代表 50℃

    let line = 10; //每根线的长度
    let offset = 10; // 特殊度数的额外长度

    let smallCircleWidth = 1; //小点的半径
    let offsetCircle = 6; //小点距离线底部的距离

    let astart = 99;
    let bstart = 52;
    let cstart = 161;

    let aend = 216;
    let bend = 54;
    let cend = 115;

    let aeach = (aend - astart) / len;
    let beach = (bend - bstart) / len;
    let ceach = (cend - cstart) / len;

    ctx.rotate(45 * Math.PI / 180);

    // if (!parkData[0].NUM) {
    //   parkData[0].NUM = 300;
    // }

    let pre = parseInt(parkData[0].NUM / bili1 / each); //计算当前温度在第几根线
    ctx.setLineWidth(2);
    for (let i = 0; i < len; i++) {
      if (i > pre) {
        ctx.setStrokeStyle("#E0E0E0");
      } else {
        ctx.setStrokeStyle("rgb(" + (astart + i * aeach) + "," + (bstart + i * beach) + "," + (cstart + i * ceach) + ")");
      }
      ctx.beginPath();
      let point = {
        x: 0,
        y: centerPoint.y
      }
      let arrivePoint = {
        x: 0,
        y: point.y - line
      }
      // if (i == len / 2) {
      //   point.y = centerPoint.y;
      // } else {
      //   point.y = centerPoint.y - offset;
      // }
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(arrivePoint.x, arrivePoint.y);
      ctx.stroke();

      ctx.setFillStyle("#A0EEE1");
      ctx.beginPath();
      ctx.arc(arrivePoint.x, arrivePoint.y - offsetCircle - smallCircleWidth, smallCircleWidth, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate(each * Math.PI / 180);
    }

    ctx.restore();

    //画字
    let value1 = (parkData[0].NUM + "") || "125";
    let centerFontSize = 30;
    ctx.setFontSize(centerFontSize);
    ctx.setTextAlign("center");
    ctx.setTextBaseline("middle");
    ctx.setFillStyle("#F4606C");
    ctx.fillText(value1, centerPoint.x, centerPoint.y);

    ctx.setFontSize(18);
    ctx.setFillStyle("#000");
    ctx.fillText("T1蓄车场", centerPoint.x, 2 * centerPoint.y - (line + offset + smallCircleWidth * 2));

    //画单位
    let unitFontSize = 12;
    ctx.setTextAlign("center");
    ctx.setTextBaseline("middle");
    ctx.setFillStyle("#A0EEE1");
    ctx.setFontSize(unitFontSize);
    ctx.fillText(bili1 * 0 + "", (line + offset + offsetCircle + smallCircleWidth * 2) * 1.45, centerPoint.y * 1.5);
    ctx.fillText(bili1 * 45 + "", line + offset + offsetCircle + smallCircleWidth * 2, centerPoint.y);
    ctx.fillText(bili1 * 90 + "", (line + offset + offsetCircle + smallCircleWidth * 2) * 1.55, (line + offset + offsetCircle + smallCircleWidth * 2) * 1.55);
    ctx.fillText(bili1 * 135 + "", centerPoint.x, line + offset + offsetCircle + smallCircleWidth * 2);
    ctx.fillText(bili1 * 180 + "", centerPoint.x * 2 - (line + offset + offsetCircle + smallCircleWidth * 2) * 1.55, (line + offset + offsetCircle + smallCircleWidth * 2) * 1.55);
    ctx.fillText(bili1 * 225 + "", centerPoint.x * 2 - (line + offset + offsetCircle + smallCircleWidth * 2), centerPoint.y);
    ctx.fillText(bili1 * 270 + "", centerPoint.x * 2 - (line + offset + offsetCircle + smallCircleWidth * 2) * 1.55, centerPoint.y * 1.5);

    //画开启中
    let stateStr = "辆";
    ctx.setFontSize(15);
    ctx.setTextAlign("center");
    ctx.setTextBaseline("top");
    ctx.setFillStyle("#D1BA74");
    ctx.fillText(stateStr, centerPoint.x, centerPoint.y + centerFontSize / 2);
    ctx.save();
    ctx.draw();

    let ctx2 = wx.createCanvasContext('circle2');
    ctx2.save();
    ctx2.translate(width / 2, height / 2); //画布移动到中心

    let bili2 = 120 / 45; //比例 每一度代表多少值，用于画值 这里是 45度代表 50℃
    ctx2.rotate(45 * Math.PI / 180);

    // if (!parkData[1].NUM) {
    //   parkData[1].NUM = 720;
    // }

    let pre2 = parseInt(parkData[1].NUM / bili2 / each); //计算当前温度在第几根线
    ctx2.setLineWidth(2);
    for (let i = 0; i < len; i++) {
      if (i > pre2) {
        ctx2.setStrokeStyle("#E0E0E0");
      } else {
        ctx2.setStrokeStyle("rgb(" + (astart + i * aeach) + "," + (bstart + i * beach) + "," + (cstart + i * ceach) + ")");
      }
      ctx2.beginPath();
      let point = {
        x: 0,
        y: centerPoint.y
      }
      let arrivePoint = {
        x: 0,
        y: point.y - line
      }
      ctx2.moveTo(point.x, point.y);
      ctx2.lineTo(arrivePoint.x, arrivePoint.y);
      ctx2.stroke();

      ctx2.setFillStyle("#A0EEE1");
      ctx2.beginPath();
      ctx2.arc(arrivePoint.x, arrivePoint.y - offsetCircle - smallCircleWidth, smallCircleWidth, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.rotate(each * Math.PI / 180);
    }

    ctx2.restore();

    //画字
    let value2 = (parkData[1].NUM + "") || "125";
    // let centerFontSize = 30;
    ctx2.setFontSize(centerFontSize);
    ctx2.setTextAlign("center");
    ctx2.setTextBaseline("middle");
    ctx2.setFillStyle("#F4606C");
    ctx2.fillText(value2, centerPoint.x, centerPoint.y);
    ctx2.setFontSize(18);
    ctx2.setFillStyle("#000");
    ctx2.fillText("T2蓄车场", centerPoint.x, 2 * centerPoint.y - (line + offset + smallCircleWidth * 2));

    //画单位
    ctx2.setTextAlign("center");
    ctx2.setTextBaseline("middle");
    ctx2.setFillStyle("#A0EEE1");

    ctx2.setFontSize(unitFontSize);
    ctx2.fillText(bili2 * 0 + "", (line + offset + offsetCircle + smallCircleWidth * 2) * 1.45, centerPoint.y * 1.5);
    ctx2.fillText(bili2 * 45 + "", line + offset + offsetCircle + smallCircleWidth * 2, centerPoint.y);
    ctx2.fillText(bili2 * 90 + "", (line + offset + offsetCircle + smallCircleWidth * 2) * 1.55, (line + offset + offsetCircle + smallCircleWidth * 2) * 1.55);
    ctx2.fillText(bili2 * 135 + "", centerPoint.x, line + offset + offsetCircle + smallCircleWidth * 2);
    ctx2.fillText(bili2 * 180 + "", centerPoint.x * 2 - (line + offset + offsetCircle + smallCircleWidth * 2) * 1.55, (line + offset + offsetCircle + smallCircleWidth * 2) * 1.55);
    ctx2.fillText(bili2 * 225 + "", centerPoint.x * 2 - (line + offset + offsetCircle + smallCircleWidth * 2), centerPoint.y);
    ctx2.fillText(bili2 * 270 + "", centerPoint.x * 2 - (line + offset + offsetCircle + smallCircleWidth * 2) * 1.55, centerPoint.y * 1.5);

    //画开启中
    ctx2.setFontSize(15);
    ctx2.setTextAlign("center");
    ctx2.setTextBaseline("top");
    ctx2.setFillStyle("#D1BA74");
    ctx2.fillText(stateStr, centerPoint.x, centerPoint.y + centerFontSize / 2);
    ctx2.save();
    ctx2.draw();

    this.setData({
      circle1: ctx,
      circle2: ctx2
    })
  },
  watchBack: function (name, value) {
    if (name == "parkData") {
      this.setData({
        parkData: value
      });
      this.drawCircle(value, this);
    } else if (name == "channelData") {
      // console.log(value);
      this.setData({
        channelData: value
      });
    }
  }
})