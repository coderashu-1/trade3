import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Container, Tabs, Tab, Pagination } from "react-bootstrap";
import PropTypes from "prop-types";
import { refreshUserData } from "../actions/userActions";
import WithdrawMoney from "./WithdrawMoney";

class StockHistory extends Component {
  state = {
    activeTab: "account",
    currentPage: 1,
    itemsPerPage: 5,
    pageWindowStart: 1,
    pageWindowSize: 4,
  };

  static propTypes = {
    user: PropTypes.object,
    refreshUserData: PropTypes.func,
  };

  formatCustomDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleString() : "Not available";

  handlePageChange = (pageNumber, totalPages) => {
    const { pageWindowSize } = this.state;
    let pageWindowStart = this.state.pageWindowStart;

    if (pageNumber >= pageWindowStart + pageWindowSize) {
      pageWindowStart = pageNumber;
    } else if (pageNumber < pageWindowStart) {
      pageWindowStart = pageNumber - pageWindowSize + 1;
      if (pageWindowStart < 1) pageWindowStart = 1;
    }

    this.setState({ currentPage: pageNumber, pageWindowStart });
  };

  renderPagination = (totalItems) => {
    const { currentPage, itemsPerPage, pageWindowStart, pageWindowSize } = this.state;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = pageWindowStart; i <= Math.min(totalPages, pageWindowStart + pageWindowSize - 1); i++) {
      pageNumbers.push(i);
    }

