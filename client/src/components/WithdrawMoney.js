// components/WithdrawMoney.js
import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Form, Container, Card, Spinner, Alert } from "react-bootstrap";
import PropTypes from "prop-types";
import { refreshUserData } from "../actions/userActions";
import { createWithdrawRequest } from "../actions/transactionActions";

class WithdrawMoney extends Component {
  state = {
    amount: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    accountHolderName: "",
    upiId: "",
    alertMessage: "",
    alertVariant: "",
  };

  static propTypes = {
    user: PropTypes.object,
    transaction: PropTypes.object,
    createWithdrawRequest: PropTypes.func.isRequired,
    refreshUserData: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { user, refreshUserData } = this.props;
    if (user) refreshUserData(user._id || user.id);
  }

  componentDidUpdate(prevProps) {
    const { transaction } = this.props;

    // Trigger alert only when loading finishes
    if (prevProps.transaction.loading && !transaction.loading) {
      if (transaction.success) {
        this.setState({
          alertMessage: "Withdrawal request submitted successfully!",
          alertVariant: "success",
          amount: "",
          accountNumber: "",
          bankName: "",
          ifscCode: "",
          accountHolderName: "",
          upiId: "",
        });
      } else if (transaction.error) {
        this.setState({
          alertMessage: transaction.error,
          alertVariant: "danger",
        });
      }
    }
  }

  handleWithdrawRequest = () => {
    const { user, createWithdrawRequest } = this.props;
    const { amount, accountNumber, bankName, ifscCode, accountHolderName, upiId } = this.state;

    const userId = user?._id || user?.id;
    if (!userId) return this.setState({ alertMessage: "User ID missing", alertVariant: "danger" });
    if (!amount) return this.setState({ alertMessage: "Amount is required", alertVariant: "danger" });

    // Minimum withdrawal check
    if (Number(amount) < 500) {
      return this.setState({ alertMessage: "Minimum withdrawal amount is ₹500", alertVariant: "danger" });
    }

    // Require either UPI or full bank details
    if ((!upiId || upiId.trim() === "") &&
        (!accountNumber || !bankName || !ifscCode || !accountHolderName)) {
      return this.setState({ alertMessage: "Provide either UPI ID or complete bank details", alertVariant: "danger" });
    }

    // Check if user has enough balance
    if (user.balance < parseFloat(amount)) {
      return this.setState({ alertMessage: "Insufficient balance", alertVariant: "danger" });
    }

    createWithdrawRequest(userId, { amount, accountNumber, bankName, ifscCode, accountHolderName, upiId });
  };

  render() {
    const { amount, accountNumber, bankName, ifscCode, accountHolderName, upiId, alertMessage, alertVariant } = this.state;
    const { transaction, user } = this.props;

    const isAmountInvalid = Number(amount) < 500;
    const isInsufficientBalance = user && parseFloat(amount) > user.balance;

    return (
      <>
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
            style={{ width: "100%", maxWidth: "480px", backgroundColor: "#1e1e1e", color: "rgb(33, 206, 153)" }}
          >
            <h3 className="mb-4 text-center">Withdraw Money</h3>

            <Form.Group controlId="formAmount">
              <Form.Label>Amount to Withdraw (INR)</Form.Label>
              <Form.Control
                type="number"
                placeholder="e.g. 500"
                value={amount}
                onChange={(e) => this.setState({ amount: e.target.value })}
                min={1}
                style={{ backgroundColor: "#2a2a2a", color: "#fff", border: "1px solid rgb(33,206,153)" }}
              />
            </Form.Group>

            {isAmountInvalid && (
              <p className="text-warning text-center mt-2">Minimum withdrawal amount is ₹500</p>
            )}

            {/* Optional UPI */}
            <Form.Group controlId="formUPI" className="mt-3">
              <Form.Label>UPI ID (optional if using bank details)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. yourupi@bank"
                value={upiId}
                onChange={(e) => this.setState({ upiId: e.target.value })}
                style={{ backgroundColor: "#2a2a2a", color: "#fff", border: "1px solid rgb(33,206,153)" }}
              />
            </Form.Group>

            <p className="mt-3 text-center">OR Enter Bank Details:</p>

            <Form.Group controlId="formBank" className="mt-2">
              <Form.Label>Bank Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Your Bank Name"
                value={bankName}
                onChange={(e) => this.setState({ bankName: e.target.value })}
                style={{ backgroundColor: "#2a2a2a", color: "#fff", border: "1px solid rgb(33,206,153)" }}
              />
            </Form.Group>

            <Form.Group controlId="formAccountNumber" className="mt-3">
              <Form.Label>Account Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Your Account Number"
                value={accountNumber}
                onChange={(e) => this.setState({ accountNumber: e.target.value })}
                style={{ backgroundColor: "#2a2a2a", color: "#fff", border: "1px solid rgb(33,206,153)" }}
              />
            </Form.Group>

            <Form.Group controlId="formIFSC" className="mt-3">
              <Form.Label>IFSC Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Your Bank IFSC Code"
                value={ifscCode}
                onChange={(e) => this.setState({ ifscCode: e.target.value })}
                style={{ backgroundColor: "#2a2a2a", color: "#fff", border: "1px solid rgb(33,206,153)" }}
              />
            </Form.Group>

            <Form.Group controlId="formAccountHolder" className="mt-3">
              <Form.Label>Account Holder Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Your Name"
                value={accountHolderName}
                onChange={(e) => this.setState({ accountHolderName: e.target.value })}
                style={{ backgroundColor: "#2a2a2a", color: "#fff", border: "1px solid rgb(33,206,153)" }}
              />
            </Form.Group>

            <Button
              style={{ backgroundColor: "rgb(33, 206, 153)", border: "none" }}
              className="w-100 mt-4"
              onClick={this.handleWithdrawRequest}
              disabled={transaction.loading || isInsufficientBalance || isAmountInvalid}
            >
              {transaction.loading ? <Spinner animation="border" size="sm" /> : "Submit Withdrawal Request"}
            </Button>

            {isInsufficientBalance && (
              <p className="text-danger text-center mt-2">Insufficient balance</p>
            )}
          </Card>
        </Container>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
  transaction: state.transaction,
});

export default connect(mapStateToProps, { refreshUserData, createWithdrawRequest })(WithdrawMoney);
