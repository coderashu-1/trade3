import React from "react";
import { Route, Redirect } from "react-router-dom";

function ProtectedRoute({ component: Component, isAuthenticated, user, isAdminRoute = false, isLoading, ...rest }) {
  return (
    <Route
      {...rest}
      render={props => {
        // 1️⃣ Still loading auth/user
        if (isLoading) {
          return <div>Loading...</div>; // Show spinner or loading screen
        }

        // 2️⃣ Not authenticated
        if (!isAuthenticated) {
          return <Redirect to={{ pathname: "/welcome", state: { from: props.location } }} />;
        }

        // 3️⃣ Admin route protection
        if (isAdminRoute && !user?.isAdmin) {
          return <Redirect to={{ pathname: "/", state: { from: props.location } }} />;
        }

        // 4️⃣ All checks passed
        return <Component {...props} />;
      }}
    />
  );
}

export default ProtectedRoute;