    return (
      <Pagination className="justify-content-center mt-3 flex-wrap">
        <Pagination.First
          onClick={() => this.handlePageChange(1, totalPages)}
          disabled={currentPage === 1}
        />
        <Pagination.Prev
          onClick={() => currentPage > 1 && this.handlePageChange(currentPage - 1, totalPages)}
          disabled={currentPage === 1}
        />
        {pageNumbers.map(number => (
          <Pagination.Item
            key={number}
            active={number === currentPage}
            onClick={() => this.handlePageChange(number, totalPages)}
            style={{
              backgroundColor: number === currentPage ? "rgb(33, 206, 153)" : "transparent",
              color: number === currentPage ? "#000" : "#21ce99",
              border: "1px solid #21ce99",
              margin: "0 2px",
            }}
          >
            {number}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => currentPage < totalPages && this.handlePageChange(currentPage + 1, totalPages)}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => this.handlePageChange(totalPages, totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  render() {
    const { user } = this.props;
    const { activeTab, currentPage, itemsPerPage } = this.state;

    const tabStyle = (key) => ({
      color: activeTab === key ? "grey" : "rgb(33, 206, 153)",
      fontWeight: activeTab === key ? "bold" : "normal",
    });

    let displayedHistory = [];
    if (user?.history?.length > 0) {
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      displayedHistory = user.history.slice(start, end);
    }

    const deposits = user?.transactions?.filter(tx => tx.type === "deposit") || [];
    const withdraws = user?.transactions?.filter(tx => tx.type === "withdraw") || [];

    return (
      <Container className="mt-4">
        <Tabs
          id="account-betting-tabs"
          activeKey={activeTab}
          onSelect={(key) => this.setState({ activeTab: key })}
          className="mb-4"
        >
          {/* Account Info Tab */}
          <Tab eventKey="account" title={<span style={tabStyle("account")}>Account Info</span>}>
            {user ? (
              <>
                <Row className="justify-content-center mt-3">
                  <h3 style={{ color: "rgb(33, 206, 153)" }}>Account Information</h3>
                </Row>
                <Row className="mt-3 justify-content-center"><p style={{ color: "rgb(33, 206, 153)" }}><strong>Name:</strong> {user.name}</p></Row>
                <Row className="mt-2 justify-content-center"><p style={{ color: "rgb(33, 206, 153)" }}><strong>Email:</strong> {user.email}</p></Row>
                <Row className="mt-2 justify-content-center"><p style={{ color: "rgb(33, 206, 153)" }}><strong>Account ID:</strong> {user._id || "Not available"}</p></Row>
                <Row className="mt-2 justify-content-center">
                  <p style={{ color: "rgb(33, 206, 153)" }}>
                    <strong>Current Balance:</strong>{" "}
                    {user.balance?.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                  </p>
                </Row>
              </>
            ) : <Row className="justify-content-center"><p>Loading user information...</p></Row>}
          </Tab>

          {/* History Tab */}
          <Tab eventKey="betting" title={<span style={tabStyle("betting")}>History</span>}>
            {displayedHistory.length > 0 ? (
              displayedHistory.map((item, index) => (
                <Row key={index} className="mt-2 mb-2 justify-content-center">
                  <Col xs={11} lg={8}>
                    <p style={{
                      color: "#fff",
                      textAlign: "center",
                      border: "1px solid rgba(33, 206, 153, 0.5)",
                      borderRadius: "8px",
                      padding: "10px",
                      backgroundColor: "#2a2a2a",
                      wordBreak: "break-word",
                    }}>
                      {item}
                    </p>
                  </Col>
                </Row>
              ))
            ) : (
              <Row className="justify-content-center mt-3"><p>No betting history found.</p></Row>
            )}
            {this.renderPagination(user?.history?.length || 0)}
          </Tab>

          {/* Withdraw Tab */}
          <Tab eventKey="withdraw" title={<span style={tabStyle("withdraw")}>Withdraw</span>}>
            <Row className="justify-content-center mt-3">
              <Col xs={12} lg={8}>
                <WithdrawMoney />
              </Col>
            </Row>
          </Tab>

          {/* Transactions Tab */}
          <Tab eventKey="transactions" title={<span style={tabStyle("transactions")}>Transactions</span>}>
            <Row className="justify-content-center mt-3">
              <Col xs={12} lg={10}>
                <h3 className="text-center mb-4" style={{ color: "rgb(33, 206, 153)" }}>Deposit & Withdrawal History</h3>

                <Tabs id="nested-transactions-tabs" defaultActiveKey="deposits" className="mb-4" justify>
                  {/* Deposits */}
                  <Tab eventKey="deposits" title="Deposits">
                    {deposits.length > 0 ? (
                      deposits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((tx, index) => (
                          <Row key={index} className="mb-3 justify-content-center">
                            <Col xs={12} lg={10}>
                              <div style={{
                                color: "#fff",
                                border: "1px solid rgba(0, 200, 83, 0.7)",
                                borderRadius: "12px",
                                padding: "15px 20px",
                                backgroundColor: "#1b2f1b",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                              }}>
                                <h5 style={{ color: "rgb(33, 206, 153)" }}>Deposit - {tx.status.toUpperCase()}</h5>
                                <p><strong>Amount:</strong> {tx.amount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</p>
                                {tx.qrCodeImage && <p><strong>QR Code:</strong> <a href={tx.qrCodeImage} target="_blank" rel="noreferrer" style={{ color: "#21ce99" }}>View</a></p>}
                                {tx.screenshot && <p><strong>Screenshot:</strong> <a href={tx.screenshot} target="_blank" rel="noreferrer" style={{ color: "#21ce99" }}>View</a></p>}
                                <p><strong>Date:</strong> {new Date(tx.createdAt).toLocaleString()}</p>
                              </div>
                            </Col>
                          </Row>
                        ))
                    ) : (
                      <Row className="justify-content-center mt-3">
                        <p style={{ color: "#fff", textAlign: "center" }}>No deposit history found.</p>
                      </Row>
                    )}
                  </Tab>

                  {/* Withdrawals */}
                  <Tab eventKey="withdrawals" title="Withdrawals">
                    {withdraws.length > 0 ? (
                      withdraws.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((tx, index) => (
                          <Row key={index} className="mb-3 justify-content-center">
                            <Col xs={12} lg={10}>
                              <div style={{
                                color: "#fff",
                                border: "1px solid rgba(255, 82, 82, 0.7)",
                                borderRadius: "12px",
                                padding: "15px 20px",
                                backgroundColor: "#2f1b1b",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                              }}>
                                <h5 style={{ color: "#ff5252" }}>Withdrawal - {tx.status.toUpperCase()}</h5>
                                <p><strong>Amount:</strong> {tx.amount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</p>
                                {tx.upiId ? (
                                  <p><strong>UPI ID:</strong> {tx.upiId}</p>
                                ) : (
                                  <>
                                    <p><strong>Bank Name:</strong> {tx.bankName}</p>
                                    <p><strong>Account Number:</strong> {tx.accountNumber}</p>
                                    <p><strong>IFSC:</strong> {tx.ifscCode}</p>
                                    <p><strong>Account Holder:</strong> {tx.accountHolderName}</p>
                                  </>
                                )}
                                <p><strong>Date:</strong> {new Date(tx.createdAt).toLocaleString()}</p>
                              </div>
                            </Col>
                          </Row>
                        ))
                    ) : (
                      <Row className="justify-content-center mt-3">
                        <p style={{ color: "#fff", textAlign: "center" }}>No withdrawal history found.</p>
                      </Row>
                    )}
                  </Tab>
                </Tabs>

                {this.renderPagination(user?.transactions?.length || 0)}
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="help" title={<span style={tabStyle("help")}>Help Center</span>}>
            <Row className="justify-content-center mt-3">
              <Col xs={12} lg={8}>
                <h3 className="text-center mb-4" style={{ color: "rgb(33, 206, 153)" }}>Help Center</h3>
                <div style={{
                  color: "#fff",
                  border: "1px solid rgba(33, 206, 153, 0.5)",
                  borderRadius: "12px",
                  padding: "20px",
                  backgroundColor: "#2a2a2a",
                  textAlign: "center",
                  lineHeight: "1.8",
                }}>
                  <p>We are here to assist you anytime! Reach out to us through any of the options below:</p>

                  <p>
                    <strong>WhatsApp Support:</strong><br />
                    <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                        alt="WhatsApp" 
                        style={{ width: "40px", height: "40px", cursor: "pointer" }} 
                      />
                    </a>
                  </p>

                  <p>
                    <strong>Email:</strong><br />
                    <a href="mailto:support@example.com" style={{ color: "#21ce99" }}>
                      support@example.com
                    </a>
                  </p>

                  <p>
                    <strong>Phone:</strong><br />
                    +1 234 567 890
                  </p>

                  <p>
                    <strong>Other Help Info:</strong><br />
                    You can message us anytime for account support, transaction help, or general queries. Our support team is happy to assist you promptly.
                  </p>

                  <p>Feel free to reach out—we are always here to help! 😊</p>
                </div>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps, { refreshUserData })(StockHistory);
