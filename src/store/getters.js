import state from './state'

export default {
    token: state => state.token,
    user_info: state => state.user_info,
    menu: state => state.menu
}
