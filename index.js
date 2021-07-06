const cartBtn = document.querySelector(".cart-button");
const cartItemsCount=document.querySelector(".cart-count");
const closeCartBtn=document.querySelector(".close-window");
const clearCartBtn=document.querySelector(".clear-all");
const totalCost=document.querySelector(".total-amount");
const cartBackLayer=document.querySelector(".cart-overlay");
const cart=document.querySelector(".cart");
const productsDOM=document.querySelector(".all-products");
const cartDOM=document.querySelector(".cart-items");
let productsInCart;
let buttonsDOM=[];
// fetct products data
class Products{
    async getAllProducts(){
        try{
            let result=await fetch("./products.json");
            let data = await result.json();
            data = data.items;
            data =data.map(item=>{
                const {title,price}=item.fields;
                const {id}=item.sys;
                const image=item.fields.image.fields.file.url;
                return {id,title,price,image};
            });
            return data;
        }
        catch(error){
            console.log(error);
        }
    }
}

// UI related things
class UI{
    displayProducts(products){
        let productsHTML= ``;
        products.forEach(item => {
            let id = item.id;
            let title=item.title;
            let price=item.price;
            let imagePath=item.image;
            productsHTML+=`<article class="each-product">
                <div class="product-image-container">
                    <img class="product-image" src=${imagePath} alt="product img">
                    <button class="bag-btn" data-id=${id}>
                        <i class="fas fa-shopping-cart cart-icon"></i>Add to Cart
                    </button>
                </div>
                <div class="product-detail">
                    <h3>${title}</h3>
                    <h4 class="price">$${price}</h4>
                </div>
            </article>`
        });
        productsDOM.innerHTML=productsHTML;
    }
    addCartListeners(){
        const addToCartBtns=[...document.querySelectorAll(".bag-btn")];
        buttonsDOM=addToCartBtns;
        addToCartBtns.forEach(button=>{
            let id = button.dataset.id;
            let inCart=productsInCart.find(item=>item.id===id);
            if (inCart){
                button.innerText="In cart";
                button.disabled=true;
            }
            button.addEventListener("click",event=>{
                    let clickedBtn=event.currentTarget;
                    let id = clickedBtn.dataset.id;
                    clickedBtn.innerText="In Cart";
                    clickedBtn.disabled=true;
                    // getting product that clicked for add to cart
                    let item=Storage.getItems(id,"products");
                    item={...item,amount:1};
                    // adding item to the cart 
                    productsInCart=[...productsInCart,item];
                    // store cart items in localStorage
                    Storage.setItems("productsInCart",productsInCart)
                    // set cart values
                    this.setCartvalues(productsInCart);
                    //display cart items
                    this.createCartItems(item);
                    this.showCart();
            });
        })       
    }
    setCartvalues(cart){
        let totalPrice=0;
        let totalItems=0;
        productsInCart.forEach(item=>{
            totalPrice+=item.amount*item.price;
            totalItems+=item.amount;
        });
        totalPrice=parseFloat(totalPrice.toFixed(2));
        cartItemsCount.innerText=totalItems;
        totalCost.innerText=totalPrice;
    }
    createCartItems(item){
        let div=document.createElement("div");
        div.classList.add("each-cart-item");
        div.innerHTML=`<div class="cart-img">
                        <img src=${item.image} alt="cart image">
                    </div>
                    <div class="cart-item-detail">
                        <h3>${item.title}</h3>
                        <h4>$${item.price}</h4>
                        <span class="remove" data-id=${item.id}>remove</span>   
                    </div>
                    <div class="cart-side">
                        <i class="fas fa-angle-up" data-id=${item.id}></i>
                        <p class="item-count">${item.amount}</p>
                        <i class="fas fa-angle-down" data-id=${item.id}></i>
                    </div>`;
        cartDOM.appendChild(div);
    }
    showCart(){
        cartBackLayer.classList.add("transparentBcg");
        cart.classList.add("showCart");
    }
    setupAPP(){
        productsInCart=Storage.getAllCartProducts();
        this.setCartvalues(productsInCart);
        this.initializeCart(productsInCart);
        cartBtn.addEventListener("click",this.showCart);
        closeCartBtn.addEventListener("click",this.hideCart);
}
    initializeCart(cart){
        cart.forEach(item=>{
            this.createCartItems(item);
        });
    }
    hideCart(){
        cartBackLayer.classList.remove("transparentBcg");
        cart.classList.remove("showCart");
    }
    cartLogic(){
        // clear all
        clearCartBtn.addEventListener("click",()=>{
            this.clearCart();
        });
        // handle specific item
        cartDOM.addEventListener("click",(event)=>{
            if (event.target.classList.contains("remove")){
                let clicked=event.target;
                let id =clicked.dataset.id;
                this.removeCartItem(id);
                cartDOM.removeChild(clicked.parentElement.parentElement);
            }
            else if(event.target.classList.contains("fa-angle-up")){
                let clicked =event.target;
                let id =event.target.dataset.id;
                let clickedItem=productsInCart.find(item=>item.id === id);
                clickedItem.amount+=1;
                this.setCartvalues(cart);
                Storage.setItems("productsInCart",productsInCart);
                clicked.nextElementSibling.innerText=clickedItem.amount;
            }
            else if (event.target.classList.contains("fa-angle-down")){
                let clicked=event.target;
                let id =event.target.dataset.id;
                let clickedItem=productsInCart.find(item=>item.id===id);
                if (clickedItem.amount>1){
                    clickedItem.amount-=1;
                    this.setCartvalues(cart);
                    Storage.setItems("productsInCart",productsInCart);
                    clicked.previousElementSibling.innerText=clickedItem.amount;
                }
                else{
                this.removeCartItem(id);
                cartDOM.removeChild(clicked.parentElement.parentElement);  
                }
            }
        }); 
    }
    clearCart(){
        let cartItemIDs=productsInCart.map(item=>item.id);
        cartItemIDs.forEach(id=>{
            this.removeCartItem(id);
        })
        this.clearCartDOM();
        this.hideCart();
    }
    removeCartItem(id){
        productsInCart=productsInCart.filter(item=>item.id !==id);
        this.setCartvalues(productsInCart);
        Storage.setItems("productsInCart",productsInCart);
        let button=this.getSingleButton(id);
        button.innerHTML=`<i class="fas fa-shopping-cart cart-icon"></i>Add to Cart`;
        button.disabled=false;
    }
    getSingleButton(id){
        return buttonsDOM.find(button=>button.dataset.id===id);
    }
    clearCartDOM(){
        while(cartDOM.children.length>0){
            cartDOM.removeChild(cartDOM.children[0]);
        }
    }
}
class Storage{
    static setItems(name,data){
       localStorage.setItem(name,JSON.stringify(data));
    }
    static getItems(id,dataName){
        let products=localStorage.getItem(dataName);
        products=JSON.parse(products);
        let item=products.find(item=>item.id==id);
        return item;
    }
    static getAllCartProducts(){
        return localStorage.getItem("productsInCart")?JSON.parse(localStorage.getItem("productsInCart")):[];
    }

}
document.addEventListener("DOMContentLoaded",()=>{
    const products=new Products();
    const ui  = new UI();
    ui.setupAPP();
    products.getAllProducts().then(products=>{
        ui.displayProducts(products);
        Storage.setItems("products",products);
    }).then(()=>{
      ui.addCartListeners(products);
      ui.cartLogic();
    });
});










