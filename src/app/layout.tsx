import "./globals.css";
import "./student.css";
import "./grade-path.css";
import "./learning-dashboard.css";
import "./friendly-ui.css";
import "./path-rewards.css";
import "./polish.css";
export const metadata = {
  title: "Math Atlas — Find your path in math",
  description:
    "Free lessons, branching learning paths, and original SAT math practice.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
