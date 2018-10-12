export default {
    token:(state, data) => {
      state.token = data
    },
    user_info:(state, data) => {
        state.user_info = data
    },
    logout:(state, data) => {
        state.auth_info.sessionid = ''
    },
    menu:(state, data) => {
        state.menu = data
    },
}
