function selectPlushie(plushieName) {
    // Cocher la case correspondante
    const checkbox = document.getElementById('chk-' + plushieName);
    if (checkbox) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change'));
    }

    // Scroller doucement vers le formulaire
    const formSection = document.getElementById('commander');
    formSection.scrollIntoView({
        behavior: 'smooth'
    });

    // Ajouter une petite animation pour attirer l'attention sur le groupe de cases
    const checkboxGroup = document.getElementById('peluche-group');
    if (checkboxGroup) {
        checkboxGroup.style.transition = 'all 0.3s ease';
        checkboxGroup.style.backgroundColor = '#ffe4e1';
        checkboxGroup.style.borderRadius = '12px';
        checkboxGroup.style.padding = '10px';
        setTimeout(() => {
            checkboxGroup.style.backgroundColor = 'transparent';
        }, 1500);
    }
}

// Gestion de la soumission du formulaire
document.addEventListener('DOMContentLoaded', () => {
    const orderForm = document.getElementById('orderForm');
    const successMessage = document.getElementById('successMessage');
    const surMesureCheckbox = document.getElementById('chk-Sur mesure');
    const customSizeGroup = document.getElementById('custom-size-group');
    const tailleSelect = document.getElementById('taille');
    const plushieCheckboxes = document.querySelectorAll('input[name="peluche"]');
    const colorConfigList = document.getElementById('color-config-list');
    const colorConfigGroup = document.getElementById('color-config-group');
    const liveTotalPrice = document.getElementById('live-total-price');
    const liveTotalGroup = document.getElementById('live-total-group');
    const qtyInfoText = document.getElementById('qty-info-text');
    const colorChoices = [
        'De base',
        'Rouge',
        'Orange',
        'Jaune',
        'Vert',
        'Bleu',
        'Lavande',
        'Rose',
        'Marron',
        'Beige',
        'Blanc',
        'Gris fonce',
        'Noir',
        'Laisser la creatrice choisir'
    ];
    function updatePlushieQtyVisibility(checkbox) {
        const qtyInput = checkbox.closest('label')?.querySelector('.plushie-qty');
        if (!qtyInput) return;
        qtyInput.style.display = checkbox.checked ? 'inline-block' : 'none';
        if (!checkbox.checked) qtyInput.value = 1;
    }

    const colorSelections = new Map();

    function getColorConfigKey(plushieName, index, kind) {
        return `${plushieName}::${index}::${kind}`;
    }

    function saveCurrentColorSelections() {
        const colorConfigItems = document.querySelectorAll('.color-config-item');
        colorConfigItems.forEach((item) => {
            const plushieName = item.getAttribute('data-plushie');
            const index = item.getAttribute('data-index');
            const primary = item.querySelector('.color-primary')?.value || '';
            const secondary = item.querySelector('.color-secondary')?.value || '';
            colorSelections.set(getColorConfigKey(plushieName, index, 'primary'), primary);
            colorSelections.set(getColorConfigKey(plushieName, index, 'secondary'), secondary);
        });
    }

    function buildColorSelectHtml(kind, selectedValue = '') {
        const placeholder = kind === 'primary' ? 'Couleur principale' : 'Couleur secondaire';
        const extraOption = kind === 'secondary' ? '<option value="Pas de couleur secondaire">Pas de couleur secondaire</option>' : '';
        const baseOptions = colorChoices
            .map((color) => `<option value="${color}"${selectedValue === color ? ' selected' : ''}>${color}</option>`)
            .join('');
        const shouldSelectExtra = kind === 'secondary' && selectedValue === 'Pas de couleur secondaire';
        const placeholderSelected = selectedValue ? '' : ' selected';
        return `
            <select class="color-${kind}" required>
                <option value="" disabled${placeholderSelected}>${placeholder}</option>
                ${baseOptions}
                ${kind === 'secondary'
                    ? `<option value="Pas de couleur secondaire"${shouldSelectExtra ? ' selected' : ''}>Pas de couleur secondaire</option>`
                    : extraOption}
            </select>
        `;
    }

    function renderColorConfigs() {
        if (!colorConfigList || !colorConfigGroup) return;
        saveCurrentColorSelections();
        const checkedBoxes = document.querySelectorAll('input[name="peluche"]:checked');
        const hasStandardSelected = Array.from(checkedBoxes).some((checkbox) => checkbox.value !== 'Autre (Sur mesure)');
        colorConfigGroup.style.display = hasStandardSelected ? 'block' : 'none';
        let html = '';

        checkedBoxes.forEach((checkbox) => {
            const plushieName = checkbox.value;
            if (plushieName === 'Autre (Sur mesure)') {
                return;
            }
            const qtyInput = checkbox.closest('label')?.querySelector('.plushie-qty');
            const qty = parseInt(qtyInput?.value, 10);
            const safeQty = Number.isInteger(qty) && qty > 0 ? qty : 0;

            for (let i = 1; i <= safeQty; i++) {
                const savedPrimary = colorSelections.get(getColorConfigKey(plushieName, String(i), 'primary')) || '';
                const savedSecondary = colorSelections.get(getColorConfigKey(plushieName, String(i), 'secondary')) || '';
                html += `
                    <div class="form-row color-config-item" data-plushie="${plushieName}" data-index="${i}">
                        <div class="form-group">
                            <label>${plushieName} #${i} - Couleur Principale</label>
                            ${buildColorSelectHtml('primary', savedPrimary)}
                        </div>
                        <div class="form-group">
                            <label>${plushieName} #${i} - Couleur Secondaire</label>
                            ${buildColorSelectHtml('secondary', savedSecondary)}
                        </div>
                    </div>
                `;
            }
        });

        colorConfigList.innerHTML = html;
    }

    plushieCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            updatePlushieQtyVisibility(checkbox);
            if (checkbox.id === 'chk-Sur mesure') {
                updateCustomSizeVisibility();
            }
            renderColorConfigs();
            updateInfoVisibility();
            updateLiveTotalPrice();
        });
        const qtyInput = checkbox.closest('label')?.querySelector('.plushie-qty');
        if (qtyInput) {
            qtyInput.addEventListener('input', () => {
                renderColorConfigs();
                updateInfoVisibility();
                updateLiveTotalPrice();
            });
        }
        updatePlushieQtyVisibility(checkbox);
    });
    const fixedSizes = {
        'Abeille': 'Petite',
        'Baleine': 'Petite',
        'Cochon': 'Moyenne',
        'Demogorgon': 'Grande',
        'Herisson': 'Moyenne',
        'Lapin': 'Petite',
        'Lune': 'Moyenne',
        'Soleil': 'Moyenne',
        'Pingouin': 'Petite',
        'Tortue': 'Moyenne',
        'Raie': 'Petite',
        'Steve le Poisson': 'Moyenne'
    };
    const fixedPrices = {
        'Abeille': 8,
        'Baleine': 8,
        'Cochon': 12,
        'Demogorgon': 15,
        'Herisson': 12,
        'Lapin': 8,
        'Lune': 12,
        'Soleil': 12,
        'Pingouin': 8,
        'Tortue': 12,
        'Raie': 8,
        'Steve le Poisson': 12
    };
    const customSizePrices = {
        'Mini': 5,
        'Petit': 8,
        'Moyen': 12,
        'Grand': 15,
        'Tres grand': 18
    };

    function normalizeText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase();
    }

    const normalizedFixedPrices = Object.entries(fixedPrices).reduce((acc, [name, price]) => {
        acc[normalizeText(name)] = price;
        return acc;
    }, {});

    function getFixedUnitPrice(plushieName) {
        if (typeof fixedPrices[plushieName] === 'number') {
            return fixedPrices[plushieName];
        }
        return normalizedFixedPrices[normalizeText(plushieName)] || 0;
    }

    function getSelectedItemsFromForm() {
        const checkedBoxes = document.querySelectorAll('input[name="peluche"]:checked');
        return Array.from(checkedBoxes).map(cb => {
            const qtyInput = cb.closest('label')?.querySelector('.plushie-qty');
            const qty = parseInt(qtyInput?.value, 10);
            return { name: cb.value, qty: Number.isInteger(qty) && qty > 0 ? qty : 0 };
        });
    }

    function updateLiveTotalPrice() {
        if (!liveTotalPrice || !liveTotalGroup) return;
        const selectedItems = getSelectedItemsFromForm();
        const hasSelectedItems = selectedItems.length > 0;
        liveTotalGroup.style.display = hasSelectedItems ? 'block' : 'none';

        const surMesureItem = selectedItems.find(item => item.name === 'Autre (Sur mesure)');
        const hasSurMesure = Boolean(surMesureItem);
        const standardItems = selectedItems.filter(item => item.name !== 'Autre (Sur mesure)');
        const totalStandard = standardItems.reduce((sum, item) => {
            return sum + (getFixedUnitPrice(item.name) * item.qty);
        }, 0);
        const selectedSurMesureSize = tailleSelect ? tailleSelect.value : '';
        const surMesureUnitPrice = customSizePrices[selectedSurMesureSize] || 0;
        const surMesureEstimated = hasSurMesure ? surMesureUnitPrice * surMesureItem.qty : 0;
        const totalEstimated = totalStandard + surMesureEstimated;

        if (!hasSelectedItems) {
            liveTotalPrice.textContent = '0€';
            return;
        }

        if (hasSurMesure) {
            if (surMesureUnitPrice > 0) {
                liveTotalPrice.textContent = `${totalEstimated}€ (inclut une estimation sur mesure, prix final non fixe)`;
            } else {
                liveTotalPrice.textContent = `${totalStandard}€ + sur mesure a estimer (prix non fixe)`;
            }
            return;
        }

        liveTotalPrice.textContent = `${totalEstimated}€`;
    }

    function updateCustomSizeVisibility() {
        if (!surMesureCheckbox || !customSizeGroup || !tailleSelect) return;

        if (surMesureCheckbox.checked) {
            customSizeGroup.style.display = 'block';
            tailleSelect.required = true;
        } else {
            customSizeGroup.style.display = 'none';
            tailleSelect.required = false;
            tailleSelect.selectedIndex = 0;
        }
        updateLiveTotalPrice();
    }

    function updateInfoVisibility() {
        if (!qtyInfoText) return;
        const hasSelected = document.querySelectorAll('input[name="peluche"]:checked').length > 0;
        qtyInfoText.style.display = hasSelected ? 'block' : 'none';
    }

    renderColorConfigs();
    updateInfoVisibility();
    updateLiveTotalPrice();
    if (tailleSelect) {
        tailleSelect.addEventListener('change', updateLiveTotalPrice);
    }

    if (surMesureCheckbox) {
        surMesureCheckbox.addEventListener('change', updateCustomSizeVisibility);
        updateCustomSizeVisibility();
    }

    if (orderForm) {
        orderForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Empêcher le rechargement de la page

            // Récupérer les valeurs
            const prenom = document.getElementById('prenom').value;
            const nom = document.getElementById('nom').value;
            const message = document.getElementById('message').value;
            // Récupérer toutes les peluches cochées
            const checkedBoxes = document.querySelectorAll('input[name="peluche"]:checked');
            if (checkedBoxes.length === 0) {
                alert('Veuillez sélectionner au moins une peluche avant de commander ! 🧸');
                return;
            }

            const selectedItems = Array.from(checkedBoxes).map(cb => {
                const qtyInput = cb.closest('label')?.querySelector('.plushie-qty');
                const qty = parseInt(qtyInput?.value, 10);
                return { name: cb.value, qty: qty };
            });

            if (selectedItems.some(item => !Number.isInteger(item.qty) || item.qty < 1)) {
                alert('Veuillez renseigner une quantite valide (minimum 1) pour chaque peluche selectionnee.');
                return;
            }

            const selectedPlushies = selectedItems.map(item => item.name);
            const peluchesList = selectedItems.map(item => `${item.name} x${item.qty}`).join(', ');
            const hasSurMesure = selectedPlushies.includes('Autre (Sur mesure)');
            const standardItems = selectedItems.filter(item => item.name !== 'Autre (Sur mesure)');

            const colorConfigItems = document.querySelectorAll('.color-config-item');
            if (standardItems.length > 0 && colorConfigItems.length === 0) {
                alert('Veuillez choisir au moins une couleur pour vos peluches.');
                return;
            }

            const colorConfigs = [];
            let hasMissingColor = false;
            colorConfigItems.forEach((item) => {
                const plushie = item.getAttribute('data-plushie');
                const index = item.getAttribute('data-index');
                const primary = item.querySelector('.color-primary')?.value || '';
                const secondary = item.querySelector('.color-secondary')?.value || '';
                if (!primary || !secondary) {
                    hasMissingColor = true;
                    return;
                }
                colorConfigs.push({
                    plushie,
                    index,
                    primary,
                    secondary
                });
            });

            if (hasMissingColor) {
                alert('Veuillez choisir les couleurs principale et secondaire pour chaque peluche.');
                return;
            }

            const colorDetails = colorConfigs
                .map(cfg => `${cfg.plushie} #${cfg.index}: ${cfg.primary} / ${cfg.secondary}`)
                .join(' | ');
            const finalColorDetails = hasSurMesure
                ? `${colorDetails || 'Aucune couleur standard'}${colorDetails ? ' | ' : ''}Sur mesure: couleurs precisees dans le message`
                : colorDetails;

            if (hasSurMesure && tailleSelect && !tailleSelect.value) {
                alert('Veuillez indiquer une taille pour votre demande sur mesure. 🧵');
                return;
            }

            const fixedSizesSummary = selectedPlushies
                .filter(name => name !== 'Autre (Sur mesure)')
                .map(name => {
                    const item = selectedItems.find(i => i.name === name);
                    return `${name} x${item.qty} (${fixedSizes[name] || 'Taille fixe'})`;
                })
                .join(', ');

            let tailleInfo = fixedSizesSummary || 'Taille fixe selon le modele';
            if (hasSurMesure && tailleSelect) {
                tailleInfo += ` | Sur mesure demande: ${tailleSelect.value} (modifiable selon possibilites)`;
            }

            const totalStandard = standardItems.reduce((sum, item) => {
                return sum + (getFixedUnitPrice(item.name) * item.qty);
            }, 0);
            const selectedSurMesureSize = tailleSelect ? tailleSelect.value : '';
            const surMesureUnitPrice = customSizePrices[selectedSurMesureSize] || 0;
            const surMesureItem = selectedItems.find(item => item.name === 'Autre (Sur mesure)');
            const surMesureEstimated = (hasSurMesure && surMesureItem && surMesureUnitPrice > 0)
                ? surMesureItem.qty * surMesureUnitPrice
                : 0;
            const estimatedTotal = totalStandard + surMesureEstimated;
            const totalPrice = hasSurMesure
                ? (surMesureUnitPrice > 0
                    ? `${estimatedTotal}€ (inclut une estimation sur mesure, prix final non fixe)`
                    : `${totalStandard}€ + sur mesure a estimer (prix non fixe)`)
                : `${estimatedTotal}€`;

            console.log(`Nouvelle commande de ${prenom} ${nom} pour: ${peluchesList} (${tailleInfo}) (${finalColorDetails}) - Total: ${totalPrice}`);

            // Sauvegarder la commande dans le localStorage (pour la page admin)
            const newOrder = {
                id: Date.now(),
                prenom: prenom,
                nom: nom,
                peluche: selectedPlushies.join(', '),
                pelucheDetails: peluchesList,
                taille: tailleInfo,
                colorDetails: finalColorDetails,
                totalPrice: totalPrice,
                message: message,
                date: new Date().toLocaleDateString('fr-FR'),
                status: 'En attente'
            };

            const orders = JSON.parse(localStorage.getItem('lolaOrders') || '[]');
            orders.push(newOrder);
            localStorage.setItem('lolaOrders', JSON.stringify(orders));

            // Envoi de l'email à la créatrice via FormSubmit (méthode AJAX pour ne pas recharger la page)
            const emailCreatrice = "lolabixquerttt@gmail.com";
            
            if (emailCreatrice && emailCreatrice.includes('@')) {
                fetch(`https://formsubmit.co/ajax/${emailCreatrice}`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        Nom: nom,
                        Prénom: prenom,
                        Peluches: selectedPlushies.join(', '),
                        DetailsPeluches: peluchesList,
                        Taille: tailleInfo,
                        CouleursParPeluche: finalColorDetails,
                        TarifTotal: totalPrice,
                        Message: message || "Aucun message supplémentaire.",
                        Date: new Date().toLocaleDateString('fr-FR'),
                        _subject: `🧸 Nouvelle commande de peluche de ${prenom} !` // Sujet de l'email
                    })
                })
                    .then(response => response.json())
                    .then(data => console.log('Email envoyé via FormSubmit :', data))
                    .catch(error => console.log("Erreur d'envoi FormSubmit :", error));
            }

            // Cacher le formulaire et montrer le message de succès
            orderForm.style.display = 'none';
            successMessage.classList.remove('hidden');
            const successText = successMessage.querySelector('p');
            if (successText) {
                successText.textContent = `Votre demande a bien ete enregistree. Je vous contacterai tres bientot pour finaliser les details. Tarif total estime: ${totalPrice}.`;
            }

            // Note: Comme demandé, il n'y a pas de système de paiement.
            // Le formulaire est "simulé" pour la démonstration (vitrine statique).
        });
    }
});
