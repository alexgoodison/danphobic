import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CloudProviderCardProps {
  name: string;
  description: string;
  logo: string;
  onConnect: () => void;
}

export function CloudProviderCard({
  name,
  description,
  logo,
  onConnect,
}: CloudProviderCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12">
            <Image src={logo} alt={`${name} logo`} fill className="object-contain" />
          </div>
          <CardTitle>{name}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Connect your {name} account to automatically send Nginx log files for analysis.
          </p>

          <Button variant="outline" className="mt-4 w-full">
            Connect {name}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
