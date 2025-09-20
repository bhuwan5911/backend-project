const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Load product data from a JSON file
const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Set up middleware
app.set('view engine', 'ejs');
app.use(session({
    secret: 'my-super-secret-key-12345',
    resave: false,
    saveUninitialized: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'public' folder.
// This must be placed BEFORE any of your routes.
app.use(express.static('public'));

// Define all routes
app.get('/', (req, res) => {
    res.render('home', { products: products });
});

app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);

    if (!product) {
        return res.status(404).send('Product not found!');
    }

    res.render('product', { product: product });
});

app.post('/cart/add', (req, res) => {
    const productId = parseInt(req.body.productId);
    const product = products.find(p => p.id === productId);

    if (!product) {
        return res.status(404).json({ message: 'Product not found!' });
    }

    if (!req.session.cart) {
        req.session.cart = [];
    }

    req.session.cart.push(product);
    res.redirect('/cart');
});

app.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    res.render('cart', { cart: cart });
});

app.get('/about', (req, res) => {
    res.render('about');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});