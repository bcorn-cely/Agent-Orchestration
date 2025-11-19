import { withWorkflow } from 'workflow/next';

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/coupa',
        permanent: true,
      },
    ]
  },
}

const workflowConfig = {

}

export default withWorkflow(nextConfig, workflowConfig);
