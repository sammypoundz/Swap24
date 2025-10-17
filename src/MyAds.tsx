import React, { useEffect, useState } from "react";
import "./PlaceAds.css"; // Reuse same style
import { useNavigate } from "react-router-dom";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { ArrowLeft, PlusCircle, Eye, XCircle, Loader2 } from "lucide-react";
import MARKET_ABI from "./contracts/Swap24MarketABI.json";

const MARKETPLACE_CONTRACT = "0x4f12d6fb32891acb6221d5c0f6b90a11b6da1427";

interface Ad {
  id: bigint;
  vendor: string;
  tokenAddress: string;
  cryptoToken: string;
  tokenAmount: bigint;
  priceInNaira: bigint;
  paymentMethod: string;
  rate: string;
  isActive: boolean;
  isETH: boolean;
}

const MyAds: React.FC = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const client = usePublicClient();

  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loadingAdId, setLoadingAdId] = useState<bigint | null>(null); // ✅ Track which ad is being cancelled

  // ✅ Fetch all ads
  const fetchMyAds = async () => {
    if (!client || !address) return;

    try {
      const allAds = (await client.readContract({
        address: MARKETPLACE_CONTRACT,
        abi: MARKET_ABI,
        functionName: "getAllAds",
      })) as Ad[];

      // Filter and sort ads (active first)
      const myAds = allAds
        .filter((ad) => ad.vendor.toLowerCase() === address.toLowerCase())
        .sort((a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1));

      setAds(myAds);
    } catch (err) {
      console.error("❌ Error fetching ads:", err);
    }
  };

  // ✅ Cancel ad with preloader
  const handleCancelAd = async (adId: bigint) => {
    if (!walletClient || !client) return alert("⚠️ Connect wallet first.");
    if (!window.confirm("Are you sure you want to cancel this ad?")) return;

    try {
      setLoadingAdId(adId);

      const txHash = await walletClient.writeContract({
        address: MARKETPLACE_CONTRACT,
        abi: MARKET_ABI,
        functionName: "cancelAd",
        args: [adId],
      });

      await client.waitForTransactionReceipt({ hash: txHash });
      alert(`✅ Ad cancelled!\nTx: ${txHash}`);

      // Refresh list and keep canceled ads at bottom
      await fetchMyAds();
    } catch (err) {
      console.error("❌ Cancel failed:", err);
      alert("Failed to cancel ad. See console for details.");
    } finally {
      setLoadingAdId(null);
    }
  };

  useEffect(() => {
    fetchMyAds();
  }, [address]);

  return (
    <div className="succ-placeads">
      {/* Header */}
      <div className="succ-placeads-header">
        <button
          className="succ-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={20} />
        </button>
        <h2>My Ads</h2>
      </div>

      {/* Create new ad button */}
      <div
        className="succ-action-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
          alignItems: "baseline",
        }}
      >
        <h3>Your Active Ads</h3>
        <button
          className="succ-submit-btn"
          onClick={() => navigate("/place-ads")}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <PlusCircle size={18} /> Create New Ad
        </button>
      </div>

      {/* Ad list */}
      <div className="succ-ad-list">
        {ads.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            No ads created yet.
          </p>
        ) : (
          ads.map((ad) => (
            <div
              key={Number(ad.id)}
              className={`succ-ad-card ${!ad.isActive ? "opacity-60" : ""}`}
            >
              <div className="succ-ad-card-body">
                <h4>
                  {ad.cryptoToken} {ad.isETH ? "(ETH)" : "(ERC20)"}
                </h4>
                <p>Amount: {Number(ad.tokenAmount) / 1e18}</p>
                <p>Price: ₦{Number(ad.priceInNaira)}</p>
                <p>Status: {ad.isActive ? "Active" : "Inactive"}</p>
              </div>

              <div className="succ-ad-actions">
                <button
                  className="succ-view-btn"
                  onClick={() => {
                    setSelectedAd(ad);
                    setModalOpen(true);
                  }}
                >
                  <Eye size={16} /> View
                </button>

                {ad.isActive && (
                  <button
                    className="succ-cancel-btn"
                    onClick={() => handleCancelAd(ad.id)}
                    disabled={loadingAdId === ad.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      minWidth: "90px",
                    }}
                  >
                    {loadingAdId === ad.id ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle size={16} /> Cancel
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for ad details */}
      {isModalOpen && selectedAd && (
        <div className="succ-modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="succ-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "320px" }}
          >
            <h3 style={{ marginBottom: "10px" }}>Ad Details</h3>
            <p>
              <strong>ID:</strong> {String(selectedAd.id)}
            </p>
            <p>
              <strong>Token:</strong> {selectedAd.cryptoToken}
            </p>
            <p>
              <strong>Token Address:</strong>{" "}
              {selectedAd.tokenAddress
                ? `${selectedAd.tokenAddress.slice(
                    0,
                    6
                  )}...${selectedAd.tokenAddress.slice(-4)}`
                : "N/A"}
            </p>
            <p>
              <strong>Amount:</strong> {Number(selectedAd.tokenAmount) / 1e18}
            </p>
            <p>
              <strong>Price (₦):</strong> {String(selectedAd.priceInNaira)}
            </p>
            <p>
              <strong>Payment Method:</strong> {selectedAd.paymentMethod}
            </p>
            <p>
              <strong>Rate:</strong> {selectedAd.rate}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {selectedAd.isActive ? "Active" : "Inactive"}
            </p>
            <p>
              <strong>Type:</strong> {selectedAd.isETH ? "ETH" : "ERC20"}
            </p>
            <button
              className="succ-submit-btn"
              style={{ marginTop: "1rem" }}
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAds;
