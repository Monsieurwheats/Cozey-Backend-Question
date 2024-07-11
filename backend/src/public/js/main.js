async function fetchOrders() {
    try {
        const response = await axios.get('/api/orders');
        const orders = response.data;
        const ordersContainer = document.getElementById('orders');
        ordersContainer.innerHTML = orders.map(order => `
            <div>
                <h3>Order ID: ${order.orderId}</h3>
                <p>Total: $${order.orderTotal.toFixed(2)}</p>
                <p>Customer: ${order.customerName}</p>
                <p>Date: ${new Date(order.orderDate).toLocaleDateString()}</p>
                <h4>Line Items:</h4>
                <ul>
                    ${order.lineItems.map(item => `
                        <li>
                            ${item.name} - $${item.price.toFixed(2)}
                            <ul>
                                ${item.lineItemProducts.map(lip => `
                                    <li>${lip.product.name} (Qty: ${lip.quantity})</li>
                                `).join('')}
                            </ul>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

async function fetchPickingList() {
    try {
        const response = await axios.get('/api/warehouse/picking-list');
        const pickingList = response.data;
        console.log(pickingList)
        const pickingListContainer = document.getElementById('picking-list');
        pickingListContainer.innerHTML = pickingList.map(item => `
            <div>
                <p>Product: ${item.name} - ${item.quantity}</p>
            </div>
        `).join('');
        console.log(pickingListContainer)

    } catch (error) {
        console.log('hello')
        console.log('Error fetching picking list:', error);
    }
}

async function fetchPackingList() {
    try {
        const response = await axios.get('/api/warehouse/packing-list');
        const packingList = response.data;
        console.log(packingList)

        const packingListContainer = document.getElementById('packing-list');
        packingListContainer.innerHTML = packingList.map(order => `
            <div>
                <h4>Order ID: ${order.orderId}</h4>
                <p>Customer: ${order.customerName}</p>
                <p>Shipping Address: ${formatAddress(order.shippingAddress)}</p>
                <ul>
                    ${order.lineItems.map(item => `
                        <li>${item.name}</li>
                        <ul>
                            ${item.products.map(product => `
                                <li>${product}</li>
                            `).join('')}
                        </ul>
                    `).join('')}
                </ul>
            </div>
        `).join('');
         console.log(packingListContainer)

    } catch (error) {
        console.log('Error fetching packing list:', error);
    }
}

function formatAddress(address) {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
    console.log('HLELO')
    fetchPickingList();

    fetchPackingList();

});