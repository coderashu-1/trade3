// components/AdminPanel.js
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  fetchPendingDeposits,
  fetchPendingWithdraws,
  approveDeposit,
  approveWithdraw,
  fetchAllUsers,
  toggleAdminStatus,
  deleteUser,
  updateQrCode,
  resetUserPassword, // ✅ reset password
  deleteTransaction, // ✅ delete deposit/withdraw
} from "../actions/adminActions";
import PropTypes from "prop-types";
import Footerv2 from "./Footerv2";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Pagination,
  Modal,
} from "react-bootstrap";

const AdminNavBar = () => (
  <nav
    className="navbar navbar-dark"
    style={{
      background: "linear-gradient(90deg, #0f2027, #203a43, #2c5364)",
      padding: "0.5rem 2rem",
      boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
    }}
  >
    <a className="navbar-brand" href="#" style={{ fontWeight: "700", fontSize: "1.5rem" }}>
      TradeGo Admin
    </a>
  </nav>
);

const AdminPanel = ({
  admin,
  users,
  fetchPendingDeposits,
  fetchPendingWithdraws,
  approveDeposit,
  approveWithdraw,
  fetchAllUsers,
  toggleAdminStatus,
  deleteUser,
  updateQrCode,
  resetUserPassword,
  deleteTransaction,
}) => {
  const [activeTab, setActiveTab] = useState("deposits");
  const [modal, setModal] = useState({ show: false, txId: null, type: "" });
  const [confirmUserModal, setConfirmUserModal] = useState({ show: false, userId: null, action: "" });
  const [alertModal, setAlertModal] = useState({ show: false, message: "" });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // QR Code
  const [qrFile, setQrFile] = useState(null);

  // Reset Password modal
  const [resetPasswordModal, setResetPasswordModal] = useState({
    show: false,
    userId: null,
    newPassword: "",
  });

  useEffect(() => {
    fetchPendingDeposits();
    fetchPendingWithdraws();
    fetchAllUsers();
  }, [fetchPendingDeposits, fetchPendingWithdraws, fetchAllUsers]);

  // --- Deposit / Withdraw approval ---
  const handleApproveClick = (txId, type) => setModal({ show: true, txId, type });

  const confirmApprove = () => {
    if (modal.type === "deposit") {
      approveDeposit(modal.txId);
    } else if (modal.type === "withdraw") {
      const tx = admin.withdraws.find((t) => t._id === modal.txId);
      if (!tx) return;
      if (tx.userId.balance < tx.amount) {
        setAlertModal({
          show: true,
          message: `Cannot approve withdrawal: User "${tx.userId.name}" has insufficient balance.`,
        });
        setModal({ show: false, txId: null, type: "" });
        return;
      }
      approveWithdraw(modal.txId);
    }
    setModal({ show: false, txId: null, type: "" });
  };

  // --- User actions ---
  const handleUserAction = (userId, action) =>
    setConfirmUserModal({ show: true, userId, action });

  const confirmUserAction = () => {
    const { userId, action } = confirmUserModal;
    if (action === "toggleAdmin") toggleAdminStatus(userId);
    if (action === "delete") deleteUser(userId);
    setConfirmUserModal({ show: false, userId: null, action: "" });
  };

  // --- Reset password ---
  const openResetPasswordModal = (userId) => {
    setResetPasswordModal({ show: true, userId, newPassword: "" });
  };

  const handleResetPasswordChange = (e) => {
    const value = e?.currentTarget?.value || "";
    setResetPasswordModal((prev) => ({ ...prev, newPassword: value }));
  };

  const confirmResetPassword = () => {
    if (!resetPasswordModal.newPassword || resetPasswordModal.newPassword.length < 6) {
      return setAlertModal({
        show: true,
        message: "Password must be at least 6 characters long",
      });
    }
    resetUserPassword(resetPasswordModal.userId, resetPasswordModal.newPassword);
    setResetPasswordModal({ show: false, userId: null, newPassword: "" });
  };

  // --- QR ---
  const handleQrChange = (e) => setQrFile(e.target.files[0]);
  const handleQrUpload = () => {
    if (!qrFile) return alert("Please select a QR code file");
    updateQrCode(qrFile);
    setQrFile(null);
  };

  // --- Filtering / Pagination ---
  const filteredDeposits = admin.deposits?.filter(
    (tx) =>
      tx.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.userId?.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredWithdraws = admin.withdraws?.filter(
    (tx) =>
      tx.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.userId?.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredUsers =
    users?.filter(
      (user) =>
        user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        user?.email?.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const paginate = (data) => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  const totalPages = (data) => Math.ceil(data.length / itemsPerPage);

  const sidebarStyle = {
    background: "#1f1f1f",
    borderRadius: "16px",
    padding: "1rem",
    minHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 6px 15px rgba(0,0,0,0.4)",
  };

  const tabStyle = (tab) => ({
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    marginBottom: "0.5rem",
    cursor: "pointer",
    background:
      activeTab === tab ? "linear-gradient(90deg, #0f2027, #203a43)" : "transparent",
    color: activeTab === tab ? "#fff" : "#ccc",
    fontWeight: "500",
    fontSize: "0.95rem",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s",
    boxShadow: activeTab === tab ? "0 4px 10px rgba(0,0,0,0.3)" : "none",
  });

  const iconStyle = { marginRight: "10px", fontSize: "1.2rem" };
  const cardStyle = {
    background: "#2c3e50",
    color: "#fff",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.4)",
  };

  const getFilename = (path) => path.replace(/^uploads\//, "");

  const closeModals = () => {
    setModal({ show: false, txId: null, type: "" });
    setConfirmUserModal({ show: false, userId: null, action: "" });
    setAlertModal({ show: false, message: "" });
    setResetPasswordModal({ show: false, userId: null, newPassword: "" });
  };

  return (
    <>
      <AdminNavBar />
      <Container fluid className="p-4" style={{ backgroundColor: "#121212", minHeight: "100vh" }}>
        <Row>
          {/* Sidebar */}
          <Col md={2}>
            <div style={sidebarStyle}>
              <div style={tabStyle("deposits")} onClick={() => setActiveTab("deposits")}>
                <span style={iconStyle}>💰</span> Deposit Requests
              </div>
              <div style={tabStyle("withdraws")} onClick={() => setActiveTab("withdraws")}>
                <span style={iconStyle}>🏦</span> Withdraw Requests
              </div>
              <div style={tabStyle("users")} onClick={() => setActiveTab("users")}>
                <span style={iconStyle}>👥</span> Users
              </div>
              <div style={tabStyle("qr")} onClick={() => setActiveTab("qr")}>
                <span style={iconStyle}>📷</span> QR Code
              </div>
            </div>
          </Col>

          {/* Main content */}
          <Col md={10}>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  backgroundColor: "#1f1f1f",
                  color: "#fff",
                  border: "1px solid #333",
                }}
              />
            </InputGroup>

            {/* Deposits */}
            {activeTab === "deposits" && (
              <Card style={cardStyle} className="mb-4">
                <Card.Body>
                  <Card.Title>Pending Deposits</Card.Title>
                  <Table striped bordered hover responsive variant="dark" className="mt-3">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Amount</th>
                        <th>Screenshot</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginate(filteredDeposits).map((tx) => {
                        const filename = getFilename(tx.screenshot || "");
                        return (
                          <tr key={tx._id}>
                            <td>{tx.userId?.name || tx.userId?.email}</td>
                            <td>₹{tx.amount.toFixed(2)}</td>
                            <td>
                              {tx.screenshot ? (
                                <a
                                  href={`/uploads/${filename}?token=${localStorage.getItem("token")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  View
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td>
                              <Button
                                size="sm"
                                variant="success"
                                style={{ marginRight: "0.5rem" }}
                                onClick={() => handleApproveClick(tx._id, "deposit")}
                                className="me-2"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => deleteTransaction(tx._id, "deposit")}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                  <Pagination className="justify-content-center mt-3">
                    {[...Array(totalPages(filteredDeposits))].map((_, num) => (
                      <Pagination.Item
                        key={num + 1}
                        active={currentPage === num + 1}
                        onClick={() => setCurrentPage(num + 1)}
                      >
                        {num + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                </Card.Body>
              </Card>
            )}

            {/* Withdraws */}
            {activeTab === "withdraws" && (
              <Card style={cardStyle} className="mb-4">
                <Card.Body>
                  <Card.Title>Pending Withdraws</Card.Title>
                  <Table striped bordered hover responsive variant="dark" className="mt-3">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Amount</th>
                        <th>UPI / Bank</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginate(filteredWithdraws).map((tx) => (
                        <tr key={tx._id}>
                          <td>{tx.userId?.name || tx.userId?.email}</td>
                          <td>₹{tx.amount.toFixed(2)}</td>
                          <td>
                            {tx.upiId
                              ? `UPI: ${tx.upiId}`
                              : `${tx.bankName} - ${tx.accountNumber} (${tx.ifscCode})`}
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="success"
                              style={{ marginRight: "0.5rem" }}
                              onClick={() => handleApproveClick(tx._id, "withdraw")}
                              className="me-2"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => deleteTransaction(tx._id, "withdraw")}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Pagination className="justify-content-center mt-3">
                    {[...Array(totalPages(filteredWithdraws))].map((_, num) => (
                      <Pagination.Item
                        key={num + 1}
                        active={currentPage === num + 1}
                        onClick={() => setCurrentPage(num + 1)}
                      >
                        {num + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                </Card.Body>
              </Card>
            )}

            {/* Users */}
            {activeTab === "users" && (
              <Card style={cardStyle} className="mb-4">
                <Card.Body>
                  <Card.Title>All Users</Card.Title>
                  <Table striped bordered hover responsive variant="dark" className="mt-3">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Balance</th>
                        <th>Admin</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginate(filteredUsers).map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.phone}</td>
                          <td>₹{user.balance.toFixed(2)}</td>
                          <td>{user.isAdmin ? "Yes" : "No"}</td>
                          <td>
                            <Button
                              size="sm"
                              style={{ marginRight: "0.5rem" }}
                              variant="warning"
                              className="me-2"
                              onClick={() => handleUserAction(user._id, "toggleAdmin")}
                            >
                              {user.isAdmin ? "Revoke Admin" : "Make Admin"}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              style={{ marginRight: "0.5rem" }}
                              className="me-2"
                              onClick={() => handleUserAction(user._id, "delete")}
                            >
                              Delete
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => openResetPasswordModal(user._id)}
                            >
                              Reset Password
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Pagination className="justify-content-center mt-3">
                    {[...Array(totalPages(filteredUsers))].map((_, num) => (
                      <Pagination.Item
                        key={num + 1}
                        active={currentPage === num + 1}
                        onClick={() => setCurrentPage(num + 1)}
                      >
                        {num + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                </Card.Body>
              </Card>
            )}

            {/* QR Code */}
            {activeTab === "qr" && (
              <Card style={cardStyle} className="mb-4">
                <Card.Body>
                  <Card.Title>Update QR Code</Card.Title>
                  <Form.Group>
                    <Form.Label>Select new QR Code</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleQrChange} />
                  </Form.Group>
                  <Button
                    className="mt-2"
                    variant="primary"
                    onClick={handleQrUpload}
                    disabled={!qrFile}
                  >
                    Upload
                  </Button>
                  <div className="mt-3">
                    <p>Current QR Code:</p>
                    {admin.qrCodeUrl ? (
                      <img
                        src={`https://trade3-production-398f.up.railway.app${admin.qrCodeUrl}`}
                        alt="QR"
                        style={{ width: "200px" }}
                      />
                    ) : (
                      <p>No QR code uploaded yet.</p>
                    )}
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
        <Footerv2 />
      </Container>

      {/* --- Modals --- */}
      <Modal show={modal.show} onHide={closeModals} centered>
        <Modal.Header style={{ background: "#2c3e50", color: "#fff" }} closeButton>
          <Modal.Title>Confirm Approval</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#2c3e50", color: "#fff" }}>
          Are you sure you want to approve this {modal.type}?
        </Modal.Body>
        <Modal.Footer style={{ background: "#2c3e50" }}>
          <Button variant="secondary" onClick={closeModals}>
            Cancel
          </Button>
          <Button variant="success" onClick={confirmApprove}>
            Approve
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={confirmUserModal.show} onHide={closeModals} centered>
        <Modal.Header style={{ background: "#2c3e50", color: "#fff" }} closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#2c3e50", color: "#fff" }}>
          Are you sure you want to{" "}
          {confirmUserModal.action === "delete"
            ? "delete this user"
            : "toggle admin status"}
          ?
        </Modal.Body>
        <Modal.Footer style={{ background: "#2c3e50" }}>
          <Button variant="secondary" onClick={closeModals}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmUserAction}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reset Password Modal */}
      <Modal show={resetPasswordModal.show} onHide={closeModals} centered>
        <Modal.Header style={{ background: "#2c3e50", color: "#fff" }} closeButton>
          <Modal.Title>Reset User Password</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#2c3e50", color: "#fff" }}>
          <Form.Control
            type="password"
            placeholder="Enter new password"
            value={resetPasswordModal.newPassword || ""}
            onChange={handleResetPasswordChange}
          />
        </Modal.Body>
        <Modal.Footer style={{ background: "#2c3e50" }}>
          <Button variant="secondary" onClick={closeModals}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmResetPassword}>
            Reset
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Alert Modal */}
      <Modal
        show={alertModal.show}
        onHide={() => setAlertModal({ show: false, message: "" })}
        centered
      >
        <Modal.Header style={{ background: "#2c3e50", color: "#fff" }} closeButton>
          <Modal.Title>Notice</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#2c3e50", color: "#fff" }}>
          {alertModal.message}
        </Modal.Body>
        <Modal.Footer style={{ background: "#2c3e50" }}>
          <Button
            variant="primary"
            onClick={() => setAlertModal({ show: false, message: "" })}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

AdminPanel.propTypes = {
  admin: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
  fetchPendingDeposits: PropTypes.func.isRequired,
  fetchPendingWithdraws: PropTypes.func.isRequired,
  approveDeposit: PropTypes.func.isRequired,
  approveWithdraw: PropTypes.func.isRequired,
  fetchAllUsers: PropTypes.func.isRequired,
  toggleAdminStatus: PropTypes.func.isRequired,
  deleteUser: PropTypes.func.isRequired,
  updateQrCode: PropTypes.func.isRequired,
  resetUserPassword: PropTypes.func.isRequired,
  deleteTransaction: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  admin: state.admin,
  users: state.admin.users || [],
});

export default connect(mapStateToProps, {
  fetchPendingDeposits,
  fetchPendingWithdraws,
  approveDeposit,
  approveWithdraw,
  fetchAllUsers,
  toggleAdminStatus,
  deleteUser,
  updateQrCode,
  resetUserPassword,
  deleteTransaction,
})(AdminPanel);


