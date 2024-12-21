import WIPBanner from './WIPBanner';

const Layout = ({ children }) => {
  return (
    <>
      <WIPBanner />
      {children}
    </>
  );
};

export default Layout; 