let client = contentful.createClient({
    space: 'yt5ymt0en5v1',
    accessToken: '1lbKdZOnWzZP1GIS5LC_9bWWDb5tgNShjnxSsPeq86s'
})

console.log(client);

//variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");

const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");

const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");

const productsDOM = document.querySelector(".products-center");

//cart
let cart = [];
//buttons
let buttonsDOM = [];


//---- Classes and methods

//getting the products
class Products {
    async getProducts() {
        try {
            //contentful data
            let contentful = await client.getEntries({
                content_type: "comfyHouseProducts"
            });
            console.log(contentful);

            //local data
            let result = await fetch('products.json');
            let data = await result.json();

            //console.log(data);

            //local data
            //let products = data.items;

            //cloud data
            let products = contentful.items;

            products = products.map((item) => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image };
            });

            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

//display products
class UI {
    displayProducts(products) {
        //console.log(products);

        let result = "";
        products.forEach(product => {
            result += `<!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img src="${product.image}" alt="Product 1" class="product-img">
                    <button class="bag-btn" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!-- end of single product -->`
        })

        productsDOM.innerHTML = result;

    }

    getBagButtons() {
        //spread operator to create array
        const buttons = [...document.querySelectorAll(".bag-btn")];
        //console.log(buttons);

        buttonsDOM = buttons;

        buttons.forEach(button => {
            let id = button.dataset.id;

            //check if item is already in the cart array
            let inCart = cart.find(item => item.id === id);

            //change button text based on cart status
            if (inCart) {
                button.innerHTML = "In Cart";
                button.disabled = true;
            }

            button.addEventListener("click", event => {
                event.target.innerHTML = "In Cart";
                event.target.disabled = true;

                //get product from products
                let cartItem = Storage.getProduct(id);
                //console.log(cartItem);

                cartItem = { ...Storage.getProduct(id), amount: 1 };
                //console.log(cartItem);

                //add cartItem to cart
                cart = [...cart, cartItem];
                //console.log(cart);

                //save cart in local storage
                Storage.saveCart(cart);

                //set cart values
                this.setCartValues(cart);

                //display cart item
                this.addCartItem(cartItem);

                //show cart
                this.showCart();
            });
        })
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;

        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });

        cartTotal.innerHTML = parseFloat(tempTotal.toFixed(2));
        cartItems.innerHTML = itemsTotal;
        //console.log(cartTotal, cartItems);
    }

    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML =
            `<img src="${item.image}" alt="product 1">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>`;

        cartContent.appendChild(div);
        //console.log(cartContent);
    }

    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }

    setupAPP() {
        //check if local storage has products
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);

        cartBtn.addEventListener('click', this.showCart);

        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    cartLogic() {
        //IMP - points to the button
        //clearCartBtn.addEventListener('click', this.clearCart);

        //points to the class
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        })


        //Cart functionality
        cartContent.addEventListener('click', (event) => {
            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;

                //remove from DOM
                cartContent.removeChild(removeItem.parentElement.parentElement);

                //remove from local storage
                this.removeItem(id);
            } else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;

                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;

                Storage.saveCart(cart);
                this.setCartValues(cart);

                addAmount.nextElementSibling.innerText = tempItem.amount;

            } else if (event.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;

                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;

                if (tempItem.amount > 0) {

                    Storage.saveCart(cart);
                    this.setCartValues(cart);

                    lowerAmount.previousElementSibling.innerText = tempItem.amount;


                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }

            }
        });
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));

        console.log(cartContent.children);

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }

        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);

        this.setCartValues(cart);
        Storage.saveCart(cart);

        let button = this.getSingleButton(id);

        button.disabled = false;
        button.innerHTML = ` <i class="fas fa-shopping-cart"></i>add to cart`;
    }

    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

//local storage
class Storage {

    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    }
}


//----- Global Event listener

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    //setup app
    ui.setupAPP();

    //get all products & show on the screen
    products.getProducts().then(products => {

        //display products
        ui.displayProducts(products)

        //store products locally
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });

});
