
import { useRecoilValue } from 'recoil';
import { authState } from '../store/atoms'; 
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function PublicRoute({ children }) {
    const auth = useRecoilValue(authState);

    if (auth.isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}




PublicRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PublicRoute;