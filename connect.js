document.addEventListener('DOMContentLoaded', (event) => {
    const connectButton = document.getElementById('connectButton');
    const walletInfo = document.getElementById('walletInfo');

    // Initialize TonConnect
    const tonConnect = new TonConnect({ host: 'https://connect.tonhubapi.com' });

    async function connectWallet() {
        try {
            const connection = await tonConnect.connect();
            console.log('Connection established:', connection);
            walletInfo.textContent = `Connected: ${connection.wallet.address}`;
        } catch (error) {
            console.error('Failed to connect:', error);
            walletInfo.textContent = 'Failed to connect';
        }
    }

    connectButton.addEventListener('click', () => {
        connectWallet();
    });

    // Check if already connected
    async function checkConnection() {
        const state = await tonConnect.getState();
        if (state.connected) {
            walletInfo.textContent = `Connected: ${state.wallet.address}`;
        } else {
            walletInfo.textContent = 'Not connected';
        }
    }

    checkConnection();
}); 
