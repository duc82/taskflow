import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { DashboardContent } from "src/layouts/dashboard";
import { _posts, _tasks, _traffic, _timeline } from "src/_mock";

import { AnalyticsNews } from "../analytics-news";
import { AnalyticsTasks } from "../analytics-tasks";
import { AnalyticsCurrentVisits } from "../analytics-current-visits";
import { AnalyticsOrderTimeline } from "../analytics-order-timeline";
import { AnalyticsWebsiteVisits } from "../analytics-website-visits";
import { AnalyticsWidgetSummary } from "../analytics-widget-summary";
import { AnalyticsTrafficBySite } from "../analytics-traffic-by-site";
import { AnalyticsCurrentSubject } from "../analytics-current-subject";
import { AnalyticsConversionRates } from "../analytics-conversion-rates";
import { useEffect, useState } from "react";
import axiosInstance from "src/services/axios";

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const [analytics, setAnalytics] = useState({
    boards: 0,
    users: 0,
    columns: 0,
    tasks: 0,
  });

  useEffect(() => {
    axiosInstance
      .get("/analysis")
      .then((response) => {
        setAnalytics(response.data);
      })
      .catch((error) => {
        console.error("Error fetching analytics data:", error);
      });
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Chào mừng quay trở lại 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Số lượng bảng"
            total={analytics.boards}
            icon={
              <img
                alt="Weekly sales"
                src="/assets/icons/glass/ic-glass-bag.svg"
              />
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Số lượng người dùng"
            total={analytics.users}
            color="secondary"
            icon={
              <img
                alt="New users"
                src="/assets/icons/glass/ic-glass-users.svg"
              />
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Số lượng danh sách"
            total={analytics.columns}
            color="warning"
            icon={
              <img
                alt="Purchase orders"
                src="/assets/icons/glass/ic-glass-buy.svg"
              />
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Số lượng công việc"
            total={analytics.tasks}
            color="error"
            icon={
              <img
                alt="Messages"
                src="/assets/icons/glass/ic-glass-message.svg"
              />
            }
          />
        </Grid>

        {/* <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Current visits"
            chart={{
              series: [
                { label: "America", value: 3500 },
                { label: "Asia", value: 2500 },
                { label: "Europe", value: 1500 },
                { label: "Africa", value: 500 },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="Website visits"
            subheader="(+43%) than last year"
            chart={{
              categories: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
              ],
              series: [
                { name: "Team A", data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: "Team B", data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsConversionRates
            title="Conversion rates"
            subheader="(+43%) than last year"
            chart={{
              categories: ["Italy", "Japan", "China", "Canada", "France"],
              series: [
                { name: "2022", data: [44, 55, 41, 64, 22] },
                { name: "2023", data: [53, 32, 33, 52, 13] },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentSubject
            title="Current subject"
            chart={{
              categories: [
                "English",
                "History",
                "Physics",
                "Geography",
                "Chinese",
                "Math",
              ],
              series: [
                { name: "Series 1", data: [80, 50, 30, 40, 100, 20] },
                { name: "Series 2", data: [20, 30, 40, 80, 20, 80] },
                { name: "Series 3", data: [44, 76, 78, 13, 43, 10] },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsNews title="News" list={_posts.slice(0, 5)} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsOrderTimeline title="Order timeline" list={_timeline} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsTrafficBySite title="Traffic by site" list={_traffic} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsTasks title="Tasks" list={_tasks} />
        </Grid> */}
      </Grid>
    </DashboardContent>
  );
}
