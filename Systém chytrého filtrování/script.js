document.addEventListener("DOMContentLoaded", () => {
    const categoryButtons = document.querySelectorAll('.category-card');
    const components = document.querySelectorAll('.component');

    

    setTimeout(() => {
        if (!document.body.classList.contains("moje-sestava")) {
            const componentsSection = document.getElementById('components');
            if (componentsSection) {
                componentsSection.style.display = 'flex';
                componentsSection.style.flexWrap = 'wrap';
                componentsSection.style.justifyContent = 'space-between';
            }
        }
    }, 50);
    

    // Přepínání mezi "Komponenty" a "Moje sestava"
    document.getElementById('nav-components').addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.remove("moje-sestava");
        document.getElementById('components').style.display = 'flex'; // Zobrazí komponenty
        document.getElementById('saved-build').style.display = 'none'; // Skryje "Moje sestava"
        document.getElementById('filters-container').style.display = 'block'; // Zobrazí filtry
    });
    

    document.getElementById('nav-build').addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.add("moje-sestava");
        document.getElementById('components').style.display = 'none'; // Skryje komponenty
        document.getElementById('saved-build').style.display = 'block'; // Zobrazí "Moje sestava"
        document.getElementById('filters-container').style.display = 'none'; // Skryje filtry
    });
    

    document.getElementById('apply-filters').addEventListener('click', () => {
        const filters = {
            frameSize: document.getElementById('frame-size').value,
            propellerSize: document.getElementById('propeller-size').value,
            motorSize: document.getElementById('motor-size').value,
            motorKV: document.getElementById('motor-kv').value,
            batteryCells: document.getElementById('battery-cells').value,
            batteryCapacity: document.getElementById('battery-capacity').value,
            escAmp: document.getElementById('esc-amp').value
        };

        components.forEach(component => {
            const category = component.getAttribute('data-category');
            let showComponent = true;

            if (category === "Rámy" && filters.frameSize !== 'all' && component.getAttribute('data-frame-size') !== filters.frameSize) showComponent = false;
            if (category === "Vrtule" && filters.propellerSize !== 'all' && component.getAttribute('data-prop-size') !== filters.propellerSize) showComponent = false;
            if (category === "Motory" && (filters.motorSize !== 'all' && component.getAttribute('data-size') !== filters.motorSize || filters.motorKV !== 'all' && component.getAttribute('data-kv') !== filters.motorKV)) showComponent = false;
            if (category === "ESC" && filters.escAmp !== 'all' && component.getAttribute('data-amp') !== filters.escAmp) showComponent = false;
            if (category === "Baterie" && (filters.batteryCells !== 'all' && component.getAttribute('data-cells') !== filters.batteryCells || filters.batteryCapacity !== 'all' && component.getAttribute('data-capacity') !== filters.batteryCapacity)) showComponent = false;

            component.style.display = showComponent ? 'block' : 'none';
        });
    });

    // Modální okno – zabránění otevření na začátku
    const modal = document.getElementById("component-modal");
    const modalImage = document.getElementById("modal-image");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const modalPrice = document.getElementById("modal-price");
    const closeButton = document.querySelector(".close-button");

    modal.style.display = "none"; // Zajistí, že se neotevře hned po načtení stránky

    function openModal(component) {
        modalImage.src = component.querySelector('img').src;
        modalTitle.innerText = component.querySelector('h3').innerText;
        modalDescription.innerText = "Podrobnosti o komponentě zde.";
        modalPrice.innerText = component.querySelector('.price').innerText;
        modal.style.display = "block";
    }

    closeButton.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", (event) => { if (event.target === modal) modal.style.display = "none"; });

    components.forEach(component => {
        component.addEventListener('click', () => openModal(component));
    });

    const savedComponentsContainer = document.getElementById('saved-components');
    const totalPriceElement = document.getElementById('total-price');
    const clearBuildButton = document.getElementById('clear-build');
    let savedComponents = [];

    function updateSavedComponents() {
        document.querySelectorAll('.saved-category-content').forEach(category => category.innerHTML = '');
        let totalPrice = 0;
    
        savedComponents.forEach(component => {
            const categoryContainer = document.querySelector(`.saved-category[data-category="${component.category}"] .saved-category-content`);
            const categoryHeader = document.querySelector(`.saved-category[data-category="${component.category}"] .category-header`);
            const categoryTitleElement = categoryHeader.querySelector("h3");
            let categoryTotalPriceElement = categoryHeader.querySelector(".category-total-price");
    
            if (!categoryTotalPriceElement) {
                categoryTotalPriceElement = document.createElement('span');
                categoryTotalPriceElement.classList.add('category-total-price');
                categoryHeader.appendChild(categoryTotalPriceElement);
            }
    
            if (categoryContainer) {
                const componentElement = document.createElement('div');
                componentElement.classList.add('saved-component');
                componentElement.innerHTML = `
                    <img src="${component.image}" alt="${component.title}">
                    <h4>${component.title}</h4>
                    <p>${component.price}</p>
                    <input type="number" min="1" value="${component.quantity}" class="quantity-input">
                    <button class="remove-button">Odebrat</button>
                `;
    
                const quantityInput = componentElement.querySelector('.quantity-input');
                quantityInput.addEventListener('input', (e) => {
                    const newQuantity = parseInt(e.target.value) || 1;
                    component.quantity = newQuantity;
                    updateSavedComponents();
                });
    
                componentElement.querySelector('.remove-button').addEventListener('click', () => removeComponentFromBuild(component));
                categoryContainer.appendChild(componentElement);
    
                const categoryComponents = savedComponents.filter(c => c.category === component.category);
                const categoryTotalPrice = categoryComponents.reduce((sum, item) => sum + (item.quantity * Number(item.price.replace(/[^\d]/g, ''))), 0);
                const categoryTotalQuantity = categoryComponents.reduce((sum, item) => sum + item.quantity, 0);
    
                categoryTitleElement.innerText = `${component.category} (${categoryTotalQuantity})`;
                categoryTotalPriceElement.innerText = `Celkem: ${categoryTotalPrice} Kč`;
    
                totalPrice += component.quantity * Number(component.price.replace(/[^\d]/g, ''));
            }
        });
        totalPriceElement.innerText = `Celková cena: ${totalPrice} Kč`;
    }
    

    function addComponentToBuild(componentElement) {
        const title = componentElement.querySelector('h3').innerText;
        const existingComponent = savedComponents.find(c => c.title === title);

        if (existingComponent) {
            existingComponent.quantity += 1;
        } else {
            const component = {
                image: componentElement.querySelector('img').src,
                title: title,
                price: componentElement.querySelector('.price').innerText,
                category: componentElement.getAttribute('data-category'),
                quantity: 1
            };
            savedComponents.push(component);
        }

        updateSavedComponents();
    }

    function removeComponentFromBuild(component) {
        savedComponents = savedComponents.filter(c => c.title !== component.title);
        updateSavedComponents();
    }

    clearBuildButton.addEventListener('click', () => {
        savedComponents = [];
        updateSavedComponents();
    
        // Po vymazání sestavy vynulujeme počty a ceny u kategorií
        document.querySelectorAll('.saved-category').forEach(category => {
            const categoryTitleElement = category.querySelector('h3');
            const categoryTotalPriceElement = category.querySelector('.category-total-price');
    
            if (categoryTitleElement) {
                categoryTitleElement.innerText = categoryTitleElement.innerText.replace(/\(\d+\)/, '(0)');
            }
            if (categoryTotalPriceElement) {
                categoryTotalPriceElement.innerText = 'Celkem: 0 Kč';
            }
        });
    
        // Vynuluje celkovou cenu sestavy
        totalPriceElement.innerText = 'Celková cena: 0 Kč';
    });
    

    components.forEach(component => {
        const addButton = component.querySelector('.add-to-build');
        if (addButton) {
            addButton.addEventListener('click', (e) => {
                e.stopPropagation();
                addComponentToBuild(component);
            });
        }
    });

    document.querySelectorAll('.saved-category').forEach(category => {
        const categoryTitle = category.querySelector('h3');
        const toggleButton = document.createElement('button');
        
        toggleButton.innerText = "Sbalit 🔽";
        toggleButton.classList.add("toggle-category");
        categoryTitle.style.display = "inline-block";
        categoryTitle.style.marginRight = "10px";
        categoryTitle.parentNode.insertBefore(toggleButton, categoryTitle.nextSibling);
        
        toggleButton.addEventListener('click', () => {
            const content = category.querySelector('.saved-category-content');
            if (content.style.display === "none") {
                content.style.display = "block";
                toggleButton.innerText = "Sbalit 🔽";
            } else {
                content.style.display = "none";
                toggleButton.innerText = "Rozbalit ▶️";
            }
        });
    });
});


