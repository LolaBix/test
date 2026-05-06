document.addEventListener('DOMContentLoaded', () => {
    // Ne rien charger tant que le mot de passe n'est pas bon
});

function checkPassword() {
    const pwd = document.getElementById('admin-password').value;
    if (pwd === 'nounous2402') { // Mot de passe simple
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-main').style.display = 'block';
        document.getElementById('admin-header').style.display = 'flex';
        loadOrders();
    } else {
        document.getElementById('login-error').classList.remove('hidden');
    }
}

// Permettre la validation avec la touche Entrée
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen && loginScreen.style.display !== 'none') {
            checkPassword();
        }
    }
});

let currentFilter = 'Toutes';

function filterOrders(status) {
    currentFilter = status;

    // Update active class on buttons
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('filter-' + status).classList.add('active');

    loadOrders();
}

function loadOrders() {
    const ordersList = document.getElementById('orders-list');
    let orders = JSON.parse(localStorage.getItem('lolaOrders') || '[]');

    if (currentFilter !== 'Toutes') {
        orders = orders.filter(o => o.status === currentFilter);
    }

    if (orders.length === 0) {
        if (currentFilter === 'Toutes') {
            ordersList.innerHTML = '<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>Aucune commande pour le moment !</p></div>';
        } else {
            ordersList.innerHTML = `<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>Aucune commande "${currentFilter}" pour le moment.</p></div>`;
        }
        return;
    }

    // Trier par la plus récente en premier
    orders.sort((a, b) => b.id - a.id);

    let html = '';
    orders.forEach(order => {
        let statusClass = 'status-waiting';
        if (order.status === 'En cours') statusClass = 'status-progress';
        if (order.status === 'Terminé') statusClass = 'status-done';

        const cardClass = order.status === 'Terminé' ? 'order-card done' : 'order-card';

        html += `
            <div class="${cardClass}" id="order-${order.id}">
                <div class="order-header">
                    <h3>Commande de ${order.prenom} ${order.nom}</h3>
                    <span class="order-date"><i class="fa-regular fa-calendar"></i> ${order.date}</span>
                </div>
                <div class="order-details">
                    <p><strong><i class="fa-solid fa-gift"></i> Peluche(s) :</strong> ${order.pelucheDetails || order.peluche}</p>
                    <p><strong><i class="fa-solid fa-ruler"></i> Taille :</strong> ${order.taille || 'Non spécifiée'}</p>
                    <p><strong><i class="fa-solid fa-palette"></i> Couleurs :</strong> ${order.colorDetails || `Principale: ${order.colorPrimary || 'Non specifiee'}, Secondaire: ${order.colorSecondary || 'Non specifiee'}`}</p>
                    <p><strong><i class="fa-solid fa-euro-sign"></i> Tarif total :</strong> ${order.totalPrice || 'A definir'}</p>
                    ${order.message ? `<p><strong><i class="fa-solid fa-comment"></i> Message :</strong> ${order.message}</p>` : ''}
                </div>
                <div class="order-footer">
                    <select class="order-status ${statusClass}" onchange="changeStatus(${order.id}, this.value)">
                        <option value="En attente" ${order.status === 'En attente' ? 'selected' : ''}>En attente</option>
                        <option value="En cours" ${order.status === 'En cours' ? 'selected' : ''}>En cours</option>
                        <option value="Terminé" ${order.status === 'Terminé' ? 'selected' : ''}>Terminé</option>
                    </select>
                    <button class="btn-delete" onclick="deleteOrder(${order.id})" title="Supprimer la commande"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    ordersList.innerHTML = html;
}

function changeStatus(orderId, newStatus) {
    let orders = JSON.parse(localStorage.getItem('lolaOrders') || '[]');
    const index = orders.findIndex(o => o.id === orderId);

    if (index !== -1) {
        orders[index].status = newStatus;
        localStorage.setItem('lolaOrders', JSON.stringify(orders));
        loadOrders(); // Recharger la liste pour mettre à jour l'affichage
    }
}

function deleteOrder(orderId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
        let orders = JSON.parse(localStorage.getItem('lolaOrders') || '[]');
        orders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('lolaOrders', JSON.stringify(orders));
        loadOrders(); // Recharger la liste
    }
}
