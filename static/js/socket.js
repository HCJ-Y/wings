const wsUrl = "wss://yuetu.moonrabbit2024.com/ws"
// const wsUrl = "ws://8.141.5.4:6655"
import http from "./http.js"
const socket = {
	isHave : false,
	reSocketTime:null,
	pingTime:null,
	socketTask:null,
	fromid:"",
	/// 绑定socket
	async bindclient_idHttp(socketInfo) {
	    let id = uni.getStorageSync("userInfo").id;
		const res = await http({
			url: "/api/gateway/binduid",
			data:{ uid:id, client_id: socketInfo.client_id }
		}, false)
		getApp().globalData.client_id = socketInfo.client_id
		console.log("绑定用户client_id",socketInfo.client_id,"成功");
		uni.$emit("bindclient_id")
	},
	getMsg(resolve){
		const self = this
		this.socketTask.onMessage(async function (msg) {
			let json = JSON.parse(msg.data)
			if (json.type == 'say'||json.type == 'groupchat') {
				getApp().globalData.is_sansuo = true
				console.log(getApp().globalData.is_sansuo);
				uni.setTabBarItem({
					index:3,
					iconPath:"/static/imgs/1.gif"
				})
			}
			if(json.type == 'onConnect'){
				self.bindclient_idHttp(json)
			}else if (json.type == 'pong'){
				// console.log(json);
			}else{
				// resolve && resolve(json) //成功,将数据返回
				uni.$emit("onGetMsg",json)
			}
		});
	},
	socket(fromid){
		this.fromid = fromid
		const token = uni.getStorageSync('token') || ''
		const self = this
		this.socketTask = uni.connectSocket({
			url: wsUrl,
			// url: wsUrl+"?token="+token+"&id="+self.fromid,
			header: {
				'content-type': 'application/json'
			},
			success(data) {
				console.log("websocket创建成功");
			},
			fail: (err) => {
				console.log("报错", err);
			}
		});
		this.socketTask.onOpen(()=>{
			self.isHave = true
			console.log("websocket连接成功");
			let id = uni.getStorageSync("userInfo").id;
			self.sendMsg({'type':'ping',id:id})
			if (self.reSocketTime) {
				clearInterval(self.reSocketTime)
				self.reSocketTime = null
			}
			if (!self.pingTime) {
				self.pingTime = setInterval(() => {
					self.sendMsg({'type':'ping',"id":id})
				}, 1000 * 10)
			}
		})
		this.getMsg()
		this.onScoketClose()
		this.onSocketError()
	},
	reconnect() {
		const self = this
	    //如果不是人为关闭的话，进行重连
		if (this.pingTime) {
			clearInterval(this.pingTime)
			this.pingTime = null
		}
		if (!this.reSocketTime) {
			this.reSocketTime = setInterval(() => {
			    self.socket(self.fromid);
			}, 5000);
		}
	},
	sendMsg(data){
		this.socketTask.send({
			data:JSON.stringify(data),
			success() {
				if (data.type != 'ping') {
					console.log('发送消息成功',data);
				}
			},
			fail(err) {
				// this.reconnect()
			}
		})
	},
	onScoketClose() {
		const self = this
	    this.socketTask.onClose(function (res) {
			if (self.isHave) {
				console.log("WebSocket 已关闭！重新连接中");
				self.reconnect()
			}else{
				self.socketTask = null
			}
	    });
	},
	onSocketError(){
	    let self = this;
	    this.socketTask.onError(function (res) {
	        console.log('WebSocket连接打开失败，请检查！');
	        self.reconnect()
	    });
	},
	close(){
		if (this.pingTime) {
			clearInterval(this.pingTime)
			this.pingTime = null
		}
		if (this.reSocketTime) {
			clearInterval(reSocketTime)//断线重连定时器
			this.reSocketTime = null
		}
		this.isHave = false
		this.socketTask.close(); // 确保已经关闭后再重新打开
		console.log('WebSocket连接手动关闭！');
	}
}

export default socket;
