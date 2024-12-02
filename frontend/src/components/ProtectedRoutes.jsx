import { useRecoilValue } from 'recoil';
import { authState } from '../store/atoms/index'; 
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function ProtectedRoutes({ children }) {
    const auth = useRecoilValue(authState);

    if (!auth.isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }
    return children;
}


ProtectedRoutes.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoutes;