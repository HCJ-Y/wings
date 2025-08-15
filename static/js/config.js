import base from "./baseUrl.js";
import i18n from "../lang/index.js"
import http from "./http.js"

var configval = {
	base_imageurl: base.baseUrl,
	base: base,
	checkLogin(is_toLogin) {
		let isLogin = uni.getStorageSync("isLogin") || false
		let is_has_token = (uni.getStorageSync("token") != '') && (uni.getStorageSync("token") != null)
		if (isLogin && is_has_token) {
			return true
		} else {
			if (is_toLogin) {
				this.navTo("pages/login/login",{},"reLaunch")
			}
			return false
		}
	},
	backAction() {
		uni.navigateBack()
	},
	/**
	 * 获取个人信息
	 * @param {Function}  resolve 回调
	 */
	async getMyInfoHttp(resolve) {
		const res = await http({
				url: "/api/users/userinfo",
				method: "get",
			},
			false
		);
		getApp().globalData.userData = res.data
		uni.setStorageSync('userInfo', res.data)
		return resolve && resolve(res.data)
	},
	/**
	 * 获取基础配置信息
	 * @param {Function}  resolve 回调
	 */
	async getConfigHttp(key, resolve) {
		const res = await http({
			url: "/site/data/config",
			method: "get",
			data: {
				key: key
			}
		})
		return resolve && resolve(res.data)
	},

	tologin() {
		uni.navigateTo({
			url: '/pages/login/login'
		})
	},
	/**
	 * 跳转到指定页面url
	 * 支持tabBar页面
	 * @param {string}  url   页面路径
	 * @param {object}  query 页面参数
	 * @param {string}  modo  跳转类型(默认navigateTo)
	 */
	navTo(url, query = {}, mode = 'navigateTo') {
		if (!url || url.length == 0) {
			return false
		}
		let arr = ["pages/index/index", "pages/addressBook/addressBook", "pages/news/news", "pages/my/my"]
		// tabBar页面, 使用switchTab
		if (this.inArray(url, arr)) {
			uni.switchTab({
				url: `/${url}`
			})
			return true
		}

		// 生成query参数
		const querySrc = !this.isEmpty(query) ? `?${this.urlEncode(query)}` : ''
		console.log(querySrc);
		// 普通页面跳转，使用navigateTo
		mode === 'navigateTo' && uni.navigateTo({
			url: `/${url}${querySrc}`
		})
		// 特殊指定，使用redirectTo
		mode === 'redirectTo' && uni.redirectTo({
			url: `/${url}${querySrc}`
		})
		mode === 'reLaunch' && uni.reLaunch({
			url: `/${url}${querySrc}`
		})
	},

	/**
	 * 倒计时方法，可用作手机验证码的倒计时
	 * @param {*} e 传this
	 * @param {Number} duration 倒计时的时长(秒数)
	 * @param {String} timeParam 需要倒计时的参数名字
	 * @param {Function} callBack 倒计时结束函数回调
	 */
	countDown(e, duration, timeParam, callBack) {
		if (!e.countDown_interval) {
			e[`${timeParam}`] = duration--
			e.countDown_interval = setInterval(() => {
				e[`${timeParam}`] = duration--
				if (duration == 0) {
					setTimeout(() => {
						clearInterval(e.countDown_interval)
						e.countDown_interval = null
						e[`${timeParam}`] = null
						callBack && callBack()
					}, 1000);
				}
			}, 1000)
		} else {
			return
		}
	},
	/**
	 * 倒计时方法，可用作手机验证码的倒计时
	 * @param {*} e 传this
	 * @param {Number} duration 倒计时的时长(秒数)
	 * @param {String} timeParam 需要倒计时的参数名字
	 * @param {Function} callBack 倒计时结束函数回调
	 */
	countDown1(e, duration, timeParam, callBack) {
		if (!e.countDown_interval1) {
			e[`${timeParam}`] = duration--
			e.countDown_interval1 = setInterval(() => {
				e[`${timeParam}`] = duration--
				if (duration == 0) {
					setTimeout(() => {
						clearInterval(e.countDown_interval1)
						e.countDown_interval1 = null
						e[`${timeParam}`] = null
						callBack && callBack()
					}, 1000);
				}
			}, 1000)
		} else {
			return
		}
	},
	/**
	 * 支付倒计时，可用作待支付订单剩余支付时间
	 * @param {*} e 传this
	 * @param {Number} duration 倒计时的时长(秒数)
	 * @param {String} timeParam 需要倒计时的参数名字
	 * @param {Function} callBack 倒计时结束函数回调
	 */
	countDownOrder(e, duration, timeParam, callBack) {
		function formattime(lefttime) {
			var leftd = Math.floor(lefttime / (60 * 60 * 24)), //计算天数
				lefth = Math.floor(lefttime / (60 * 60) % 24), //计算小时数
				leftm = Math.floor((lefttime % 3600) / 60), //计算分钟数
				lefts = Math.floor((lefttime % 3600) % 60); //计算秒数
			let arr = ''
			if (Number(leftd) > 0) {
				arr = leftd + "天"
			}
			if (Number(lefth) > 0) {
				arr = arr + lefth + ":"
			}
			if (Number(leftm) > 0) {
				arr = arr + leftm + ":"
			}
			return arr + lefts; //返回倒计时的字符串
		}
		if (!e.countDown_interval) {
			let str = duration--
			e[`${timeParam}`] = formattime(str)
			e.countDown_interval = setInterval(() => {
				let str = duration--
				e[`${timeParam}`] = formattime(str)
				if (duration == 0) {
					setTimeout(() => {
						clearInterval(e.countDown_interval)
						e.countDown_interval = null
						e[`${timeParam}`] = null
						callBack && callBack()
					}, 1000);
				}
			}, 1000)
		} else {
			return
		}
	},
	/**
	 * 处理富文本图片自适应屏幕宽度
	 * @param {String} html 富文本
	 */
	formatRichText(html) {
		if ((html || '') == '') {
			return ""
		};
		let newContent = html.replace(/<img[^>]*>/gi, function(match, capture) {
			match = match.replace(/style="[^"]+"/gi, '').replace(/style='[^']+'/gi, '');
			match = match.replace(/width="[^"]+"/gi, '').replace(/width='[^']+'/gi, '');
			match = match.replace(/height="[^"]+"/gi, '').replace(/height='[^']+'/gi, '');
			return match;
		});
		newContent = newContent.replace(/style="[^"]+"/gi, function(match, capture) {
			match = match.replace(/width:[^;]+;/gi, 'max-width:100%;').replace(/width:[^;]+;/gi,
				'max-width:100%;');
			return match;
		});
		newContent = newContent.replace(/<br[^>]*\/>/gi, '');
		newContent = newContent.replace(/\<img/gi,
			'<img style="max-width:100%;height:auto;display:block;margin-top:0;margin-bottom:0;"');
		return newContent;
	},
	/**
	 * 上传图片
	 * @param {String} file 图片路径
	 */
	uploadimage(file) {
		let images = ''
		let imginfos = []
		uni.showLoading({
			title: ""
		})
		const token = uni.getStorageSync('token') || ''
		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: base.baseUrl + '/api/login/upload',
				filePath: file, //要上传文件资源的路径
				name: 'file', //必须填file
				header: {
					'token': token
				},
				formData: {
					'success_action_status': '200'
				},
				success: function(res) {
					if (res.statusCode == 200) {
						let data = JSON.parse(res.data)
						let imagurl = data.data
						imginfos.push({
							'fileID': imagurl,
							'url': imagurl
						})
						var arr = []
						for (let s of imginfos) {
							arr.push(s.url)
						}
						images = arr.join(",")
						let dic = {
							'imginfos': imginfos,
							'images': images
						}
						resolve(dic)
					} else {
						reject(res.errMsg)
					}
				},
				fail: function(err) {
					reject(err)
				},
				complete() {
					uni.hideLoading()
				}
			})
		}).catch((error) => {
			console.error(error);
		})
	},
	//时间格式化处理
	dateFormat(time) {
		let date = new Date(time);
		let year = date.getFullYear();
		// 在日期格式中，月份是从0开始的，因此要加0，使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
		let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
		let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
		let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
		let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
		let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
		// 拼接
		// return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
		return year + "-" + month + "-" + day;
	},
	/**
	 * Toast
	 * @param { String } text 提示内容
	 * @example this.$config.showToast('13311112222');
	 */
	showToast(text) {
		uni.showToast({
			title: text,
			icon: "none"
		})
	},
	/**
	 * 从底部向上弹出操作菜单
	 * @param { String } title 标题
	 * @param { String } content 内容
	 * @param { Boolean } showCancel 是否显示取消
	 * @param { Function } success 回调选择按钮的索引
	 * @example this.$config.showModal(null,'', false,() => console.log(index));
	 */
	showModal(title = null, content = "", showCancel = true, success) {
		uni.showModal({
			showCancel: showCancel,
			title: title || '温馨提示',
			content: content,
			confirmText: "Yes",
			cancelText: "Cancel",
			success(res) {
				if (res.confirm) {
					success && success()
				}
			}
		})
	},
	/**
	 * 拨打电话
	 * @param { String } phoneNumber 目标号码
	 * @example this.$config.makePhone(13311112222);
	 */
	makePhone(phoneNumber) {
		uni.makePhoneCall({
			phoneNumber: phoneNumber
		});
	},
	/**
	 * 从底部向上弹出操作菜单
	 * @param { Array } itemList 按钮的文字数组
	 * @param { Function } callback 回调选择按钮的索引
	 * @param { String } textColor 按钮的文字颜色
	 * @example this.$config.showActionSheet(['A','B','C'],index => console.log(index));
	 */
	showActionSheet(itemList = [], textColor = "#4F4F4F", callback) {
		uni.showActionSheet({
			itemList: itemList,
			itemColor: textColor,
			success(res) {
				callback && callback(res.tapIndex);
			}
		})
	},

	/**
	 * 手机号加密
	 * @param {tel} tel 手机号
	 */
	geTel(tel) {
		if (!tel) {return}
		var reg = /^(\d{3})\d{4}(\d{4})$/;
		return tel.replace(reg, "$1****$2");
	},

	/**
	 * 判断是否为空对象
	 * @param {*} object 源对象
	 */
	isEmptyObject(object) {
		return Object.keys(object).length === 0
	},

	/**
	 * 判断是否为数组
	 *@param {*} array
	 */
	isArray(array) {
		return Object.prototype.toString.call(array) === '[object Array]'
	},

	/**
	 * 判断是否为对象
	 *@param {*} Obejct
	 */
	isObject(object) {
		return Object.prototype.toString.call(object) === '[object Obejct]'
	},

	/**
	 * 判断是否为空
	 * @param {*} object 源对象
	 */
	isEmpty(value) {
		if (this.isArray(value)) {
			return value.length === 0
		}
		if (this.isObject(value)) {
			return this.isEmptyObject(value)
		}
		return !value
	},
	/**
	 * 获取数组长度
	 * @param {*} object 源对象
	 */
	arrLength(value) {
		if (!this.isArray(value) || this.isEmpty(value)) {
			return 0
		} else {
			let arr = new Array(...value)
			return arr.length
		}
	},
	/**
	 * 是否在数组内
	 */
	inArray(search, array) {
		for (var i in array) {
			if (array[i] == search) return true
		}
		return false
	},
	/**
	 * 对象转URL参数格式
	 * {id:111,name:'xxx'} 转为 ?id=111&name=xxx
	 * @param {object} obj
	 */
	urlEncode(obj = {}) {
		const result = []
		for (var key in obj) {
			let item = obj[key]
			if (!item) {
				continue
			}
			if (this.isArray(item)) {
				item.forEach(i => {
					result.push(`${key}=${i}`)
				})
			} else {
				result.push(`${key}=${item}`)
			}
		}
		return result.join('&')
	},
	/**
	 * 设置剪切板内容
	 * @param {*} text 
	 */
	copy(text) {
		console.log(i18n);
		uni.setClipboardData({
			data: text,
			success: () => {
				uni.hideToast();
				this.showToast(i18n.t('fzcg'))
			},
			fail: () => {
				this.showToast(i18n.t('fzsb'))
			}
		});
	},
	/**
	 * 计算两个日期之差
	 * @param {string} startTime 开始时间 
	 * @param {string} endTime 结束时间 
	 * @param {string} diffType 得到的时间差类型
	 */
	getDateDiff(startTime, endTime, diffType) {
		//将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
		startTime = startTime.replace(/\-/g, "/");
		endTime = endTime.replace(/\-/g, "/");
		//将计算间隔类性字符转换为小写
		diffType = diffType.toLowerCase();
		var sTime = new Date(startTime); //开始时间
		var eTime = new Date(endTime); //结束时间

		if (sTime > eTime) {
			return "0";
		}
		//作为除数的数字
		var divNum = 1;
		switch (diffType) {
			case "second":
				divNum = 1000;
				break;
			case "minute":
				divNum = 1000 * 60;
				break;
			case "hour":
				divNum = 1000 * 3600;
				break;
			case "day":
				divNum = 1000 * 3600 * 24;
				break;
			default:
				break;
		}
		var ts = parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
		return ts
	},
	/**
	 * @param {String} str (y-m-d h:i:s) y:年 m:月 d:日 h:时 i:分 s:秒
	 */
	dateTimeStr(str) {
		if (!str || str == "") {
			return ""
		}
		var date = new Date(),
			year = date.getFullYear(), //年
			month = date.getMonth() + 1, //月
			day = date.getDate(), //日
			hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours(), //时
			minute = date.getMinutes() < 10 ? date.getMinutes() : date.getMinutes(), //分
			second = date.getSeconds() < 10 ? date.getSeconds() : date.getSeconds(); //秒
		month >= 1 && month <= 9 ? (month = "0" + month) : "";
		day >= 0 && day <= 9 ? (day = "0" + day) : "";
		hour >= 0 && hour <= 9 ? hour : "";
		minute >= 0 && minute <= 9 ? (minute = "0" + minute) : "";
		second >= 0 && second <= 9 ? (second = "0" + second) : "";
		if (str.indexOf('y') != -1) {
			str = str.replace('y', year)
		}
		if (str.indexOf('m') != -1) {
			str = str.replace('m', month)
		}
		if (str.indexOf('d') != -1) {
			str = str.replace('d', day)
		}
		if (str.indexOf('h') != -1) {
			str = str.replace('h', hour)
		}
		if (str.indexOf('i') != -1) {
			str = str.replace('i', minute)
		}
		if (str.indexOf('s') != -1) {
			str = str.replace('s', second)
		}
		return str;
	},
	/**
	 * 支付
	 * @param {string} url支付接口
	 * @param {string} order_no订单编号 
	 * @param {Number} payType支付方式 
	 * @param {Function} success成功回调
	 */
	async payHttp(url, order_no, payType, success) {
		const res = await http({
			url: url,
			data: {
				"order_no": order_no,
				"pay_type": payType
			}
		})
		let orderInfo = null
		if (payType === 1) {
			orderInfo = JSON.parse(res.data)
		}else{
			orderInfo = res.data
		}
		uni.requestPayment({
			provider: (payType === 1 ? "wxpay" : "alipay"),
			orderInfo: orderInfo,
			timeStamp: orderInfo.timestamp + '',
			nonceStr: orderInfo.noncestr,
			package: orderInfo.package,
			signType: "MD5",
			paySign: orderInfo.sign,
			success(res) {
				uni.showModal({
					showCancel: false,
					title: '支付成功',
					success() {
						success && success()
					}
				})
			},
			fail(err) {
				console.log(err)
				uni.showToast({
					icon: "none",
					title: '支付失败'
				})
			}
		});
	},
	/**
	 * 图片预览
	 * @param {Number} index 当前显示
	 * @param {Array} imgs 图片
	 */
	showPreviewImage(imgs, index = 0) {
		uni.previewImage({
			urls: imgs,
			current: index
		})
	},
	/**
	 * Google翻译
	 * @param {string} text 文本
	 * @param {string} targetLanguage 示例 zh-CN 目标语言
	 * @callback {} translatedText 目标文本
	 */
	translateText(text, targetLanguage, callback) {
		const apiKey = 'YOUR_GOOGLE_TRANSLATE_API_KEY';
		const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
		// const jsonString = JSON.stringify(jsonData);
		uni.request({
			url: apiUrl,
			method: 'POST',
			data: {
				q: text,
				target: targetLanguage,
				format: 'text' // 指定输入文本格式为普通文本
			},
			header: {
				'content-type': 'application/json'
			},
			success: res => {
				// 处理翻译结果
				const translatedText = res.data.data.translations[0].translatedText;
				// const translatedJson = JSON.parse(translatedText);
				// 将键名恢复为原始语言
				// const originalLanguageKeys = Object.keys(jsonData);
				// const translatedLanguageKeys = Object.keys(translatedJson);
				// originalLanguageKeys.forEach(key => {
				// 	(translatedLanguageKeys.includes(key)) {
				// 		translatedJson[key] = translatedJson[key];
				// 		delete translatedJson[key];
				// 	}
				// });
				// callBack && callBack(translatedJson)
				console.log('翻译结果：', translatedText);
				callBack && callBack(translatedText)
			},
			fail: err => {
				console.error('翻译出错：', err);
				this.showToast('翻译出错：' + err)
			}
		});
	},
	// 地址反编译
	getAddressByLatLng(lng, lat, callback) {
		const that = this
		let key = 'e8f322d96c11ffd655b7309777219c4a'; //高德地图key
		uni.request({
			// 高德
			url: 'https://restapi.amap.com/v3/geocode/regeo?output=json&location=' + lng + ',' +
				lat + '&key=' + key + '&radius=1000&extensions=all',
			data: {},
			header: {
				'Content-Type': 'application/json'
			},
			success: function(res) {
				let info = res.data.regeocode.addressComponent

				info.formatted_address = res.data.regeocode.formatted_address
				info.poi_name = res.data.regeocode.pois[0].address + res.data.regeocode.pois[0].name
				info.aois = res.data.regeocode.aois
				console.log('高德地图API接口返回信息', res)
				return callback && callback(info)
			}
		})

	},
	// 根据网络IP获取当前区域
	getipLocationHttp(callback) {
		uni.request({
			url: "https://restapi.amap.com/v3/ip?key=e8f322d96c11ffd655b7309777219c4a",
			success(res) {
				return callback && callback(res.data)
			}
		})
	},

	/**
	 * 时间格式化时间为：刚刚、多少分钟前、多少天前
	 * @param {string} stringTime stringTime 2020-09-10 20:20:20
	 */
	getDateBeforeNow(stringTime) {
		if (!stringTime){return ""};
		stringTime = new Date(stringTime.replace(/-/g, '/'))
		// 统一单位换算
		var minute = 1000 * 60;
		var hour = minute * 60;
		var day = hour * 24;
		var week = day * 7;
		var month = day * 30;
		var year = month * 12;
		var time1 = new Date().getTime(); //当前的时间戳
		// 对时间进行毫秒单位转换
		var time2 = new Date(stringTime).getTime(); //指定时间的时间戳
		var time = time1 - time2;
		var result = null;
		if (time < 0) {
			// alert("设置的时间不能早于当前时间！");
			result = "刚刚";
		} else if (time / year >= 1) {
			result = parseInt(time / year) + "年前";
		} else if (time / month >= 1) {
			result = parseInt(time / month) + "月前";
		} else if (time / week >= 1) {
			result = parseInt(time / week) + "周前";
		} else if (time / day >= 1) {
			result = parseInt(time / day) + "天前";
		} else if (time / hour >= 1) {
			result = parseInt(time / hour) + "小时前";
		} else if (time / minute >= 1) {
			result = parseInt(time / minute) + "分钟前";
		} else {
			result = "刚刚";
		}
		return result;
	},
	// 设置原生titleNView导航文字
	setTitleNViewBtns(index,text){
		let pages = getCurrentPages();
		let page = pages[pages.length - 1];
		// #ifdef APP-PLUS
		let currentWebview = page.$getAppWebview();
		let titleObj = currentWebview.getStyle().titleNView;
		if (!titleObj.buttons) {
			return;
		}
		titleObj.buttons[index].text = text;
		currentWebview.setStyle({
			titleNView: titleObj
		});
		// #endif
	},
}
export default configval;