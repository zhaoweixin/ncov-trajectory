import Vue from "vue";
import Vuex from "vuex";
import mutation from "./mutation";
import action from "./action";
import getter from "./getter";
import states from './state';

Vue.use(Vuex);

const store = new Vuex.Store({
    // 定义状态
    state: states,
    mutations: mutation,
    actions: action,
    getters: getter
  });

export default store;