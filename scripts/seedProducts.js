// Use CommonJS syntax for Node.js script
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables if needed
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable in .env.local');
  process.exit(1);
}

// Define Product Schema
const productSchema = new mongoose.Schema({
  Measures: String,
  Year: { type: Number, default: 0 },
  Month: { type: Number, default: 0 },
  Days: { type: Number, default: 0 },
  'Price Contract Value <£10,000': String,
  'Price Contract Value <£15,000': String,
  'Price Contract Value <£30,000': String,
  'Price Contract Value <£50,000': String,
  'Transaction Type': String,
  'Approved Measures': String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Get or create model
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function seedProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read JSON data
    const jsonPath = path.join(__dirname, '..', 'data', 'products.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const productsData = JSON.parse(jsonData);

    console.log(`Read ${productsData.length} records from JSON file`);

    // Clear existing products
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Existing products cleared');

    // Filter and transform data
    const validProducts = productsData
      .filter(product => 
        product.Measures && 
        product.Measures.trim() !== '' && 
        product['Put Y if want to include'] === 'Y'
      )
      .map(product => ({
        Measures: product.Measures,
        Year: product.Year === '' ? 0 : Number(product.Year) || 0,
        Month: product.Month === '' ? 0 : Number(product.Month) || 0,
        Days: product.Days === '' ? 0 : Number(product.Days) || 0,
        'Price Contract Value <£10,000': product['Price Contract Value <£10,000'],
        'Price Contract Value <£15,000': product['Price Contract Value <£15,000'],
        'Price Contract Value <£30,000': product['Price Contract Value <£30,000'],
        'Price Contract Value <£50,000': product['Price Contract Value <£50,000'],
        'Transaction Type': product['Transaction Type'],
        'Approved Measures': product['Approved Measures']
      }));

    console.log(`Prepared ${validProducts.length} valid products for import`);

    // Insert products
    console.log('Inserting products...');
    await Product.insertMany(validProducts);
    console.log(`Successfully seeded ${validProducts.length} products`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

// Run the seed function
seedProducts();