import { atom } from 'recoil'

const initialAuthState = {
    isAuthenticated:false,
    userId: null,
    token: null,
    username: null
}
const initialUserState = {
    user: null
}

export const authState = atom({
    key: 'authState',
    default: initialAuthState
})
export const userState = atom({
    key: 'userState',
    default: initialUserState
})
