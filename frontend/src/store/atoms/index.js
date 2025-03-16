import { atom } from 'recoil'

// Auth-related state
export const authState = atom({
    key: 'authState',
    default: {
        isAuthenticated: false,
        token: null,
        userId: null,
        username: null
    }
})

// Basic user info (frequently used data)
export const userBasicInfoState = atom({
    key: 'userBasicInfoState',
    default: {
        firstname: null,
        lastname: null,
        username: null,
        profileImage: null,
        isAdmin: false,
        isOnline: false
    }
})

export const onlineUsersState = atom({
    key: 'onlineUsersState',
    default: new Set()
  });


// Theme
export const themeState = atom({
    key: 'themeState',
    default: 'light'
})

// Socket state
export const socketState = atom({
    key: 'socketState',
    default: null
})

// Notification state
export const notificationState = atom({
    key: 'notificationState',
    default: {
        unreadCount: 0,
        notifications: []
    }
})

