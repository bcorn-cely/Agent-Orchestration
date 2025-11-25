import { withWorkflow } from 'workflow/next';

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

const workflowConfig = {

}

export default withWorkflow(nextConfig, workflowConfig);
