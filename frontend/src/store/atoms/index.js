import { atom } from 'recoil'

// Auth-related state
export const authState = atom({
    key: 'authState',
    default: {
        isAuthenticated: false,
        userId: null,
        token: null,
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
        profileImageUrl: null,
        isVerified: false,
        isAdmin: false,
        isOAuthUser: false
    }
})

// Profile-specific data
export const userProfileState = atom({
    key: 'userProfileState',
    default: {
        bio: '',
        location: '',
        websiteUrl: '',
        bannerImageUrl: '',
        dateJoined: null
    }
})

// Social connections
export const userSocialState = atom({
    key: 'userSocialState',
    default: {
        followers: [],
        following: [],
        isOnline: false
    }
})

// Content-related data
export const userContentState = atom({
    key: 'userContentState',
    default: {
        posts: [],
        recentActivity: []
    }
})

// Notifications
export const userNotificationsState = atom({
    key: 'userNotificationsState',
    default: {
        notifications: []
    }
})

// Theme
export const themeState = atom({
    key: 'themeState',
    default: 'light'
})





