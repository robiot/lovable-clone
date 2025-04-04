
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onAuthenticate: (id: string, token: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onAuthenticate }) => {
  const [id, setId] = useState('');
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!id.trim()) {
      setError('Sanity Project ID is required');
      return;
    }
    
    if (!token.trim()) {
      setError('Sanity API Token is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, token })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }
      
      await response.json();
      onAuthenticate(id, token);
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error instanceof Error ? error.message : 'Failed to authenticate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Authentication Required</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1.5">
            Please enter your Sanity Project ID and API Token to continue.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <div className="space-y-2">
            <Label htmlFor="id">Sanity Project ID</Label>
            <Input
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter your Sanity Project ID"
              className={cn(
                "transition-all duration-200",
                error && !id.trim() ? "border-destructive" : ""
              )}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="token">Sanity API Token</Label>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your Sanity API Token"
              className={cn(
                "transition-all duration-200",
                error && !token.trim() ? "border-destructive" : ""
              )}
            />
          </div>
          
          {error && (
            <p className="text-sm text-destructive animate-slide-up">{error}</p>
          )}
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full transition-all duration-200"
          >
            {isSubmitting ? "Setting up environment..." : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
