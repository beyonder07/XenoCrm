import LoadingSpinner from '@components/common/LoadingSpinner';

const OAuthCallback = () => (
  <div className="flex h-screen items-center justify-center">
    <LoadingSpinner size="lg" message="Signing you in..." />
  </div>
);

export default OAuthCallback; 