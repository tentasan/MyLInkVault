import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Copy, TestTube } from "lucide-react";
import { toast } from "sonner";

interface DemoCredentialsProps {
  onFillCredentials: (email: string, password: string) => void;
}

const DemoCredentials: React.FC<DemoCredentialsProps> = ({
  onFillCredentials,
}) => {
  const demoEmail = "test@example.com";
  const demoPassword = "testpass123";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleUseDemoCredentials = () => {
    onFillCredentials(demoEmail, demoPassword);
    toast.success("Demo credentials filled!");
  };

  return (
    <Card className="border-dashed border-2 border-brand-blue/30 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-brand-blue flex items-center gap-2">
          <TestTube className="h-4 w-4" />
          Demo Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-gray-600">
          Try MyLinkVault with pre-created demo credentials:
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Email:</span>
            <div className="flex items-center gap-1">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {demoEmail}
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(demoEmail, "Email")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Password:</span>
            <div className="flex items-center gap-1">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {demoPassword}
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(demoPassword, "Password")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
          onClick={handleUseDemoCredentials}
        >
          Use Demo Credentials
        </Button>
      </CardContent>
    </Card>
  );
};

export default DemoCredentials;
