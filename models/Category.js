const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    emoji: { type: String, default: '💡' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

CategorySchema.pre('validate', function (next) {
  if (this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
