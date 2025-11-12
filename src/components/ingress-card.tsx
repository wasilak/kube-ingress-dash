'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Globe, Lock, Server } from 'lucide-react';
import { IngressData } from '@/types/ingress';

interface IngressCardProps {
  ingress: IngressData;
  onClick?: () => void;
}

const IngressCard: React.FC<IngressCardProps> = ({ ingress, onClick }) => {
  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-shadow hover:shadow-md border bg-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg truncate">
                {ingress.name}
              </CardTitle>
              {ingress.tls && (
                <Lock className="h-4 w-4 text-primary" />
              )}
            </div>
            <CardDescription className="mt-1 text-sm truncate">
              {ingress.namespace}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <div className="space-y-3">
          {/* Hosts - now as clickable buttons */}
          {ingress.hosts.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs font-medium">
                <Globe className="h-3 w-3" />
                <span>Hosts</span>
              </div>
              <div className="space-y-1 mt-1"> {/* Added spacing and vertical layout */}
                {ingress.hosts.map((host, index) => {
                  // Create URLs from hosts (if not already present in urls)
                  const hostUrl = ingress.urls.find(url => url.includes(host)) || 
                                 (host.startsWith('http') ? host : `https://${host}`);
                  
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start h-8 text-xs px-3"
                      onClick={() => handleLinkClick(hostUrl)}
                    >
                      {hostUrl}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Paths - deduplicated */}
          {ingress.paths.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium">Paths</div>
              <div className="flex flex-wrap gap-1">
                {/* Deduplicate paths by filtering unique values */}
                {Array.from(new Set(ingress.paths)).slice(0, 5).map((path, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs px-2 py-1"
                  >
                    {path}
                  </Badge>
                ))}
                {ingress.paths.length > 5 && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    +{ingress.paths.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex flex-wrap gap-2 w-full">
          {ingress.annotations['kubernetes.io/ingress.class'] && (
            <Badge variant="secondary" className="text-xs">
              {ingress.annotations['kubernetes.io/ingress.class']}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default IngressCard;