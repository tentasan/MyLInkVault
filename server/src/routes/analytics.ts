import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { analytics } from "../db/schema.js";
import { eq, and, desc, sql, gte, lt } from "drizzle-orm";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Get analytics overview
router.get("/overview", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { timeRange = "7d" } = req.query;

    const now = new Date();
    const startDate = new Date(now);
    switch (timeRange) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const [totalViewsResult] = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(analytics)
      .where(
        and(
          eq(analytics.user_id, req.user!.id),
          eq(analytics.event_type, "profile_view"),
          gte(analytics.created_at, startDate)
        )
      );

    const [uniqueVisitorsResult] = await db
      .select({ count: sql<number>`count(distinct visitor_ip)`.as("count") })
      .from(analytics)
      .where(
        and(
          eq(analytics.user_id, req.user!.id),
          eq(analytics.event_type, "profile_view"),
          gte(analytics.created_at, startDate)
        )
      );

    const [totalClicksResult] = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(analytics)
      .where(
        and(
          eq(analytics.user_id, req.user!.id),
          eq(analytics.event_type, "platform_click"),
          gte(analytics.created_at, startDate)
        )
      );

    const totalViews = totalViewsResult?.count || 0;
    const totalClicks = totalClicksResult?.count || 0;
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    // Previous time range
    const prevStartDate = new Date(startDate);
    const diff = now.getTime() - startDate.getTime();
    prevStartDate.setTime(startDate.getTime() - diff);

    const [prevViewsResult] = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(analytics)
      .where(
        and(
          eq(analytics.user_id, req.user!.id),
          eq(analytics.event_type, "profile_view"),
          gte(analytics.created_at, prevStartDate),
          lt(analytics.created_at, startDate)
        )
      );

    const [prevVisitorsResult] = await db
      .select({ count: sql<number>`count(distinct visitor_ip)`.as("count") })
      .from(analytics)
      .where(
        and(
          eq(analytics.user_id, req.user!.id),
          eq(analytics.event_type, "profile_view"),
          gte(analytics.created_at, prevStartDate),
          lt(analytics.created_at, startDate)
        )
      );

    const [prevClicksResult] = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(analytics)
      .where(
        and(
          eq(analytics.user_id, req.user!.id),
          eq(analytics.event_type, "platform_click"),
          gte(analytics.created_at, prevStartDate),
          lt(analytics.created_at, startDate)
        )
      );

    const prevViews = prevViewsResult?.count || 0;
    const prevVisitors = prevVisitorsResult?.count || 0;
    const prevClicks = prevClicksResult?.count || 0;
    const prevCtr = prevViews > 0 ? (prevClicks / prevViews) * 100 : 0;

    // Trend comparisons
    const viewsChange = prevViews > 0 ? ((totalViews - prevViews) / prevViews) * 100 : 100;
    const visitorsChange =
      prevVisitors > 0
        ? ((uniqueVisitorsResult.count - prevVisitors) / prevVisitors) * 100
        : 100;
    const ctrChange = prevCtr > 0 ? ((ctr - prevCtr) / prevCtr) * 100 : 100;

    // ✅ Final response
    res.json({
      overview: {
        totalViews,
        uniqueVisitors: uniqueVisitorsResult.count,
        totalClicks,
        clickThroughRate: parseFloat(ctr.toFixed(2)),
        avgSessionDuration: "2m 34s", // Optional static
      },
      trends: {
        viewsChange: parseFloat(viewsChange.toFixed(1)),
        visitorsChange: parseFloat(visitorsChange.toFixed(1)),
        ctrChange: parseFloat(ctrChange.toFixed(1)),
        durationChange: 12.8, // Optional static
      },
    });
  } catch (error) {
    console.error("Get analytics overview error:", error);
    res.status(500).json({ error: "Failed to get analytics overview" });
  }
});

export default router;
