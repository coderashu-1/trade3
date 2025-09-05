import React, { Component } from "react";
import logo from "../assets/wsb_logo.png";
import splashImage from "../assets/splash-image.png";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { login } from "../actions/authActions";
import { clearErrors } from "../actions/errorActions";
import {
  Button,
  Nav,
  Row,
  Col,
  Navbar,
  Image,
  Modal
} from "react-bootstrap";
import { Redirect, Link } from "react-router-dom";

class Splash extends Component {
  state = {
    name: "",
    email: "",
    password: "",
    msg: null,
    alertOpen: false,
    showPolicy: true,       // 👈 default: show modal
    policyAccepted: false   // 👈 track acceptance
  };

  static propTypes = {
    isAuthenticated: PropTypes.bool,
    error: PropTypes.object.isRequired,
    login: PropTypes.func.isRequired,
    clearErrors: PropTypes.func.isRequired
  };

  componentDidMount() {
    // 👇 If already accepted once, don’t show again
    const accepted = localStorage.getItem("policyAccepted");
    if (accepted === "true") {
      this.setState({ showPolicy: false, policyAccepted: true });
    }
  }

  handleAcceptPolicy = () => {
    this.setState({ showPolicy: false, policyAccepted: true });
    localStorage.setItem("policyAccepted", "true");
  };

  componentDidUpdate(prevProps) {
    const { error } = this.props;
    if (error !== prevProps.error) {
      if (error.id === "LOGIN_FAIL") {
        this.setState({ msg: error.msg.msg });
      } else {
        this.setState({ msg: null });
      }
    }
  }

  handleAlert = () => {
    alert(this.state.msg);
    this.props.clearErrors();
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    if (this.props.isAuthenticated === true) {
      return <Redirect push to="/" />;
    }

    return (
      <div style={{ width: "100%", overflowX: "hidden" }}>
        {/* Privacy Policy Modal */}
        <Modal
          show={this.state.showPolicy}
          backdrop="static"
          keyboard={false}
          centered
        >
          <Modal.Header>
            <Modal.Title>Privacy Policy & Terms</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Welcome to <strong>TradeGo.Live</strong>. By using our platform,
              you agree to our Privacy Policy and Terms of Service. 
            </p>
            <p>
                Please trade responsibly. This is a high-risk platform. Your data is protected and will not be shared with third parties without consent.
             </p>
            <p style={{ fontSize: "0.85rem", color: "gray" }}>
              Click "Accept" to continue.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={this.handleAcceptPolicy}>
              Accept
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Show splash content only if accepted */}
        {this.state.policyAccepted && (
          <>
            <Row className="spacer-row" />

            <Row
              className="justify-content-center align-items-center"
              style={{ margin: 0 }}
            >
              <Col xs={12} md={6} className="mb-4 mb-md-0">
                <div
                  className="splash-form-left-div"
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  <Row className="justify-content-center">
                    <Image
                      src={logo}
                      alt="TradeGo logo"
                      className="paper-shadow-class splashImageFace"
                      style={{ maxWidth: "120px", height: "auto" }}
                      fluid
                    />
                  </Row>

                  <Row className="mt-3 justify-content-center">
                    <h1 style={{ fontSize: "2rem" }}>TradeGo.Live</h1>
                  </Row>

                  <Row className="justify-content-center">
                    <h5
                      className="text-muted mt-2"
                      style={{ fontStyle: "italic", fontSize: "1rem" }}
                    >
                      Predict. Bet. Earn.
                    </h5>
                  </Row>

                  <Row className="justify-content-center mt-3">
                    <h3 style={{ fontSize: "1.2rem" }}>
                      You could be earning in minutes.
                    </h3>
                  </Row>

                  <Row className="mt-3 justify-content-center">
                    <Link className="green-theme-text" to="/register">
                      <Button
                        className="mr-2 splash-form-button"
                        style={{ marginBottom: "0.5rem", width: "120px" }}
                      >
                        Sign Up
                      </Button>
                    </Link>
                    <Link className="green-theme-text" to="/login">
                      <Button
                        className="ml-2 splash-form-button"
                        style={{ marginBottom: "0.5rem", width: "120px" }}
                      >
                        Log In
                      </Button>
                    </Link>
                  </Row>
                </div>
              </Col>

              {/* Right Image */}
              <Col xs={12} md={6} className="text-center">
                <Image
                  className="splashImage"
                  src={splashImage}
                  alt="splash"
                  style={{ maxWidth: "100%", height: "auto" }}
                  fluid
                />
              </Col>
            </Row>

            {/* Footer */}
            <Navbar
              className="paper-shadow-class footer-bg justify-content-center"
              fixed="bottom"
              style={{ fontSize: "0.8rem", textAlign: "center" }}
            >
              <Nav className="justify-content-center w-100">
                <Nav.Link
                  className="green-theme-text"
                  style={{ fontSize: "0.8rem" }}
                  href="#"
                >
                  TradeGo.Live, a TradeGo Project
                </Nav.Link>
              </Nav>
            </Navbar>
          </>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  error: state.error
});

export default connect(mapStateToProps, { login, clearErrors })(Splash);


