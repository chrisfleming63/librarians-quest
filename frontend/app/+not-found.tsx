import { Redirect } from "expo-router";

// Catch-all for any unmatched route — graceful redirect to the title screen.
export default function NotFound() {
  return <Redirect href="/" />;
}
