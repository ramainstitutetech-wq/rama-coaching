import type { Achievement } from "./types";

export const achievements: Achievement[] = [
  { id: "a-01", value: "500+", label: "Students Trained", description: "Happy learners who completed our courses", icon: "Users", status: "active" },
  { id: "a-02", value: "20+", label: "Courses Offered", description: "From foundation to advanced specializations", icon: "BookOpen", status: "active" },
  { id: "a-03", value: "95%", label: "Success Rate", description: "Students placed or certified successfully", icon: "Trophy", status: "active" },
  { id: "a-04", value: "15+", label: "Expert Faculty", description: "Experienced trainers across domains", icon: "GraduationCap", status: "active" },
  { id: "a-05", value: "10+", label: "Years of Trust", description: "Serving the community since 2015", icon: "CalendarCheck", status: "inactive" },
  { id: "a-06", value: "8", label: "Partner Centers", description: "Franchise and partner locations", icon: "Building2", status: "active" },
];
