// components/ApiConfigForm.tsx
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ApiConfigFormProps {
  apiKey: string;
  apiKeyId: string;
  setApiKey: (key: string) => void;
  setApiKeyId: (id: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const ApiConfigForm: React.FC<ApiConfigFormProps> = ({
  apiKey,
  apiKeyId,
  setApiKey,
  setApiKeyId,
  onSubmit,
}) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>API Configuration</CardTitle>
        <CardDescription>
          Please enter a Viam Organization API Key and API Key ID to get
          started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API Key"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKeyId">API Key ID</Label>
            <Input
              id="apiKeyId"
              type="password"
              value={apiKeyId}
              onChange={(e) => setApiKeyId(e.target.value)}
              placeholder="Enter your API Key ID"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Submit Config
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default ApiConfigForm;
