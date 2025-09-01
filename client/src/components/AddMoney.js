// components/AddMoney.js
import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Form, Container, Card, Image, Spinner, Alert } from "react-bootstrap";
import PropTypes from "prop-types";
import { refreshUserData } from "../actions/userActions";
import { createDepositRequest } from "../actions/transactionActions";
import Footerv2 from "./Footerv2";
import NavBar from "./NavBar";

class AddMoney extends Component {
  state = {
    amount: "",
    screenshot: null,
    screenshotPreview: null,
    alertMessage: "",
    alertVariant: "",
  };

  static propTypes = {
    user: PropTypes.object,
    transaction: PropTypes.object,
    createDepositRequest: PropTypes.func.isRequired,
    refreshUserData: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { user, refreshUserData } = this.props;
    if (user) refreshUserData(user._id || user.id);
  }

  componentDidUpdate(prevProps) {
    const { transaction } = this.props;

    if (prevProps.transaction.loading && !transaction.loading) {
      if (transaction.success) {
        this.setState({
          alertMessage: "Deposit request submitted successfully!",
          alertVariant: "success",
          amount: "",
          screenshot: null,
          screenshotPreview: null,
        });
      } else if (transaction.error) {
        this.setState({
          alertMessage: transaction.error,
          alertVariant: "danger",
        });
      }
    }
  }

  handleCreateRequest = () => {
    const { user, createDepositRequest } = this.props;
    const { amount, screenshot } = this.state;

    const userId = user?._id || user?.id;
    if (!userId) return alert("User ID missing");
    if (!amount) return alert("Please enter deposit amount");
    if (!screenshot) return alert("Please upload a payment screenshot");

    createDepositRequest(userId, amount, screenshot);
  };

  render() {
    const { amount, screenshotPreview, alertMessage, alertVariant } = this.state;
    const { transaction } = this.props;
    const qrCodeUrl = "https://trade2-tm7d.onrender.com/static/qr.png";
    return (
      <>
        <NavBar />

        {/* Floating Top-Right Alert */}
        {alertMessage && (
          <div
            style={{
              position: "fixed",
              top: "6rem",
              right: "20px",
              zIndex: 1050,
              minWidth: "250px",
            }}
          >
            <Alert
              variant={alertVariant}
              dismissible
              onClose={() => this.setState({ alertMessage: "" })}
            >
              {alertMessage}
            </Alert>
          </div>
        )}

        <Container className="d-flex justify-content-center align-items-center mt-5">
          <Card
            className="p-4 shadow"
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#1e1e1e",
              color: "rgb(33, 206, 153)",
            }}
          >
            <h3 className="mb-4 text-center">Add Money to Wallet</h3>

            {/* QR Code */}
            <div className="text-center mb-4">
              <h5>Scan this QR Code to Pay</h5>
              <Image src={qrCodeUrl} fluid style={{ borderRadius: "8px" }} />
            </div>

            {/* Amount Input */}
            <Form.Group controlId="formAmount">
              <Form.Label>Enter Amount (USD)</Form.Label>
              <Form.Control
                type="number"
                placeholder="e.g. 100"
                value={amount}
                onChange={(e) => this.setState({ amount: e.target.value })}
                required
                min={1}
                style={{
                  backgroundColor: "#2a2a2a",
                  color: "#fff",
                  border: "1px solid rgb(33,206,153)",
                }}
              />
            </Form.Group>

            {/* Screenshot Upload */}
            <Form.Group controlId="formScreenshot" className="mt-3">
              <Form.Label>Upload Payment Screenshot</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) =>
                  this.setState({
                    screenshot: e.target.files[0],
                    screenshotPreview: URL.createObjectURL(e.target.files[0]),
                  })
                }
                style={{ backgroundColor: "#2a2a2a", color: "#fff" }}
              />
            </Form.Group>

            {/* Preview Screenshot */}
            {screenshotPreview && (
              <div className="text-center mt-3">
                <p>Preview of uploaded screenshot:</p>
                <Image src={screenshotPreview} fluid thumbnail />
              </div>
            )}

            {/* Submit */}
            <Button
              style={{ backgroundColor: "rgb(33, 206, 153)", border: "none" }}
              className="w-100 mt-3"
              onClick={this.handleCreateRequest}
              disabled={transaction.loading}
            >
              {transaction.loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Submit Deposit Request"
              )}
            </Button>
          </Card>
        </Container>

        <Footerv2 />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
  transaction: state.transaction,
});

export default connect(mapStateToProps, { createDepositRequest, refreshUserData })(AddMoney);

