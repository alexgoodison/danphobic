import { SiteHeader } from "@/components/site-header";
import { CloudProviderCard } from "@/components/cloud-provider-card";

const cloudProviders = [
  {
    name: "AWS",
    description: "Amazon Web Services - The world's most comprehensive cloud platform",
    logo: "/logos/aws.svg",
  },
  {
    name: "Google Cloud",
    description: "Google Cloud Platform - Enterprise-ready cloud services",
    logo: "/logos/gcp.svg",
  },
  {
    name: "Azure",
    description: "Microsoft Azure - Cloud computing platform and services",
    logo: "/logos/azure.svg",
  },
  {
    name: "DigitalOcean",
    description: "DigitalOcean - Cloud infrastructure for developers",
    logo: "https://cdn.worldvectorlogo.com/logos/digitalocean-icon-1.svg",
  },
];

export default function PipelinePage() {
  const handleConnect = (provider: string) => {
    // TODO: Implement cloud provider connection logic
    console.log(`Connecting to ${provider}...`);
  };

  return (
    <div>
      <SiteHeader title="Pipeline" />
      <div className="@container/main flex flex-1 flex-col gap-6 py-8 px-6">
        <div className="grid grid-cols-1 gap-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
          {cloudProviders.map((provider) => (
            <CloudProviderCard
              key={provider.name}
              name={provider.name}
              description={provider.description}
              logo={provider.logo}
              onConnect={() => handleConnect(provider.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
