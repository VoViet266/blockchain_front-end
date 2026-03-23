import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api.service";
import {
  connectWalletWithEthers,
  getConnectedWalletWithEthers,
  subscribeWalletChanges,
  WALLET_STORAGE_KEY,
} from "../../services/wallet.service";

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState("Sẵn sàng kết nối ví để bắt đầu truy xuất nguồn gốc.");
  const [isConnecting, setIsConnecting] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState("");

  const shortWallet = useMemo(() => {
    if (!wallet) return "Chưa kết nối";
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  }, [wallet]);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setStatus("Đang mở MetaMask...");

      const account = await connectWalletWithEthers();
      setWallet(account);
      localStorage.setItem(WALLET_STORAGE_KEY, account);
      setStatus("Kết nối ví thành công (ethers).");
    } catch (error) {
      setStatus(error?.message || "Kết nối thất bại, vui lòng thử lại.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet("");
    setProducts([]);
    setProductsError("");
    localStorage.removeItem(WALLET_STORAGE_KEY);
    setStatus("Đã ngắt kết nối trong ứng dụng. Nếu muốn thu hồi quyền hoàn toàn, hãy ngắt trong MetaMask.");
  };

  useEffect(() => {
    const syncWalletFromMetaMask = async () => {
      try {
        const account = await getConnectedWalletWithEthers();

        if (account) {
          setWallet(account);
          localStorage.setItem(WALLET_STORAGE_KEY, account);
          setStatus("Đã kết nối ví MetaMask.");
          return;
        }

        setWallet("");
        localStorage.removeItem(WALLET_STORAGE_KEY);
      } catch (_error) {
        const cachedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
        if (cachedWallet) {
          setWallet(cachedWallet);
        }
      }
    };

    const unsubscribe = subscribeWalletChanges((account) => {
      if (account) {
        setWallet(account);
        localStorage.setItem(WALLET_STORAGE_KEY, account);
        setStatus("Đã cập nhật ví MetaMask.");
      } else {
        setWallet("");
        localStorage.removeItem(WALLET_STORAGE_KEY);
        setStatus("MetaMask đã ngắt kết nối. Vui lòng kết nối lại để tiếp tục.");
      }
    });

    syncWalletFromMetaMask();

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchWalletProducts = async () => {
      if (!wallet) {
        setProducts([]);
        setProductsError("");
        return;
      }

      try {
        setIsLoadingProducts(true);
        setProductsError("");
        const response = await API.get("/products/", {
          params: { wallet },
        });
        setProducts(response.data || []);
      } catch (error) {
        if (!error?.response) {
          setProductsError("Không kết nối được backend. Kiểm tra server Django đang chạy tại 127.0.0.1:8000.");
        } else {
          setProductsError(error?.response?.data?.detail || "Không tải được danh sách sản phẩm.");
        }
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchWalletProducts();
  }, [wallet]);

  const toImageUrl = (imagePath) => {
    if (!imagePath) return "";
    try {
      return new URL(imagePath, API.defaults.baseURL).toString();
    } catch (_e) {
      return imagePath;
    }
  };

  return (
    <div className="min-h-screen p-24 c-[#21352c] overflow-x-hidden bg-custom-gradient font-sf-pro" style={{
      background: "radial-gradient(circle at 12% 18%, rgba(255, 196, 95, 0.28), transparent 42%), radial-gradient(circle at 88% 12%, rgba(28, 127, 91, 0.2), transparent 40%), linear-gradient(150deg, #f7f4e8 0%, #eef3dc 50%, #dff0e4 100%)"
    }}>
      <style>
        {`

          .feature p {
            margin: 0;
            color: #3c5d4f;
            line-height: 1.55;
            font-size: 14px;
          }

          .product-section {
            margin-top: 8px;
          }

          .product-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 10px;
          }

          .product-title {
            margin: 0;
            font-family: "Fraunces", serif;
            font-size: clamp(26px, 4vw, 40px);
            color: #163629;
          }

          .product-note {
            margin: 0;
            color: #365548;
            font-size: 14px;
          }

          .wallet-inline {
            border-radius: 999px;
            border: 1px solid rgba(37, 79, 63, 0.25);
            background: rgba(255, 255, 255, 0.75);
            padding: 8px 12px;
            color: #2a5242;
            font-size: 13px;
          }

          .product-list {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }

          @keyframes fade-up {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pop-in {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.985);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (max-width: 900px) {
            .hero {
              grid-template-columns: 1fr;
            }

            .feature-grid {
              grid-template-columns: 1fr;
            }

            .product-list {
              grid-template-columns: 1fr;
            }

            .wallet-address {
              font-size: 24px;
            }
          }

          @media (max-width: 560px) {
            .home-page {
              padding: 16px;
            }

            .panel {
              padding: 18px;
              border-radius: 18px;
            }
          }
        `}
      </style>

      <div className="max-w-1080 mx-auto grid gap-18 animate-fade-up">
        <span className="w-fit border border-[#2f6d56] text-[#245542] text-[12px] tracking-[0.12em] uppercase rounded-full px-12 py-8 bg-white/60 backdrop-blur-4 font-sf-pro">Niềm tin tuyệt đối</span>

        <section className="grid grid-cols-[1.2fr_0.8fr] gap-18">
          {/* .panel */}
          <article className="bg-white/78 border border-[#285946]/20 rounded-3xl p-24 shadow-[0_24px_45px_rgba(40,70,58,0.08)]">
            <h1 className="mt-14 mb-10 text-[clamp(34px,5vw,60px)] leading-[1.05] text-[#132e24] font-sf-pro font-bold">Agri Trace Platform</h1>
            <p className="m-0 text-[#365548] max-w-[52ch] leading-[1.65]">
              Theo dõi toàn bộ vòng đời nông sản từ thu hoạch, vận chuyển đến điểm bán với dữ liệu minh bạch trên blockchain.
            </p>

            <div className="flex gap-12 flex-wrap mt-22">
              {!wallet && (
                <button className="border-none rounded-[14px] py-12 px-18 text-[15px] font-semibold cursor-pointer transition-[transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease] decoration-none inline-flex hover:-translate-y-2 align-center justify-center bg-[linear-gradient(135deg, #2f8a62, #1f6647)] c-[#f6fff9] shadow-[0 14px 24px rgba(31, 102, 71, 0.26)]" onClick={connectWallet} disabled={isConnecting}>
                  {isConnecting ? "Đang kết nối..." : "Kết nối MetaMask"}
                </button>
              )}

              {wallet && (
                <button className="rounded-[14px] py-12 px-18 text-[15px] cursor-pointer transition-[transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease] decoration-none inline-flex hover:-translate-y-2 align-center justify-center bg-[#fff2f2] text-[#7b2b2b] border border-[#984242]/30" type="button" onClick={disconnectWallet}>
                  Ngắt kết nối
                </button>
              )}

              <Link className="rounded-[14px] py-12 px-18 text-[15px] cursor-pointer transition-[transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease] decoration-none inline-flex hover:-translate-y-2 align-center justify-center bg-[#f2efe2] text-[#1f4538] border border-[#23493c]/30" to="/create">
                Tạo sản phẩm mới
              </Link>
            </div>

            <div className="mt-16 p-14 rounded-[14px] bg-[#f6fbf7] border border-[#d6e9de] text-[#2f594b] text-14">{status}</div>
          </article>

          {/* Wallet card */}
          <article className="bg-white/78 border border-[#285946]/20 rounded-3xl p-24 grid content-between bg-[linear-gradient(160deg,rgba(16,40,33,0.97),rgba(30,77,60,0.95))] text-[#ecfff4] relative overflow-hidden rounded-24 shadow-[0_24px_45px_rgba(40,70,58,0.08)] before:content-[''] before:absolute before:w-180 before:h-180 before:rounded-full before:bg-[#ffd161]/20 before:blur-[2px] before:-top-70 before:-right-48 after:content-[''] after:absolute after:w-180 after:h-180 after:rounded-full after:bg-[#bdffd6]/16 after:blur-[2px] after:-bottom-78 after:-left-56">
            <div className="relative z-2">
              <p className="m-0 mb-8 text-12 uppercase tracking-[0.14em] text-[#dbffef] opacity-100">Wallet</p>
              <p className="text-[28px] leading-[1.2] m-0 font-bold break-all text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.28)]">{shortWallet}</p>
              <p className="mt-14 text-[#f3fff8] text-14 leading-normal">
                Địa chỉ ví được dùng để ký giao dịch và xác thực mọi thao tác ghi nhận hành trình sản phẩm.
              </p>
            </div>
          </article>
        </section>

        <section className="grid grid-cols-3 gap-12">
          {/* Feature */}
          <article className="rounded-18 p-16 bg-white/78 border border-[#23493c]/12 animate-[pop-in_480ms_ease-out]">
            <h3 className="mt-0 ml-0 mr-0 mb-8 text-[18px]">Minh bạch</h3>
            <p className="m-0 text-[#3c5d4f] leading-[1.55] text-14">Dữ liệu truy xuất không thể chỉnh sửa sau khi đã ghi lên blockchain.</p>
          </article>
          <article className="rounded-18 p-16 bg-white/78 border border-[#23493c]/12 animate-[pop-in_480ms_ease-out]">
            <h3 className="mt-0 ml-0 mr-0 mb-8 text-[18px]">Nhanh gọn</h3>
            <p className="m-0 text-[#3c5d4f] leading-[1.55] text-14">Tạo sản phẩm, cập nhật trạng thái và tra cứu thông tin chỉ trong vài bước.</p>
          </article>
          <article className="rounded-18 p-16 bg-white/78 border border-[#23493c]/12 animate-[pop-in_480ms_ease-out]">
            <h3 className="mt-0 ml-0 mr-0 mb-8 text-[18px]">Đáng tin</h3>
            <p className="m-0 text-[#3c5d4f] leading-[1.55] text-14">Người mua kiểm tra lịch sử hàng hóa tức thì bằng mã sản phẩm duy nhất.</p>
          </article>
        </section>

        <section className="product-section bg-white/78 border border-[#285946]/20 rounded-24 p-24 shadow-[0_24px_45px_rgba(40,70,58,0.08)]">
          <div className="product-head">
            <div>
              <h2 className="product-title">Nông sản của bạn</h2>
              <p className="product-note">Sau khi kết nối MetaMask, hệ thống sẽ hiển thị các sản phẩm thuộc địa chỉ này.</p>
            </div>
            <span className="wallet-inline">{shortWallet}</span>
          </div>

          {/* Product feedback */}
          {!wallet && <div className="rounded-xl border border-[#d6e9de] bg-[#f6fbf8] text-[#355f4f] p-12 text-14">Hãy kết nối MetaMask để xem danh sách sản phẩm của bạn.</div>}
          {wallet && isLoadingProducts && <div className="rounded-xl border border-[#d6e9de] bg-[#f6fbf8] text-[#355f4f] p-12 text-14">Đang tải danh sách sản phẩm...</div>}
          {wallet && productsError && <div className="rounded-xl border p-12 text-14 border-[#e6c0c0] bg-[#fff3f3] text-[#7d3434]">{productsError}</div>}

          {wallet && !isLoadingProducts && !productsError && products.length === 0 && (
            <div className="rounded-xl border border-[#d6e9de] bg-[#f6fbf8] text-[#355f4f] p-12 text-14">Ví này chưa có sản phẩm nào. Bạn có thể tạo sản phẩm mới ngay bây giờ.</div>
          )}

          {wallet && !isLoadingProducts && !productsError && products.length > 0 && Array.isArray(products) && (
            <div className="grid grid-cols-3 gap-12">
              {products.map((item) => (
                <Link key={item.id} className="grid gap-10 rounded-18 bg-white/82 border border-[#23493c]/14 p-12 no-underline text-inherit transition-all duration-180 ease-out hover:-translate-y-3 hover:shadow-[0_14px_24px_rgba(35,73,60,0.12)]" to={`/product/${item.id}`}>
                  {item.latest_version?.image && (
                    <img
                      className="w-full h-150 object-cover rounded-12 border border-[#d7e8de] bg-[#f0f6f2]"
                      src={toImageUrl(item.latest_version.image)}
                      alt={`Product ${item.name}`}
                    />
                  )}
                  <h3 className="m-0 font-bold text-[17px] c-[#1f4134]">{item.name}</h3>
                  <p className="m-0 c-[#3d6051] font-[13px] leading-1.5">Origin: {item.origin}</p>
                  <span className="w-fit rounded-full px-9 py-5 text-11 tracking-[0.04em] uppercase border border-[#cfe5d8] text-[#266044] bg-[#ecf8f1] font-bold">{item.latest_version?.status || "NO STATUS"}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}