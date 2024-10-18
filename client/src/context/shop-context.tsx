import { createContext, useEffect, useState } from "react";
import { useGetProducts } from "../hooks/useGetProducts";
import { IProduct } from "../models/interfaces";
import { useGetToken } from "../hooks/useGetToken";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { ProductErrors } from "../models/errors";

export interface IShopContext {
    addToCart: (itemId: string) => void;
    removeFromCart: (itemId: string) => void;
    updateCartItemCount: (newAmount: number, itemId: string) => void;
    getCartItemCount: (itemId: string) => number;
    getTotalCartAmount: () => number;
    checkout: () => void;
    availableMoney: number;
    purchasedItems: IProduct[];
    isAuthenticated: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
  };

const defaultVal: IShopContext = {
    addToCart: () => null,
    removeFromCart: () => null,
    updateCartItemCount: () => null,
    getCartItemCount: () => 0,
    getTotalCartAmount: () => 0,
    checkout: () => null,
    availableMoney: 0,
    purchasedItems: [],
    isAuthenticated: false,
    setIsAuthenticated: () => null,
};

export const ShopContext = createContext<IShopContext>(defaultVal);

export const ShopContextProvider = (props) => {
    const [cookies, setCookies] = useCookies(["access_token"]);
    const [cartItems, setCartItems] = useState<{ string: number } | {}>({});
    const [availableMoney, setAvailableMoney] = useState<number>(0);
    const [purchasedItems, setPurchasedItems] = useState<IProduct[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
      cookies.access_token !== null
    );

    const { products, fetchProducts } = useGetProducts();
    const { headers } = useGetToken();
    const navigate = useNavigate();

    const fetchAvailableMoney = async () => {
      try{
        const res = await axios.get(
          `http://localhost:3001/user/available-money/${localStorage.getItem(
            "userID")}`,
         { headers }
        );

      setAvailableMoney(res.data.availableMoney);
    } catch(err){
      alert("ERROR: Something went wrong.")
    }
    };

    const fetchPurchasedItems = async () => {
      try{
        const res = await axios.get(
          `http://localhost:3001/product/purchased-items/${localStorage.getItem(
            "userID")}`,
         { headers }
        );

      setPurchasedItems(res.data.purchasedItems);
    } catch(err){
      alert("ERROR: Something went wrong.")
    }
    };

    useEffect(() => {
      if(isAuthenticated){
    fetchAvailableMoney();
    fetchPurchasedItems();
      }
  }, [isAuthenticated]);

  useEffect(() => {
    if(!isAuthenticated){
    localStorage.clear();
    setCookies("access_token", null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchProducts(); // Wait for products to be fetched
      // Proceed with logic that depends on products
    };

    fetchData();
  }, [isAuthenticated]);

    const getCartItemCount = (itemId: string): number => {
        if (itemId in cartItems) {
          return cartItems[itemId];
        }
    
        return 0;
      };

      const addToCart = (itemId: string) => {
        if (!cartItems[itemId]) {
          setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
          setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
      };

    const removeFromCart = (itemId: string) => {
      if (!cartItems[itemId]) return;

      const updatedCartItems = { ...cartItems };
  
      if (cartItems[itemId] > 0) {
          updatedCartItems[itemId] = cartItems[itemId] - 1;
  
          if (updatedCartItems[itemId] === 0) {
              delete updatedCartItems[itemId]; // Remove the item if the quantity is 0
          }
  
          setCartItems(updatedCartItems);
      }
    };

    const updateCartItemCount = (newAmount: number, itemId: string) => {
        if (newAmount < 0) return;
    
        const updatedCartItems = { ...cartItems };
    
        if (newAmount === 0) {
            delete updatedCartItems[itemId]; // Remove the item if the new quantity is 0
        } else {
            updatedCartItems[itemId] = newAmount;
        }
    
        setCartItems(updatedCartItems);
    };

    const getTotalCartAmount = () => {

      let totalAmount = 0;
    
      for (const item in cartItems) {

        if  (cartItems[item] > 0) {
          console.log("Passed # of items from cartItems:", cartItems[item]);
          console.log("products in totalcartamount", products)
          let itemInfo: IProduct = products.find((product) => product._id === item);
          console.log(itemInfo)

          if (itemInfo) {
            console.log(`Item ID: ${item}, Quantity: ${cartItems[item]}, Price: ${itemInfo.price}`);
            totalAmount += cartItems[item] * itemInfo.price;
          } else {
            console.error(`Product with ID ${item} not found`);
          }
        }
      }
      return totalAmount;
    };

    const checkout = async () => {
      const body = {customerID: localStorage.getItem("userID"), cartItems};
      try {
        console.log("Cart Items checkout :", cartItems)

        await axios.post("http://localhost:3001/product/checkout", body, {
          headers,
      });
      setCartItems({});
      fetchAvailableMoney();
      fetchPurchasedItems();
      navigate("/");
      } catch (err) {
        let errorMessage: string = "";
        switch (err.response.data.type) {
          case ProductErrors.NO_PRODUCT_FOUND:
            errorMessage = "No product found";
            break;
          case ProductErrors.NO_AVAILABLE_MONEY:
            errorMessage = "Not enough money";
            break;
          case ProductErrors.NOT_ENOUGH_STOCK:
            errorMessage = "Not enough stock";
            break;
          default:
            errorMessage = "Something went wrong";
        }
  
        alert("ERROR: " + errorMessage);
      }
    }
    

    const contextValue: IShopContext = {
        addToCart,
        removeFromCart,
        updateCartItemCount,
        getCartItemCount,
        getTotalCartAmount,
        checkout,
        availableMoney,
        purchasedItems,
        isAuthenticated,
        setIsAuthenticated,
    };

    return (
        <ShopContext.Provider value={contextValue}>
          {props.children}
        </ShopContext.Provider>
      );
    };