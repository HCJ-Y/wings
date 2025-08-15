import base from "./baseUrl.js";
import i18n from "../lang/index.js";
import md5 from 'js-md5';

const http = (options,isShowLoading=true) => {
	return new Promise((resolve, reject) => {//异步封装接口，使用Promise处理异步请求
		if (isShowLoading) {
			uni.showLoading({
				// title: i18n.t('loading')
			})
		}
		const token = uni.getStorageSync('token') || ''
		const header = {
			'Authorization': 'Bearer ' + token,
			'Accept':"application/form-data"
		}
		
		function randomString(len) {　　
		    len = len || 32;　　
		    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/ 　　
		    var maxPos = $chars.length;　　
		    var pwd = '';　　
		    for (var i = 0; i < len; i++) {　　　　 pwd += $chars.charAt(Math.floor(Math.random() * maxPos));　　 }　　
		    return pwd;
		}
		
		function encryptParameter(obj) {
		    // 1.定义秘钥A和秘钥B
		    var keyA = 'sign_start_key=mXx4bAZ2zrLHMh7RgeP6CU5NZMXAoqzv&';
		    var keyB = 'sign_end_key=mjnmdimd2hJk6TOl0oMM6F5SHi1fsbdK';
		    // 2.获取当前时间戳（10位）
		    // 2.1 把获取的时间戳转换为参数放入obj()
			let date = new Date()
			let timestamp = date / 1000;
		    obj.timestamp = timestamp
		    // 2.2 获取随机字符串
		    var nonce = randomString(10);
		    // 2.3 把随机字符串放入obj
		    obj.nonce = nonce;
		    // 3.定义参数字符串变量
		    var parameter = '';
		    // 4.定义数组
		    var arr = [];
		    // 5.定义索引
		    var num = 0;
		    // 6.循环传入的对象obj，拿到key放入arr
		    for (var i in obj) {
		        arr[num] = i;
		        num++;
		    }
		    // 7.对arr按照字符编码的顺序进行排序
		    var sortArr = arr.sort();
		    // 8.循环排序后的数组，依次拿出key和value并拼接字符串中间用&分隔
		    for (var i in sortArr) {
		        // sortObj[sortArr[i]] = obj[sortArr[i]];
		        parameter += sortArr[i] + '=' + obj[sortArr[i]] + '&'
		    }
		    // 9.拼接需要加密的参数字符串
		    var stringA = keyA + parameter + keyB;
		    //console.log(stringA)
		    // 10.对参数字符串进行md5加密
		    // console.log(this)
		    // console.log(this._that)
		    var sign = md5(stringA).toUpperCase();
		    // console.log(stringA)
		    // 11.把加密字符串  时间戳 随机字符串 放入数组encryptResult
			obj.sign = sign
			obj.timestamp = timestamp
			obj.nonce = nonce
		    // 12.return encryptResult
		    return obj;
		};
		
		uni.request({
            method: options.method ?? "POST",
            url: base.baseUrl + options.url,
            // data: encryptParameter(options.data || {}),
            data: options.data || {},
            header: header,
            success(res) {
                uni.hideLoading();
                if (res.data.code == 1000) {
                    resolve(res.data); //成功,将数据返回
                } else if (res.data.errcode == 1004 || res.data.code == 1004) {
                    getApp().globalData.isLogin = false;
                    getApp().globalData.token = "";
                    getApp().globalData.userData = {};
                    uni.setStorageSync("token", "");
                    uni.setStorageSync("isLogin", false);
                    uni.reLaunch({
                        url: "/pages/login/login",
                    });
                    return;
                } else if (res.data.code == 1005 || res.data.code == 1003) {
                    getApp().globalData.isLogin = false;
                    getApp().globalData.token = "";
                    getApp().globalData.userData = {};
                    uni.setStorageSync("token", "");
                    uni.setStorageSync("isLogin", false);
					uni.reLaunch({
					    url: "/pages/login/login",
					});
                    return;
                } else if (res.data.code == 500) {
					uni.showToast({
					    icon: "none",
					    title: (res.data.errmsg || res.data.message),
					});
                    resolve(res.data); //成功,将数据返回
                } else {
                    uni.showToast({
                        icon: "none",
                        title: res.data.message,
                    });
                }
            },
            fail(err) {
                uni.hideLoading();
                reject(err.data);
            },
            complete() {
                uni.stopPullDownRefresh();
            },
        });
	}).catch((error) => {
		console.error(error);
	})
}
export default http
