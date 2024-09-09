
import SampleReports from "views/SampleReports/SampleReportsTables";
import Register from "views/examples/Register.js";
import Login from "views/examples/Login.js";
import Tables from "views/examples/Tables.js";
import Prompt from "views/examples/PromptPlayground";
import ReportAnalyzer from "views/UploadComponents/UploadReports";
import UploadComponent from "views/UploadComponents/UploadReports";

var routes = [
  {
    path: "/report-analyzer",
    name: "Analyze Report",
    icon: "ni ni-cloud-upload-96 text-info",
    component: <UploadComponent />,
    layout: "/admin",
  }, ,
  {
    path: "/sample-reports",
    name: "Sample Reports",
    icon: "ni ni-tv-2 text-primary",
    component: <SampleReports />,
    layout: "/admin",
  },
  {
    path: "/history",
    name: "History",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Tables />,
    layout: "/admin",
  },
  {
    path: "/prompt",
    name: "Prompt",
    icon: "ni ni-collection text-purple",
    component: <Prompt />,
    layout: "/admin",
  },
  {
    path: "/report-analyzer",
    // name: "Report Analyzer",
    // icon: "ni ni-collection text-purple",
    component: <ReportAnalyzer />,
    layout: "/admin",
  },
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: <Login />,
    layout: "/auth",
  },
  {
    path: "/register",
    name: "Register",
    icon: "ni ni-circle-08 text-pink",
    component: <Register />,
    layout: "/auth",
  },
];
export default routes;
