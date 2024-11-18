import { selector } from 'recoil';
import { userState } from './atoms';

export const followersCountState = selector({
  key: 'followersCountState',
  get: ({ get }) => {
    const userData = get(userState).user;
    return userData ? userData.followers.length : 0;
  },
});

export const followingsCountState = selector({
  key: 'followingsCountState',
  get: ({ get }) => {
    const userData = get(userState).user;
    return userData ? userData.following.length : 0;
  },
});