// Přepínání světlého a tmavého režimu
const themeToggleButton = document.getElementById('theme-toggle');
let isDarkMode = false;

themeToggleButton.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    document.querySelector('header').classList.toggle('dark-mode');
    document.querySelector('main').classList.toggle('dark-mode');
    document.getElementById('saved-build').classList.toggle('dark-mode');
    applyTheme();
});

function applyTheme() {
    const components = document.querySelectorAll('.component, button, #clear-build, .saved-component, .saved-category-content');
    components.forEach(component => {
        component.classList.toggle('dark-mode', isDarkMode);
    });

    if (isDarkMode) {
        themeToggleButton.innerText = '☀️ Světlý režim';
        document.body.style.background = 'linear-gradient(to right, #000428, #004e92)';
        document.getElementById('saved-build').style.background = 'linear-gradient(to right, #000428, #004e92)';

        const savedComponents = document.querySelectorAll('.saved-component');
        savedComponents.forEach(component => {
            component.style.backgroundColor = '#2e2e2e';
            component.style.color = '#ffffff';
            component.style.border = '1px solid #555';
            const title = component.querySelector('h4');
            if (title) title.style.color = '#ffffff';
            const price = component.querySelector('p');
            if (price) price.style.color = '#FFD700';
        });

        const catalogComponents = document.querySelectorAll('.component h3');
        catalogComponents.forEach(title => {
            title.style.color = '#ffffff';
        });

        const addButtons = document.querySelectorAll('.add-to-build, #apply-filters');
        addButtons.forEach(button => {
            button.style.backgroundColor = '#1a5fcc';
            button.style.color = '#ffffff';
        });

        const removeButtons = document.querySelectorAll('.remove-button, #clear-build');
        removeButtons.forEach(button => {
            button.style.backgroundColor = '#cc0000';
            button.style.color = '#ffffff';
        });

    } else {
        themeToggleButton.innerText = '🌙 Tmavý režim';
        document.body.style.background = 'linear-gradient(to right,rgb(146, 52, 245),rgb(60, 131, 253))';
        document.getElementById('saved-build').style.background = 'linear-gradient(to right,rgb(178, 104, 252), #2575fc)';

        const savedComponents = document.querySelectorAll('.saved-component');
        savedComponents.forEach(component => {
            component.style.backgroundColor = '#ffffff';
            component.style.color = '#333';
            component.style.border = '1px solid #ddd';
            const title = component.querySelector('h4');
            if (title) title.style.color = '#333';
            const price = component.querySelector('p');
            if (price) price.style.color = '#2575fc';
        });

        const catalogComponents = document.querySelectorAll('.component h3');
        catalogComponents.forEach(title => {
            title.style.color = '#333';
        });

        const addButtons = document.querySelectorAll('.add-to-build, #apply-filters');
        addButtons.forEach(button => {
            button.style.backgroundColor = '#2575fc';
            button.style.color = '#ffffff';
        });

        const removeButtons = document.querySelectorAll('.remove-button, #clear-build');
        removeButtons.forEach(button => {
            button.style.backgroundColor = '#ff4d4d';
            button.style.color = '#ffffff';
        });
    }
}


