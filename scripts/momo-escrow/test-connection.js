/**
 * Flutterwave Mobile Money API Connectivity Test Script
 * 
 * Running this script:
 *   FLUTTERWAVE_PUBLIC_KEY="FLWPUBK_xxx" \
 *   FLUTTERWAVE_SECRET_KEY="FLWSECK_xxx" \
 *   FLUTTERWAVE_ENCRYPTION_KEY="FLWSECK_xxx" \
 *   node scripts/momo-escrow/test-connection.js
 */

// Load config (throws error if keys are missing)
const config = require("./config");

async function testConnection() {
  console.log("⚡ Starting Flutterwave Sandbox Connection Test...");
  console.log(`📡 URL Target: ${config.API_BASE_URL}/banks/UG`);
  console.log(`🔑 Using Secret Key: ${config.SECRET_KEY.substring(0, 12)}... (hidden for security)`);

  try {
    const response = await fetch(`${config.API_BASE_URL}/banks/UG`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${config.SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (response.ok && data.status === "success") {
      console.log("\n🟢 [SUCCESS] Successfully authenticated with Flutterwave!");
      console.log("------------------------------------------------------------");
      console.log(`📝 Sandbox Response Status: ${data.status}`);
      console.log(`🏦 Retrieved ${data.data.length} mobile money networks / banks in Uganda:`);
      
      // Print top Mobile Money providers returned by Flutterwave
      const momoProviders = data.data.filter(b => b.code.includes("MTN") || b.code.includes("ARTL") || b.name.toLowerCase().includes("money"));
      momoProviders.forEach(provider => {
        console.log(`  - 📱 Provider: ${provider.name} (Code: ${provider.code})`);
      });
      console.log("------------------------------------------------------------");
      console.log("🚀 Your API keys are valid and ready for mobile money escrow processing!");
    } else {
      console.error("\n🔴 [API ERROR] Authentication failed or returned an error.");
      console.error(`Status Code: ${response.status}`);
      console.error(`Error Details:`, data);
    }
  } catch (error) {
    console.error("\n❌ [CONNECTION FATAL] Could not connect to Flutterwave API.");
    console.error(error.message);
  }
}

testConnection();
