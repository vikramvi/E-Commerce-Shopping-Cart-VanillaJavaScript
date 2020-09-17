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
            let result = await fetch('products.json');
            let data = await result.json();

            //console.log(data);

            const products = data.items.map((item) => {
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
                        add to bag
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
                console.log(cartItem);
            });
        })
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

}


//----- Global Event listener

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    //get all products & show on the screen
    products.getProducts().then(products => {

        //display products
        ui.displayProducts(products)

        //store products locally
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
    });

});