// Zajištění, že tmavý/světlý režim zůstane i po úpravách v "Moje sestava"
const savedComponentsContainer = document.getElementById('saved-components');

if (savedComponentsContainer) {
    const observer = new MutationObserver(applyTheme);
    observer.observe(savedComponentsContainer, { childList: true, subtree: true });
}


const style = document.createElement('style');
style.innerHTML = `
    .quantity-container {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
    }

    .quantity-input {
        width: 50px;
        padding: 5px;
        text-align: center;
        font-size: 1rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        margin-right: 10px;
    }

    .saved-component {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }

    .remove-button {
        margin-left: auto;
    }
`;
document.head.appendChild(style);

document.querySelectorAll(".category-link").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const category = link.getAttribute("data-category");
        filterComponentsByCategory(category);
    });
});

function filterComponentsByCategory(category) {
    const components = document.querySelectorAll(".component");

    components.forEach(component => {
        const componentCategory = component.getAttribute("data-category");
        if (category === "all" || componentCategory === category) {
            component.style.display = "block";
        } else {
            component.style.display = "none";
        }
    });
}

// Vytvoření oznámení v HTML
const notification = document.createElement("div");
notification.id = "notification";
notification.innerText = "Přidáno do sestavy!";
document.body.appendChild(notification);

// Funkce pro zobrazení oznámení
function showNotification() {
    notification.classList.add("show");

    // Skryjeme oznámení po 2,5 sekundách
    setTimeout(() => {
        notification.classList.remove("show");
    }, 2500);
}

// Přidáme event listener na tlačítka "Přidat do sestavy"
document.querySelectorAll('.add-to-build').forEach(button => {
    button.addEventListener('click', (event) => {
        showNotification();

        // Efekt blikání tlačítka
        const clickedButton = event.target;
        clickedButton.classList.add("blink");

        // Po 0.5s odstraníme třídu, aby bylo možné efekt opakovat
        setTimeout(() => {
            clickedButton.classList.remove("blink");
        }, 500);
    });
});


// filtrování

