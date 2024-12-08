import { Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authState } from '@/store/atoms';
import { userBasicInfoState } from '@/store/atoms';
import PropTypes from 'prop-types';

export default function AdminRoute({ children }) {
  const userBasicInfo = useRecoilValue(userBasicInfoState);
  const auth = useRecoilValue(authState);
 
  if (!auth.isAuthenticated) {
    return <Navigate to="/signin" />;   
  }
 
  if (!userBasicInfo.isAdmin) {
   
    return <Navigate to="/dashboard" />;
  }

  return children;
} 

AdminRoute.propTypes = {
    children: PropTypes.node.isRequired,
};  
