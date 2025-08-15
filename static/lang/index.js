import Vue from 'vue'
// 引入 多语言包
import VueI18n from 'vue-i18n'
import zh from './zh'
import en from './en'


Vue.use(VueI18n)

// 创建实例
const i18n = new VueI18n({
    locale: "en",
	// locale: uni.getStorageSync('lang') ? uni.getStorageSync('lang') : "zh",
    messages: {
        zh, en
    }
});

export default i18n;
