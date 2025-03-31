// utils/mqttUtils.js
export class MQTTClient {
  constructor(options) {
    this.options = {
      protocolVersion: 5,
      clean: false,
      keepalive: 30,
      connectTimeout: 60_000,
      ...options
    };
    this.reconnectAttempts = 0;
  }

  connect() {
    this.client = wx.connectMqtt({
      ...this.options,
      success: () => {
        this.reconnectAttempts = 0;
        this.onConnect?.();
      },
      fail: (err) => this.handleError(err)
    });

    this.client.onMessage((res) => {
      this.onMessage?.(res.topic, res.payload);
    });

    this.client.onClose(() => {
      this.reconnect();
    });
  }

  reconnect() {
    if (this.reconnectAttempts >= 5) {
      wx.showToast({ title: "MQTT连接异常", icon: "none" });
      return;
    }

    const delay = this.options.reconnectStrategy(++this.reconnectAttempts);
    setTimeout(() => this.connect(), delay);
  }

  handleError(err) {
    console.error('MQTT Error:', err);
    wx.showToast({ title: "连接异常", icon: "none" });
  }
}