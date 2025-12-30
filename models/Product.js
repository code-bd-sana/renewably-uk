import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  Measures: String,
  Year: { type: Number, default: 0 },
  Month: { type: Number, default: 0 },
  Days: { type: Number, default: 0 },
  'Price Contract Value <£10,000': String,
  'Price Contract Value <£15,000': String,
  'Price Contract Value <£30,000': String,
  'Price Contract Value <£50,000': String,
  'Transaction Type': { type: String, default: 'Insurance Backed Guarantee' },
  'Approved Measures': String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Remove the pre-save hook completely
// productSchema.pre('save', function() {
//   this.updatedAt = new Date();
// });

export default mongoose.models.Product || mongoose.model('Product', productSchema);