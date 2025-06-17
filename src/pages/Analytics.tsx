import React, { useEffect, useState } from "react";
import { analyticsAPI } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Overview {
  totalViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  clickThroughRate: number;
  avgSessionDuration: string;
}

interface Trends {
  viewsChange: number;
  visitorsChange: number;
  ctrChange: number;
  durationChange: number;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [trends, setTrends] = useState<Trends | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsAPI.getOverview();
        setOverview(data.overview);
        setTrends(data.trends);
      } catch (error) {
        console.error("Failed to fetch analytics overview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-brand text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard">
            <Button variant="outline" className="text-white border-green hover:bg-yellow/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">Analytics Overview</h1>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="bg-white/10 backdrop-blur-md border border-white/10"
                >
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))
            : overview && (
                <>
                  <Card className="bg-white/10 backdrop-blur-md border border-white/10">
                    <CardContent className="p-6">
                      <p className="text-white/70 mb-1">Total Views</p>
                      <p className="text-2xl font-semibold">{overview.totalViews}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-md border border-white/10">
                    <CardContent className="p-6">
                      <p className="text-white/70 mb-1">Unique Visitors</p>
                      <p className="text-2xl font-semibold">{overview.uniqueVisitors}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-md border border-white/10">
                    <CardContent className="p-6">
                      <p className="text-white/70 mb-1">Total Clicks</p>
                      <p className="text-2xl font-semibold">{overview.totalClicks}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-md border border-white/10">
                    <CardContent className="p-6">
                      <p className="text-white/70 mb-1">Click Through Rate</p>
                      <p className="text-2xl font-semibold">
                        {overview.clickThroughRate}%
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
        </div>

        {/* Trend Cards */}
        <h2 className="text-2xl font-semibold mb-4">Trends</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="bg-white/10 backdrop-blur-md border border-white/10"
                >
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))
            : trends && (
                <>
                  <Card className="bg-white/10 backdrop-blur-md border border-white/10">
                    <CardContent className="p-6">
                      <p className="text-white/70 mb-1">Views Change</p>
                      <p className="text-2xl font-semibold">{trends.viewsChange}%</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-md border border-white/10">
                    <CardContent className="p-6">
                      <p className="text-white/70 mb-1">Visitors Change</p>
                      <p className="text-2xl font-semibold">{trends.visitorsChange}%</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-md border border-white/10">
                    <CardContent className="p-6">
                      <p className="text-white/70 mb-1">CTR Change</p>
                      <p className="text-2xl font-semibold">{trends.ctrChange}%</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-md border border-white/10">
                    <CardContent className="p-6">
                      <p className="text-white/70 mb-1">Session Duration Change</p>
                      <p className="text-2xl font-semibold">{trends.durationChange}%</p>
                    </CardContent>
                  </Card>
                </>
              )}
        </div>
      </div>
    </div>
  );
}
