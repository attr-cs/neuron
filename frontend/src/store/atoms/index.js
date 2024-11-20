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

export const themeState = atom({
    key: 'themeState',
    default: 'light',
})

// import { atom } from 'recoil';


// export const authState = atom({
//   key: 'authState',
//   default: {
//     isAuthenticated: false,
//     userId: null,
//     token: null,
//     username: null
//   }
// });


// export const profileState = atom({
//   key: 'profileState',
//   default: {
//     profileImageUrl: '',
//     bio: '',
//     location: '',
//     websiteUrl: '',
//     bannerImageUrl: '',
//     dateJoined: null
//   }
// });


// export const personalInfoState = atom({
//   key: 'personalInfoState',
//   default: {
//     firstname: '',
//     lastname: '',
//     email: ''
//   }
// });


// export const followersState = atom({
//   key: 'followersState',
//   default: []
// });

// export const followingsState = atom({
//   key: 'followingsState',
//   default: []
// });


// export const blockedUsersState = atom({
//   key: 'blockedUsersState',
//   default: []
// });


// export const isAdminState = atom({
//   key: 'isAdminState',
//   default: false
// });


// export const themeState = atom({
//   key: 'themeState',
//   default: 'light'
// });


// export const isOnlineState = atom({
//   key: 'isOnlineState',
//   default: false
// });
