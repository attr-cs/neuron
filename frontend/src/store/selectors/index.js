import { selector } from 'recoil';
import { userSocialState, userContentState, userBasicInfoState, userNotificationsState } from '../atoms';

export const followersCountState = selector({
  key: 'followersCountState',
  get: ({ get }) => {
    const socialData = get(userSocialState);
    return socialData.followers.length;
  }
});

export const followingsCountState = selector({
  key: 'followingsCountState',
  get: ({ get }) => {
    const socialData = get(userSocialState);
    return socialData.following.length;
  }
});

export const userFullNameState = selector({
  key: 'userFullNameState',
  get: ({ get }) => {
    const basicInfo = get(userBasicInfoState);
    return `${basicInfo.firstname || ''} ${basicInfo.lastname || ''}`.trim();
  }
});

export const postsCountState = selector({
  key: 'postsCountState',
  get: ({ get }) => {
    const contentData = get(userContentState);
    return contentData.posts.length;
  }
});

export const unreadNotificationsState = selector({
  key: 'unreadNotificationsState',
  get: ({ get }) => {
    const notifications = get(userNotificationsState).notifications;
    return notifications.filter(n => !n.read).length;
  }
});