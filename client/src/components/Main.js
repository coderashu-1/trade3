import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Login from "./Login";
import Splash from "./Splash";
import Register from "./Register";
import NotFound from "./NotFound";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./Home";
import Account from "./Account";
import Buy from "./Buy";
import AdminPanel from "./AdminPanel";
import AddMoney from "./AddMoney";

class Main extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    error: PropTypes.object,
  };

  render() {
    const { isAuthenticated, user, isLoading } = this.props.auth;

    return (
      <BrowserRouter>
        <Switch>
          <Route path="/welcome" component={Splash} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />

          <ProtectedRoute
            exact
            path="/"
            isAuthenticated={isAuthenticated}
            user={user}
            isLoading={isLoading}
            component={Home}
          />
          <ProtectedRoute
            path="/buy"
            isAuthenticated={isAuthenticated}
            user={user}
            isLoading={isLoading}
            component={Buy}
          />
          <ProtectedRoute
            path="/account"
            isAuthenticated={isAuthenticated}
            user={user}
            isLoading={isLoading}
            component={Account}
          />
          <ProtectedRoute
            path="/addmoney"
            isAuthenticated={isAuthenticated}
            user={user}
            isLoading={isLoading}
            component={AddMoney}
          />
          <ProtectedRoute
            path="/admin"
            isAuthenticated={isAuthenticated}
            user={user}
            isAdminRoute={true} // Require admin
            isLoading={isLoading}
            component={AdminPanel}
          />

          <Route path="*" component={NotFound} />
        </Switch>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  error: state.error,
});

export default connect(mapStateToProps)(Main);
