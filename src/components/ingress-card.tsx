'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Lock, Layers } from 'lucide-react';
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
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-primary border bg-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <CardTitle className="text-base leading-tight break-words hyphens-auto flex-1 min-w-0" style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>
                {ingress.name}
              </CardTitle>
              {ingress.tls && (
                <Lock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              )}
            </div>
            <CardDescription className="mt-1 text-xs leading-tight break-words flex items-center gap-1">
              <Layers className="h-3 w-3 flex-shrink-0" />
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
              <div className="text-xs font-medium">
                Hosts ({ingress.hosts.length})
              </div>
              <div className="space-y-1 mt-1"> {/* Added spacing and vertical layout */}
                {ingress.hosts.map((host, index) => {
                  // Create URLs from hosts (if not already present in urls)
                  const hostUrl = (ingress.urls && Array.isArray(ingress.urls) && ingress.urls.length > 0) 
                                 ? ingress.urls.find(url => url.includes(host)) 
                                 : null;
                                 
                  const finalUrl = hostUrl || (host.startsWith('http') ? host : `https://${host}`);

                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-between h-8 text-xs px-3 truncate group"
                      onClick={() => handleLinkClick(finalUrl)}
                      title={finalUrl}
                    >
                      <span className="truncate">{finalUrl}</span>
                      <ExternalLink className="h-3 w-3 ml-2 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Paths - updated to list format */}
          {ingress.paths.length > 0 && (() => {
            const uniquePaths = Array.from(new Set(ingress.paths));
            return (
              <div className="space-y-1">
                <div className="text-xs font-medium">Paths ({uniquePaths.length})</div>
                <div className="flex flex-col gap-1">
                  {/* List unique paths */}
                  {uniquePaths.map((path, index) => (
                    <div
                      key={index}
                      className="w-full justify-start h-8 text-xs px-3 truncate border border-input rounded-md bg-transparent flex items-center"
                    >
                      {path}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
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
