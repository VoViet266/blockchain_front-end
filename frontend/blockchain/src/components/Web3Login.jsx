import React, { useState } from "react";
import { BrowserProvider } from "ethers"; 
import Web3Service from "../services/web3_login.service";

const Web3Login = () => {
  const [userAddress, setUserAddress] = useState(null);

  const connectAndLogin = async () => {
    try {
      if (!window.ethereum) {
        alert("Vui lòng cài đặt MetaMask để sử dụng tính năng này!");
        return;
      }
      await Web3Service.connectAndLogin().then((address) => {
        setUserAddress(address);
      });
      alert("Đăng nhập thành công!");
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      alert("Đăng nhập thất bại, vui lòng thử lại.");
    }
  };

  const fetchProtectedData = async () => {
    try {
      await Web3Service.fetchProtectedData();
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      alert("Gọi API thất bại, vui lòng thử lại.");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        marginBottom: "20px",
        textAlign: "center",
      }}
    >
      <h2>Web3 Login (MetaMask)</h2>

      {!userAddress ? (
        <button
          onClick={connectAndLogin}
          style={{ padding: "10px 20px", cursor: "pointer", fontSize: "16px" }}
        >
          Đăng nhập bằng MetaMask
        </button>
      ) : (
        <div>
          <p>
            Xin chào ví:{" "}
            <strong style={{ color: "green" }}>{userAddress}</strong>
          </p>
          <button
            onClick={fetchProtectedData}
            style={{ marginRight: "10px", padding: "10px" }}
          >
            Test API (Protected)
          </button>
          <button
            onClick={() => {
              setUserAddress(null);
              localStorage.removeItem("accessToken");
            }}
            style={{
              padding: "10px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Đăng Xuất
          </button>
        </div>
      )}
    </div>
  );
};

export default Web3Login;
