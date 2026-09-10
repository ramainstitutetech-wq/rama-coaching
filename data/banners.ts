import type { Banner } from "./types";

export const banners: Banner[] = [
  {
    id: "b-01",
    heading: "Build Your Career in Computers",
    description: "Join Rama Coaching Center for industry-ready courses in ADCA, Tally, Digital Marketing and more.",
    buttonText: "Explore Courses",
    buttonLink: "/courses",
    active: true,
    accent: "#b91c1c",
  },
  {
    id: "b-02",
    heading: "Admissions Open for 2026 Batch",
    description: "Limited seats available. Enroll now and get free study material and lab access.",
    buttonText: "Apply Now",
    buttonLink: "/contact",
    active: true,
    accent: "#1F3354",
  },
  {
    id: "b-03",
    heading: "Verify Your Certificate Online",
    description: "Employers can instantly verify any certificate issued by Rama Coaching Center.",
    buttonText: "Verify Now",
    buttonLink: "/verification",
    active: false,
    accent: "#0f766e",
  },
];
