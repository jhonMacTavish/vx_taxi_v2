import mqtt from './mqtt.js';

const host = 'wxs://tsms2.sctfia.com/mqtt';

class MQConnector{
  static connectMQ(app) {
    if (app.globalData.client.connected) return;  // 已连接无需再次连接
    
    app.data.client = mqtt.connect(host, app.data.options);

    // 连接成功
    app.data.client.on('connect', (connack) => {
      this.subTopic(app); // 订阅主题
      app.globalData.client.connectFlag = false;
    });

    // 处理消息
    app.data.client.on("message", (topic, payload) => {
      try {
        const fme_data = JSON.parse(payload);
        if (fme_data.type) app.switchData(fme_data.type, fme_data.mark, fme_data.data);
      } catch (error) {
        console.error('消息解析失败:', error);
      }
    });

    // 处理错误
    app.data.client.on("error", (error) => {
      console.error("MQTT连接错误:", error);
    });

    // 处理重连
    app.data.client.on("reconnect", (res) => {
      console.log("重连中...", res);
    });

    // 离线
    app.data.client.on("offline", (err) => {
      console.log("连接离线:", err);
    });

    app.globalData.client = app.data.client;
  }

  static subTopic(app) {
    if (app.data.client && app.data.client.connected) {
      app.data.client.subscribe('topic/taxi', (err) => {
        wx.hideLoading();
        if (!err) {
          wx.showToast({ title: '连接成功' });
        } else {
          wx.showToast({ title: '连接失败', icon: 'error', duration: 2000 });
        }
      });
    } else {
      wx.showToast({ title: '请先连接服务器', icon: 'none', duration: 2000 });
    }
  }
}

export default MQConnector;