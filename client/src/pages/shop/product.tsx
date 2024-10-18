import { useContext } from "react";
import { ShopContext, IShopContext } from "../../context/shop-context";
import { IProduct } from "../../models/interfaces"

interface Props {
    product: IProduct;
}
export const Product = (props: Props) => {
    const {_id, productName, description, price, stockQuantity, imageURL} = props.product;

        const {addToCart, getCartItemCount} = useContext<IShopContext>(ShopContext);

        const count = getCartItemCount(_id);

    return (
    <div className="product">
        <img src={imageURL}/>{" "}
        <div className="description">
            <h3> {productName} </h3>
            <p> {description}</p>
            <p>${price}</p> 
        </div>

        <button className="add-to-cart-bttn" onClick={() => addToCart(_id)}>
             Add To Cart {count > 0 && <>({count})</>}
        </button>
        <div className="stock-quantity">
            {stockQuantity === 0 && <h1> OUT OF STOCK </h1>}
        </div>
    </div>
    );
}