document.addEventListener("DOMContentLoaded", () => {
    const components = document.querySelectorAll('.component');
    const savedComponentsContainer = document.getElementById('saved-components');
    let selectedComponents = {};

    function updateComponents() {
        components.forEach(component => {
            const category = component.getAttribute('data-category');
            let showComponent = true;

            // Skryje všechny ostatní komponenty v dané kategorii, kromě ESC
            if (category !== "ESC" && selectedComponents[category] && selectedComponents[category] !== component) {
                showComponent = false;
            }

            if (selectedComponents["Rámy"] && category === "Motory") {
                const frameSize = selectedComponents["Rámy"].getAttribute('data-frame-size');
                const motorSize = component.getAttribute('data-size');
                showComponent = (frameSize === "2.5" && motorSize === "11xx") ||
                               (frameSize === "5" && motorSize === "22xx") ||
                               (frameSize === "7" && motorSize === "28xx");
            }

            if (selectedComponents["Motory"] && category === "ESC") {
                const motorSize = selectedComponents["Motory"].getAttribute('data-size');
                const escType = component.getAttribute('data-esc-type');
                showComponent = (motorSize === "11xx" && escType === "20A") ||
                               (motorSize === "22xx" && escType === "35A") ||
                               (motorSize === "28xx" && escType === "45A");
            }

            if (selectedComponents["Motory"] && category === "Vrtule") {
                const motorSize = selectedComponents["Motory"].getAttribute('data-size');
                const propSize = component.getAttribute('data-prop-size');
                showComponent = (motorSize === "11xx" && propSize === "2.5") ||
                               (motorSize === "22xx" && propSize === "5") ||
                               (motorSize === "28xx" && propSize === "7");
            }

            if (selectedComponents["FPV kamery"] && category === "VTX") {
                const cameraType = selectedComponents["FPV kamery"].getAttribute('data-resolution');
                const vtxType = component.getAttribute('data-type');
                showComponent = (cameraType === "1080p" && vtxType === "digital") ||
                               (cameraType === "720p" && vtxType === "analog");
            }

            if (selectedComponents["VTX"] && category === "FPV brýle") {
                const vtxType = selectedComponents["VTX"].getAttribute('data-type');
                const gogglesType = component.getAttribute('data-type');
                showComponent = vtxType === gogglesType;
            }

            if (selectedComponents["Motory"] && selectedComponents["ESC"] && category === "Baterie") {
                const escType = selectedComponents["ESC"].getAttribute('data-esc-type');
                const batteryCells = component.getAttribute('data-cells');
                showComponent = (escType === "20A" && batteryCells === "4S") ||
                               (escType === "35A" && batteryCells === "6S") ||
                               (escType === "45A" && batteryCells === "6S");
            }

            if (selectedComponents["Baterie"] && category === "PDB") {
                const batteryCells = selectedComponents["Baterie"].getAttribute('data-cells');
                const pdbVoltage = component.getAttribute('data-voltage');
                showComponent = (batteryCells === "4S" && pdbVoltage === "16V") ||
                               (batteryCells === "6S" && pdbVoltage === "24V");
            }

            // Pokud je vybrané ESC, skryje ostatní komponenty této kategorie
            if (selectedComponents["ESC"] && category === "ESC" && selectedComponents["ESC"] !== component) {
                showComponent = false;
            }

            component.style.display = showComponent ? 'block' : 'none';
        });
    }

    function addComponentToBuild(component) {
        const category = component.getAttribute('data-category');
        selectedComponents[category] = component;
        
        components.forEach(comp => {
            if (comp.getAttribute('data-category') === category && comp !== component) {
                comp.style.display = 'none';
            }
        });
        
        const categoryContainer = savedComponentsContainer.querySelector(`.saved-category[data-category="${category}"] .saved-category-content`);
        if (categoryContainer) {
            categoryContainer.innerHTML = '';
            
            const savedComponent = document.createElement('div');
            savedComponent.classList.add('saved-component');
            savedComponent.innerHTML = `
                <h4>${component.querySelector('h3').innerText}</h4>
                <button class="remove-button">Odebrat</button>
            `;
            
            savedComponent.querySelector('.remove-button').addEventListener('click', () => {
                removeComponentFromBuild(category);
            });
            categoryContainer.appendChild(savedComponent);
        }
        updateComponents();
    }

    function removeComponentFromBuild(category) {
        delete selectedComponents[category];
        
        components.forEach(comp => {
            if (comp.getAttribute('data-category') === category) {
                comp.style.display = 'block';
            }
        });
        updateComponents();
    }

    components.forEach(component => {
        const addButton = component.querySelector('.add-to-build');
        if (addButton) {
            addButton.addEventListener('click', (e) => {
                e.stopPropagation();
                addComponentToBuild(component);
            });
        }
    });

    updateComponents();
});
